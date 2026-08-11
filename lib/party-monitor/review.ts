import { stableFingerprint } from '@/lib/party-monitor/audit'
import type {
  PendingUpdate,
  PublishedChannel,
  PublishedPartyPresence,
  PublishedPresenceFile,
  ReviewDecision,
} from '@/lib/party-monitor/types'

export function recordReviewDecision(
  item: PendingUpdate,
  decision: Exclude<ReviewDecision, 'pending'>,
  reviewer: string,
  reviewedAt: string
) {
  if (item.decision !== 'pending' && item.decision !== 'needs_research') {
    throw new Error(`Proposal ${item.id} already has decision ${item.decision}.`)
  }
  item.decision = decision
  item.reviewer = reviewer
  item.reviewedAt = reviewedAt
}

export function applyApprovedUpdate(
  published: PublishedPresenceFile,
  item: PendingUpdate,
  reviewer: string,
  reviewedAt: string,
  createPartyRecord: () => PublishedPartyPresence
) {
  if (item.decision !== 'approved' || !item.partyId || item.changeType === 'cep_publication') {
    return false
  }
  let record = published.records.find((candidate) => candidate.partyId === item.partyId)
  if (!record) {
    record = createPartyRecord()
    if (record.partyId !== item.partyId)
      throw new Error('Created party record does not match proposal.')
    published.records.push(record)
  }

  if (item.changeType === 'candidate_channel') {
    const proposed = item.proposedValue as { type: PublishedChannel['type']; url: string }
    record.channels.push({
      id: `channel-${stableFingerprint({ proposal: item.id, reviewedAt }).slice(0, 16)}`,
      type: proposed.type,
      url: proposed.url,
      verificationStatus: 'verified_official',
      operationalStatus: 'unknown',
      evidence: item.evidence,
      confidence: item.confidence,
      firstDiscoveredAt: item.discoveredAt,
      lastCheckedAt: item.auditedAt,
      lastSuccessfullyReachedAt: null,
      lastHumanVerifiedAt: reviewedAt,
      verifiedBy: reviewer,
    })
  } else if (item.changeType === 'channel_status' || item.changeType === 'redirect') {
    const proposed = item.proposedValue as {
      channelId: string
      operationalStatus: PublishedChannel['operationalStatus']
      finalUrl: string
    }
    const channel = record.channels.find((candidate) => candidate.id === proposed.channelId)
    if (!channel) throw new Error(`Channel ${proposed.channelId} was not found.`)
    channel.operationalStatus = proposed.operationalStatus
    channel.lastCheckedAt = item.auditedAt
    if (proposed.operationalStatus === 'reachable')
      channel.lastSuccessfullyReachedAt = item.auditedAt
  } else if (item.changeType === 'platform_classification') {
    const proposed = item.proposedValue as {
      classification: PublishedPartyPresence['platform']['classification']
      urls: string[]
      languages: string[]
      summary: string | null
    }
    record.platform = {
      ...proposed,
      lastHumanVerifiedAt: reviewedAt,
      verifiedBy: reviewer,
    }
  }
  record.researchStatus = 'researched'
  record.changeHistory.push({
    at: reviewedAt,
    reviewer,
    description: `Approved ${item.changeType} proposal ${item.id}.`,
  })
  return true
}
