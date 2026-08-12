import rawPresence from '@/data/political-party-presence.json'

import type {
  PlatformClassification,
  PublishedPartyPresence,
  PublishedPresenceFile,
} from '@/lib/party-monitor/types'

const publishedPresence = rawPresence as PublishedPresenceFile

export const latestCompletedPartyAudit = publishedPresence.latestCompletedAudit

export const partyPresenceById = new Map<string, PublishedPartyPresence>(
  publishedPresence.records.map((record) => [record.partyId, record])
)

export function getPartyPresence(
  partySequence: number,
  presenceRecords: PublishedPartyPresence[] = publishedPresence.records
) {
  return presenceRecords.find((record) => record.partyId === `cep-${partySequence}`)
}

const substantivePlatforms: PlatformClassification[] = ['full_platform', 'platform_summary']
const limitedPlatforms: PlatformClassification[] = ['general_vision', 'slogans_only']

export function calculatePresenceStats(
  approvedPartySequences: number[],
  presenceRecords: PublishedPartyPresence[] = publishedPresence.records
) {
  const recordsById = new Map(presenceRecords.map((record) => [record.partyId, record]))
  const records = approvedPartySequences
    .map((sequence) => recordsById.get(`cep-${sequence}`))
    .filter((record): record is PublishedPartyPresence => Boolean(record))
  const researched = records.filter((record) => record.researchStatus === 'researched')

  return {
    totalApproved: approvedPartySequences.length,
    researched: researched.length,
    verifiedActiveWebsite: records.filter((record) =>
      record.channels.some(
        (channel) =>
          channel.type === 'website' &&
          channel.verificationStatus === 'verified_official' &&
          channel.operationalStatus === 'reachable'
      )
    ).length,
    verifiedPresence: records.filter((record) => getPublicOfficialChannels(record).length > 0)
      .length,
    substantivePlatform: records.filter((record) =>
      substantivePlatforms.includes(record.platform.classification)
    ).length,
    limitedPlatform: records.filter((record) =>
      limitedPlatforms.includes(record.platform.classification)
    ).length,
    noneFound: records.filter((record) => record.platform.classification === 'none_found').length,
    noVerifiedPresenceFound: researched.filter(
      (record) => getPublicOfficialChannels(record).length === 0
    ).length,
    notResearched: approvedPartySequences.length - researched.length,
    latestCompletedAudit: publishedPresence.latestCompletedAudit,
  }
}

export function getPublicOfficialChannels(record?: PublishedPartyPresence) {
  return (
    record?.channels.filter((channel) =>
      ['verified_official', 'inactive', 'unreachable', 'archived'].includes(
        channel.verificationStatus
      )
    ) ?? []
  )
}

export function getPresenceState(record?: PublishedPartyPresence) {
  if (!record || record.researchStatus !== 'researched') return 'review_pending' as const
  const officialChannels = getPublicOfficialChannels(record)
  if (officialChannels.length === 0) return 'none_found' as const
  if (
    officialChannels.every((channel) =>
      ['unreachable', 'temporarily_unreachable', 'unavailable'].includes(channel.operationalStatus)
    )
  ) {
    return 'verified_unreachable' as const
  }
  if (
    officialChannels.every((channel) =>
      ['inactive', 'archived'].includes(channel.verificationStatus)
    )
  ) {
    return 'archived_or_inactive' as const
  }
  return 'verified_active' as const
}

export function calculateChannelBreakdown(
  approvedPartySequences: number[],
  presenceRecords: PublishedPartyPresence[] = publishedPresence.records
) {
  const approvedIds = new Set(approvedPartySequences.map((sequence) => `cep-${sequence}`))
  const counts: Partial<Record<PublishedPartyPresence['channels'][number]['type'], number>> = {}
  for (const record of presenceRecords.filter((item) => approvedIds.has(item.partyId))) {
    const types = new Set(getPublicOfficialChannels(record).map((channel) => channel.type))
    for (const type of types) counts[type] = (counts[type] ?? 0) + 1
  }
  return counts
}
