import { readFile, writeFile } from 'node:fs/promises'

import { createPendingUpdate } from '../lib/party-monitor/audit'
import type {
  ChannelType,
  PendingUpdatesFile,
  PlatformClassification,
} from '../lib/party-monitor/types'
import { assertPublicUrl } from '../lib/party-monitor/url-security'

function getArgument(name: string) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const channelTypes: ChannelType[] = [
  'website',
  'facebook',
  'x',
  'instagram',
  'youtube',
  'tiktok',
  'other',
  'platform_page',
  'platform_document',
  'contact_page',
]
const platformClassifications: PlatformClassification[] = [
  'full_platform',
  'platform_summary',
  'general_vision',
  'slogans_only',
  'none_found',
  'unknown',
]

async function main() {
  const partyId = getArgument('--party')
  const candidateUrl = getArgument('--url')
  const type = getArgument('--type') as ChannelType | undefined
  const classification = getArgument('--classification') as PlatformClassification | undefined
  const languages = (getArgument('--languages') ?? '')
    .split(',')
    .map((language) => language.trim())
    .filter(Boolean)
  const evidenceUrl = getArgument('--evidence-url')
  if (
    !partyId ||
    !/^cep-\d+$/.test(partyId) ||
    !candidateUrl ||
    (!type && !classification) ||
    (type && classification) ||
    (type && !channelTypes.includes(type)) ||
    (classification && !platformClassifications.includes(classification)) ||
    !evidenceUrl
  ) {
    throw new Error(
      'Usage: --party cep-N --url URL (--type TYPE | --classification CLASS) --evidence-url URL [--languages fr,ht]'
    )
  }
  const [url, evidence] = await Promise.all([
    assertPublicUrl(candidateUrl),
    assertPublicUrl(evidenceUrl),
  ])
  const filePath = 'data/party-monitor/pending-updates.json'
  const pending = JSON.parse(await readFile(filePath, 'utf8')) as PendingUpdatesFile
  const now = new Date().toISOString()
  const proposal = createPendingUpdate(
    {
      partyId,
      changeType: classification ? 'platform_classification' : 'candidate_channel',
      existingValue: null,
      proposedValue: classification
        ? { classification, urls: [url], languages, summary: null }
        : { type, url },
      evidence: [
        {
          description: 'Administrator-submitted candidate for human ownership review.',
          urls: [evidence],
        },
      ],
      confidence: 'low',
      discoveredAt: now,
      auditedAt: now,
      sourceUrls: [url, evidence],
    },
    pending.items
  )
  if (!proposal) {
    console.log('An equivalent pending proposal already exists.')
    return
  }
  pending.updatedAt = now
  pending.items.push(proposal)
  await writeFile(filePath, `${JSON.stringify(pending, null, 2)}\n`, 'utf8')
  console.log(`Created ${proposal.id}. It remains unverified until reviewed.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
