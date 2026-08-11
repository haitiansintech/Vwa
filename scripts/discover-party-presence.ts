import { readFile, writeFile } from 'node:fs/promises'

import { createAuditEvent, createPendingUpdate } from '../lib/party-monitor/audit'
import { discoverFromSeed } from '../lib/party-monitor/discovery'
import type {
  AuditLogFile,
  PendingUpdate,
  PendingUpdatesFile,
  PlatformClassification,
} from '../lib/party-monitor/types'
import { politicalParties } from '../lib/political-parties'

function argument(name: string) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

async function writeJson(path: string, value: unknown) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function main() {
  const partyId = argument('--party')
  const seedUrl = argument('--url')
  const dryRun = process.argv.includes('--dry-run')
  if (!partyId || !/^cep-\d+$/.test(partyId) || !seedUrl) {
    throw new Error('Usage: --party cep-N --url https://party.example/ [--dry-run]')
  }
  const party = politicalParties.find((item) => `cep-${item.sequence}` === partyId)
  if (!party?.name || party.status !== 'approved') {
    throw new Error(`${partyId} is not an approved CEP party with a published name.`)
  }

  const pendingPath = 'data/party-monitor/pending-updates.json'
  const auditPath = 'data/party-monitor/audit-log.json'
  const pending = JSON.parse(await readFile(pendingPath, 'utf8')) as PendingUpdatesFile
  const audit = JSON.parse(await readFile(auditPath, 'utf8')) as AuditLogFile
  const result = await discoverFromSeed({
    partyId,
    officialName: party.name,
    acronym: party.acronym,
    seedUrl,
  })
  const now = new Date().toISOString()
  const proposals: PendingUpdate[] = []

  for (const candidate of result.candidates) {
    const isPlatform = candidate.type === 'platform_page' || candidate.type === 'platform_document'
    const proposal = createPendingUpdate(
      {
        partyId,
        changeType: isPlatform ? 'platform_classification' : 'candidate_channel',
        existingValue: null,
        proposedValue: isPlatform
          ? {
              classification: 'unknown' satisfies PlatformClassification,
              urls: [candidate.canonicalUrl],
              languages: [],
              summary: null,
              proposedType: candidate.type,
            }
          : { type: candidate.type, url: candidate.canonicalUrl },
        evidence: [
          {
            description: candidate.evidenceDescription,
            urls: [candidate.evidencePageUrl],
            excerpt: candidate.evidenceExcerpt,
          },
        ],
        confidence: candidate.confidence,
        discoveredAt: now,
        auditedAt: now,
        sourceUrls: [candidate.canonicalUrl, candidate.evidencePageUrl],
        discovery: {
          method: candidate.type === 'website' ? 'url_seed' : 'first_party_link',
          originalUrl: candidate.originalUrl,
          canonicalUrl: candidate.canonicalUrl,
          query: null,
          confidenceReasons: candidate.confidenceReasons,
          redirects: candidate.redirects,
          operationalStatus: 'reachable',
        },
      },
      [...pending.items, ...proposals]
    )
    if (proposal) proposals.push(proposal)
  }

  audit.events.push(
    createAuditEvent(
      dryRun ? 'seed_discovery_dry_run' : 'seed_discovery_completed',
      `Inspected ${result.pagesVisited.length} pages from a reviewer-provided seed and created ${proposals.length} review proposals.`,
      now,
      partyId
    )
  )
  if (!dryRun) {
    pending.updatedAt = now
    pending.items.push(...proposals)
    await Promise.all([writeJson(pendingPath, pending), writeJson(auditPath, audit)])
  }
  console.log(
    JSON.stringify(
      {
        dryRun,
        partyId,
        seedUrl,
        pagesVisited: result.pagesVisited.length,
        proposals: proposals.map((item) => ({
          id: item.id,
          changeType: item.changeType,
          confidence: item.confidence,
          canonicalUrl: item.discovery?.canonicalUrl,
        })),
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
