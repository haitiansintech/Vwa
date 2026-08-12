import { readFile, writeFile } from 'node:fs/promises'

import { applyApprovedUpdate, recordReviewDecision } from '../lib/party-monitor/review'
import type {
  AuditLogFile,
  PendingUpdatesFile,
  PublishedPresenceFile,
  ReviewDecision,
} from '../lib/party-monitor/types'
import {
  CEP_PARTIES_SOURCE_PUBLISHED,
  CEP_PARTIES_SOURCE_URL,
  politicalParties,
} from '../lib/political-parties'

function getArgument(name: string) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function main() {
  const id = getArgument('--id')
  const decision = getArgument('--decision') as ReviewDecision | undefined
  const reviewer = getArgument('--reviewer')
  if (
    !id ||
    !decision ||
    !reviewer ||
    !['approved', 'rejected', 'needs_research'].includes(decision)
  ) {
    throw new Error(
      'Usage: --id proposal-ID --decision approved|rejected|needs_research --reviewer NAME'
    )
  }

  const pendingPath = 'data/party-monitor/pending-updates.json'
  const publishedPath = 'data/political-party-presence.json'
  const logPath = 'data/party-monitor/audit-log.json'
  const pending = JSON.parse(await readFile(pendingPath, 'utf8')) as PendingUpdatesFile
  const published = JSON.parse(await readFile(publishedPath, 'utf8')) as PublishedPresenceFile
  const auditLog = JSON.parse(await readFile(logPath, 'utf8')) as AuditLogFile
  const item = pending.items.find((candidate) => candidate.id === id)
  if (!item) throw new Error(`Proposal ${id} was not found.`)
  const now = new Date().toISOString()
  recordReviewDecision(item, decision as Exclude<ReviewDecision, 'pending'>, reviewer, now)
  pending.updatedAt = now

  if (decision === 'approved' && item.partyId) {
    const partyId = item.partyId
    applyApprovedUpdate(published, item, reviewer, now, () => {
      const sequence = Number(partyId.replace('cep-', ''))
      const party = politicalParties.find((candidate) => candidate.sequence === sequence)
      if (!party || party.status !== 'approved')
        throw new Error(`Approved CEP party ${partyId} was not found.`)
      return {
        partyId,
        cepSequence: sequence,
        researchStatus: 'not_researched',
        channels: [],
        platform: {
          classification: 'unknown',
          urls: [],
          languages: [],
          summary: null,
          lastHumanVerifiedAt: null,
          verifiedBy: null,
        },
        sourceTitle: 'CEP definitive list of approved political parties',
        sourceUrl: CEP_PARTIES_SOURCE_URL,
        sourcePublicationDate: CEP_PARTIES_SOURCE_PUBLISHED,
        lastObservedSubstantiveUpdateAt: null,
        changeHistory: [],
      }
    })
  }

  auditLog.events.push({
    id: `event-${item.fingerprint.slice(0, 8)}-${Date.parse(now)}`,
    at: now,
    action: `review_${decision}`,
    partyId: item.partyId,
    detail: `${reviewer} marked ${item.id} ${decision}.`,
  })
  await Promise.all([
    writeJson(pendingPath, pending),
    writeJson(publishedPath, published),
    writeJson(logPath, auditLog),
  ])
  console.log(`${id} marked ${decision} by ${reviewer}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
