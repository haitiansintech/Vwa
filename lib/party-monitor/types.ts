export type VerificationStatus =
  | 'unreviewed'
  | 'candidate'
  | 'verified_official'
  | 'verified_unofficial'
  | 'disputed'
  | 'inactive'
  | 'unreachable'
  | 'archived'

export type OperationalStatus =
  | 'unknown'
  | 'reachable'
  | 'temporarily_unreachable'
  | 'unreachable'
  | 'redirected'
  | 'expired_or_parked'
  | 'tls_failure'
  | 'unavailable'

export type ChannelType =
  | 'website'
  | 'facebook'
  | 'x'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'other'
  | 'platform_page'
  | 'platform_document'
  | 'contact_page'

export type PlatformClassification =
  | 'full_platform'
  | 'platform_summary'
  | 'general_vision'
  | 'slogans_only'
  | 'none_found'
  | 'unknown'

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export type Evidence = {
  description: string
  urls: string[]
  excerpt?: string | null
}

export type PublishedChannel = {
  id: string
  type: ChannelType
  url: string
  verificationStatus: VerificationStatus
  operationalStatus: OperationalStatus
  evidence: Evidence[]
  confidence: ConfidenceLevel
  firstDiscoveredAt: string
  lastCheckedAt: string | null
  lastSuccessfullyReachedAt: string | null
  lastHumanVerifiedAt: string | null
  verifiedBy: string | null
}

export type PublishedPlatform = {
  classification: PlatformClassification
  urls: string[]
  languages: string[]
  summary: string | null
  lastHumanVerifiedAt: string | null
  verifiedBy: string | null
}

export type PublishedPartyPresence = {
  partyId: string
  cepSequence: number
  researchStatus: 'not_researched' | 'researched'
  channels: PublishedChannel[]
  platform: PublishedPlatform
  sourceTitle: string
  sourceUrl: string
  sourcePublicationDate: string
  lastObservedSubstantiveUpdateAt: string | null
  changeHistory: Array<{
    at: string
    reviewer: string
    description: string
  }>
}

export type PublishedPresenceFile = {
  schemaVersion: 1
  latestCompletedAudit: string | null
  records: PublishedPartyPresence[]
}

export type PendingChangeType =
  | 'candidate_channel'
  | 'channel_status'
  | 'redirect'
  | 'ownership_change'
  | 'platform_classification'
  | 'cep_publication'

export type ReviewDecision = 'pending' | 'approved' | 'rejected' | 'needs_research'

export type PendingUpdate = {
  id: string
  fingerprint: string
  partyId: string | null
  changeType: PendingChangeType
  existingValue: unknown
  proposedValue: unknown
  evidence: Evidence[]
  confidence: ConfidenceLevel
  discoveredAt: string
  auditedAt: string
  sourceUrls: string[]
  discovery?: {
    method: 'url_seed' | 'search_provider' | 'first_party_link' | 'availability_check'
    originalUrl: string
    canonicalUrl: string
    query: string | null
    confidenceReasons: string[]
    redirects: string[]
    operationalStatus: OperationalStatus
  }
  decision: ReviewDecision
  reviewer: string | null
  reviewedAt: string | null
}

export type PendingUpdatesFile = {
  schemaVersion: 1
  updatedAt: string | null
  items: PendingUpdate[]
}

export type MonitoredSource = {
  url: string
  contentHash: string | null
  etag: string | null
  lastModified: string | null
  contentType: string | null
  status: number | null
  firstSeenAt: string
  lastCheckedAt: string
}

export type SourceStateFile = {
  schemaVersion: 1
  sources: MonitoredSource[]
}

export type AuditEvent = {
  id: string
  at: string
  action: string
  partyId: string | null
  detail: string
}

export type AuditLogFile = {
  schemaVersion: 1
  events: AuditEvent[]
}
