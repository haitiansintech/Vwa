import { createHash } from 'node:crypto'

import type {
  AuditEvent,
  MonitoredSource,
  PendingUpdate,
  PublishedPartyPresence,
} from '@/lib/party-monitor/types'
import {
  normalizeMonitoredUrl,
  safeFetch,
  type SafeFetchResult,
} from '@/lib/party-monitor/url-security'

export const CEP_ALLOWLIST = new Set(['cephaiti.ht', 'www.cephaiti.ht'])
export const CEP_KNOWN_SOURCES = [
  'https://cephaiti.ht/',
  'https://cephaiti.ht/publication-de-la-liste-definitive-des-partis-politioues-agrees/',
  'https://cephaiti.ht/wp-content/uploads/2026/07/NOTE-PP-AGREES-9-JUILLET-2026.pdf',
]

const relevantPublicationPattern =
  /parti|groupement|regroupement|candidat|contentieux|litige|retrait|disqualifi|radiation|bulletin|ballot/i

export function stableFingerprint(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

export function createPendingUpdate(
  input: Omit<PendingUpdate, 'id' | 'fingerprint' | 'decision' | 'reviewer' | 'reviewedAt'>,
  existing: PendingUpdate[]
) {
  const fingerprint = stableFingerprint({
    partyId: input.partyId,
    changeType: input.changeType,
    proposedValue: input.proposedValue,
  })
  if (existing.some((item) => item.fingerprint === fingerprint && item.decision === 'pending')) {
    return null
  }
  return {
    ...input,
    id: `proposal-${fingerprint.slice(0, 16)}`,
    fingerprint,
    decision: 'pending' as const,
    reviewer: null,
    reviewedAt: null,
  }
}

export function extractCepPdfLinks(pageUrl: string, html: string) {
  const links = new Set<string>()
  const pattern = /href\s*=\s*["']([^"']+\.pdf(?:\?[^"']*)?)["']/gi
  for (const match of html.matchAll(pattern)) {
    const normalized = normalizeMonitoredUrl(new URL(match[1], pageUrl).toString())
    if (CEP_ALLOWLIST.has(new URL(normalized).hostname)) links.add(normalized)
  }
  return [...links]
}

export function publicationMayBeRelevant(url: string, text = '') {
  return relevantPublicationPattern.test(`${url} ${text.slice(0, 50_000)}`)
}

export function sourceRecordFromFetch(
  result: SafeFetchResult,
  now: string,
  previous?: MonitoredSource
): MonitoredSource {
  return {
    url: result.requestedUrl,
    contentHash: createHash('sha256').update(result.body).digest('hex'),
    etag: result.etag,
    lastModified: result.lastModified,
    contentType: result.contentType,
    status: result.status,
    firstSeenAt: previous?.firstSeenAt ?? now,
    lastCheckedAt: now,
  }
}

export function operationalProposalForChannel(
  party: PublishedPartyPresence,
  channelId: string,
  result: SafeFetchResult | Error,
  now: string,
  existing: PendingUpdate[]
) {
  const channel = party.channels.find((item) => item.id === channelId)
  if (!channel || channel.verificationStatus !== 'verified_official') return null

  const proposedStatus =
    result instanceof Error
      ? 'temporarily_unreachable'
      : result.redirects.length > 0
        ? 'redirected'
        : result.status >= 200 && result.status < 400
          ? 'reachable'
          : result.status >= 500
            ? 'temporarily_unreachable'
            : 'unavailable'

  if (proposedStatus === channel.operationalStatus && !(result instanceof Error)) return null
  return createPendingUpdate(
    {
      partyId: party.partyId,
      changeType:
        result instanceof Error
          ? 'channel_status'
          : result.redirects.length
            ? 'redirect'
            : 'channel_status',
      existingValue: {
        channelId: channel.id,
        operationalStatus: channel.operationalStatus,
        url: channel.url,
      },
      proposedValue: {
        channelId: channel.id,
        operationalStatus: proposedStatus,
        finalUrl: result instanceof Error ? channel.url : result.finalUrl,
        error: result instanceof Error ? result.message : null,
      },
      evidence: [
        {
          description:
            result instanceof Error
              ? 'Automated reachability check failed.'
              : `HTTP ${result.status} check.`,
          urls: [channel.url],
        },
      ],
      confidence: result instanceof Error ? 'low' : 'high',
      discoveredAt: now,
      auditedAt: now,
      sourceUrls: [channel.url],
    },
    existing
  )
}

export async function fetchWithConservativeRetry(
  url: string,
  fetcher: typeof safeFetch = safeFetch
) {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await fetcher(url)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }
  throw lastError ?? new Error('Request failed.')
}

export function createAuditEvent(
  action: string,
  detail: string,
  at: string,
  partyId: string | null = null
): AuditEvent {
  const fingerprint = stableFingerprint({ action, detail, at, partyId })
  return { id: `event-${fingerprint.slice(0, 16)}`, at, action, partyId, detail }
}
