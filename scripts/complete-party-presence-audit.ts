import { readFile, writeFile } from 'node:fs/promises'

import type {
  AuditLogFile,
  PendingUpdatesFile,
  PublishedPresenceFile,
} from '../lib/party-monitor/types'

function getArgument(name: string) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

async function main() {
  const reviewer = getArgument('--reviewer')
  if (!reviewer) throw new Error('Usage: --reviewer NAME')
  const pending = JSON.parse(
    await readFile('data/party-monitor/pending-updates.json', 'utf8')
  ) as PendingUpdatesFile
  if (pending.items.some((item) => item.decision === 'pending')) {
    throw new Error('Pending proposals remain. Review each proposal before completing the audit.')
  }
  const publishedPath = 'data/political-party-presence.json'
  const logPath = 'data/party-monitor/audit-log.json'
  const published = JSON.parse(await readFile(publishedPath, 'utf8')) as PublishedPresenceFile
  const auditLog = JSON.parse(await readFile(logPath, 'utf8')) as AuditLogFile
  const now = new Date().toISOString()
  published.latestCompletedAudit = now
  auditLog.events.push({
    id: `event-audit-complete-${Date.parse(now)}`,
    at: now,
    action: 'published_audit_completed',
    partyId: null,
    detail: `${reviewer} confirmed that every proposal in this audit was reviewed.`,
  })
  await Promise.all([
    writeFile(publishedPath, `${JSON.stringify(published, null, 2)}\n`, 'utf8'),
    writeFile(logPath, `${JSON.stringify(auditLog, null, 2)}\n`, 'utf8'),
  ])
  console.log(`Published latest completed audit timestamp ${now}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
