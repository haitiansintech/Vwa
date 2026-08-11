import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import auditLogData from '../data/party-monitor/audit-log.json'
import pendingData from '../data/party-monitor/pending-updates.json'
import sourceData from '../data/party-monitor/source-state.json'
import publishedData from '../data/political-party-presence.json'
import {
  CEP_ALLOWLIST,
  CEP_KNOWN_SOURCES,
  createAuditEvent,
  createPendingUpdate,
  extractCepPdfLinks,
  fetchWithConservativeRetry,
  operationalProposalForChannel,
  publicationMayBeRelevant,
  sourceRecordFromFetch,
} from '../lib/party-monitor/audit'
import type {
  AuditLogFile,
  MonitoredSource,
  PendingUpdate,
  PendingUpdatesFile,
  PublishedPresenceFile,
  SourceStateFile,
} from '../lib/party-monitor/types'

type Arguments = {
  dryRun: boolean
  partyId: string | null
  resumeAfter: string | null
}

function parseArguments(values: string[]): Arguments {
  const argument = (name: string) => {
    const index = values.indexOf(name)
    return index >= 0 ? (values[index + 1] ?? null) : null
  }
  return {
    dryRun: values.includes('--dry-run'),
    partyId: argument('--party'),
    resumeAfter: argument('--resume-after'),
  }
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function safeStagingName(url: string) {
  const parsed = new URL(url)
  return `${parsed.hostname}-${path.basename(parsed.pathname) || 'index'}`.replace(
    /[^a-zA-Z0-9._-]/g,
    '-'
  )
}

async function main() {
  const args = parseArguments(process.argv.slice(2))
  const now = new Date().toISOString()
  const published = publishedData as PublishedPresenceFile
  const pending = structuredClone(pendingData) as PendingUpdatesFile
  const sources = structuredClone(sourceData) as SourceStateFile
  const auditLog = structuredClone(auditLogData) as AuditLogFile
  const proposals: PendingUpdate[] = []
  const sourceMap = new Map(sources.sources.map((source) => [source.url, source]))
  const sourceQueue = new Set(CEP_KNOWN_SOURCES)
  const fetchedSources = new Map<string, MonitoredSource>()

  let cepSourceCount = 0
  for (const sourceUrl of sourceQueue) {
    cepSourceCount += 1
    if (cepSourceCount > 25) {
      auditLog.events.push(
        createAuditEvent('source_limit_reached', 'Stopped after 25 CEP sources.', now)
      )
      break
    }
    const sourceHost = new URL(sourceUrl).hostname
    if (!CEP_ALLOWLIST.has(sourceHost))
      throw new Error(`CEP source is not allowlisted: ${sourceUrl}`)
    try {
      const result = await fetchWithConservativeRetry(sourceUrl)
      const previous = sourceMap.get(result.requestedUrl)
      const current = sourceRecordFromFetch(result, now, previous)
      fetchedSources.set(current.url, current)

      if (result.contentType === 'text/html') {
        const html = new TextDecoder().decode(result.body)
        for (const linkedPdf of extractCepPdfLinks(result.finalUrl, html))
          sourceQueue.add(linkedPdf)
      }

      const changed = !previous || previous.contentHash !== current.contentHash
      if (
        changed &&
        publicationMayBeRelevant(
          result.finalUrl,
          result.contentType === 'text/html' ? new TextDecoder().decode(result.body) : ''
        )
      ) {
        const proposal = createPendingUpdate(
          {
            partyId: null,
            changeType: 'cep_publication',
            existingValue: previous ?? null,
            proposedValue: current,
            evidence: [
              {
                description: previous
                  ? 'Official CEP content hash changed.'
                  : 'Official CEP publication first observed.',
                urls: [result.finalUrl],
              },
            ],
            confidence: 'high',
            discoveredAt: now,
            auditedAt: now,
            sourceUrls: [result.finalUrl],
          },
          [...pending.items, ...proposals]
        )
        if (proposal) proposals.push(proposal)
      }

      if (!args.dryRun && changed && result.contentType === 'application/pdf') {
        await mkdir('.party-monitor-staging', { recursive: true })
        await writeFile(
          path.join('.party-monitor-staging', safeStagingName(result.finalUrl)),
          result.body
        )
      }
    } catch (error) {
      auditLog.events.push(
        createAuditEvent(
          'source_check_failed',
          error instanceof Error ? error.message : String(error),
          now
        )
      )
    }
  }

  let records = published.records
  if (args.partyId) records = records.filter((record) => record.partyId === args.partyId)
  if (args.resumeAfter) {
    const resumeIndex = records.findIndex((record) => record.partyId === args.resumeAfter)
    if (resumeIndex >= 0) records = records.slice(resumeIndex + 1)
  }

  for (const record of records) {
    for (const channel of record.channels.filter(
      (item) => item.verificationStatus === 'verified_official'
    )) {
      try {
        const result = await fetchWithConservativeRetry(channel.url)
        const proposal = operationalProposalForChannel(record, channel.id, result, now, [
          ...pending.items,
          ...proposals,
        ])
        if (proposal) proposals.push(proposal)
      } catch (error) {
        const failure = error instanceof Error ? error : new Error(String(error))
        const proposal = operationalProposalForChannel(record, channel.id, failure, now, [
          ...pending.items,
          ...proposals,
        ])
        if (proposal) proposals.push(proposal)
      }
    }
  }

  auditLog.events.push(
    createAuditEvent(
      args.dryRun ? 'audit_dry_run' : 'audit_completed',
      `Checked ${fetchedSources.size} CEP sources and ${records.length} published party records; created ${proposals.length} proposals.`,
      now,
      args.partyId
    )
  )

  if (!args.dryRun) {
    pending.updatedAt = now
    pending.items.push(...proposals)
    for (const source of fetchedSources.values()) sourceMap.set(source.url, source)
    sources.sources = [...sourceMap.values()].sort((a, b) => a.url.localeCompare(b.url))
    await writeJson('data/party-monitor/pending-updates.json', pending)
    await writeJson('data/party-monitor/source-state.json', sources)
    await writeJson('data/party-monitor/audit-log.json', auditLog)
  }

  console.log(
    JSON.stringify(
      {
        dryRun: args.dryRun,
        partyId: args.partyId,
        resumedAfter: args.resumeAfter,
        checkedCepSources: fetchedSources.size,
        checkedPartyRecords: records.length,
        proposedChanges: proposals.length,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
