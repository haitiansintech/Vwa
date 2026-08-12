import { createHash } from 'node:crypto'

import type { ChannelType, ConfidenceLevel } from '@/lib/party-monitor/types'
import { normalizeMonitoredUrl, safeFetch } from '@/lib/party-monitor/url-security'

const TRACKING_PARAMETERS = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'source',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term',
])
const SOCIAL_HOSTS: Array<[RegExp, ChannelType]> = [
  [/(^|\.)facebook\.com$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(x|twitter)\.com$/, 'x'],
  [/(^|\.)youtube\.com$/, 'youtube'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
]
const PLATFORM_TERMS =
  /\b(platform|political[-_\s]+platform|programme[-_\s]+politique|programme[-_\s]+de[-_\s]+gouvernement|orientation[-_\s]+programmatique|priorit(?:y|ies)|princip(?:le|les)|vision|plan)\b/i
const SAME_ORIGIN_TERMS =
  /about|a-propos|apropos|contact|vision|programme|platform|orientation|priorit|princip/i

export type DiscoveryCandidate = {
  fingerprint: string
  type: ChannelType
  originalUrl: string
  canonicalUrl: string
  evidencePageUrl: string
  evidenceDescription: string
  evidenceExcerpt: string | null
  confidence: ConfidenceLevel
  confidenceReasons: string[]
  redirects: string[]
}

export function canonicalizeDiscoveryUrl(value: string, base?: string) {
  const url = new URL(value, base)
  if (/\/https?:\/\//i.test(url.pathname)) {
    throw new Error('Nested URLs are not valid discovery candidates')
  }
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMETERS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
      url.searchParams.delete(key)
    }
  }
  url.searchParams.sort()
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '')
  return normalizeMonitoredUrl(url.toString())
}

export function canonicalDomain(value: string) {
  return new URL(canonicalizeDiscoveryUrl(value)).hostname.replace(/^www\./, '')
}

export function sanitizeEvidenceText(value: string, maximumLength = 600) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|#160);/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximumLength)
}

export function isPathAllowedByRobots(robots: string, pathname: string) {
  let applies = false
  let bestMatch = ''
  let allowed = true
  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim()
    const [key, ...rest] = line.split(':')
    const value = rest.join(':').trim()
    if (key?.toLowerCase() === 'user-agent') applies = value === '*'
    if (
      applies &&
      (key?.toLowerCase() === 'allow' || key?.toLowerCase() === 'disallow') &&
      value &&
      pathname.startsWith(value) &&
      value.length >= bestMatch.length
    ) {
      bestMatch = value
      allowed = key.toLowerCase() === 'allow'
    }
  }
  return allowed
}

export function extractLinks(html: string, pageUrl: string) {
  const links = new Set<string>()
  for (const match of html.matchAll(/(?:href|content)\s*=\s*["']([^"']+)["']/gi)) {
    try {
      links.add(canonicalizeDiscoveryUrl(match[1], pageUrl))
    } catch {
      /* untrusted link */
    }
  }
  for (const script of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      const visit = (value: unknown): void => {
        if (Array.isArray(value)) return value.forEach(visit)
        if (!value || typeof value !== 'object') return
        for (const [key, child] of Object.entries(value)) {
          if (key === 'sameAs' || key === 'url') visit(typeof child === 'string' ? [child] : child)
          else visit(child)
        }
        if (typeof value === 'string') {
          try {
            links.add(canonicalizeDiscoveryUrl(value, pageUrl))
          } catch {
            /* ignored */
          }
        }
      }
      const parsed = JSON.parse(script[1])
      const sameAs = JSON.stringify(parsed).match(/https?:\\?\/\\?\/[^"\\\s]+/g) ?? []
      for (const value of sameAs) {
        try {
          links.add(canonicalizeDiscoveryUrl(value.replace(/\\\//g, '/'), pageUrl))
        } catch {
          /* ignored */
        }
      }
    } catch {
      /* malformed JSON-LD */
    }
  }
  return [...links]
}

export function classifyLink(url: string, label = ''): ChannelType | null {
  const parsed = new URL(url)
  if (/\/(?:sitemap|plan-du-site)(?:\/|$)/i.test(parsed.pathname)) return null
  for (const [pattern, type] of SOCIAL_HOSTS) if (pattern.test(parsed.hostname)) return type
  if (parsed.pathname.toLowerCase().endsWith('.pdf') && PLATFORM_TERMS.test(`${label} ${url}`))
    return 'platform_document'
  if (PLATFORM_TERMS.test(`${label} ${url}`)) return 'platform_page'
  return null
}

function normalizeIdentity(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function classifyConfidence(input: {
  officialName: string
  acronym: string | null
  pageText: string
  linkedFromCandidateWebsite: boolean
  searchOnly?: boolean
}) {
  const text = normalizeIdentity(input.pageText)
  const name = normalizeIdentity(input.officialName)
  const acronym = normalizeIdentity(input.acronym ?? '')
  const reasons: string[] = []
  if (name.length > 5 && text.includes(name)) reasons.push('official_name_match')
  if (acronym.length > 1 && new RegExp(`\\b${acronym}\\b`).test(text)) reasons.push('acronym_match')
  if (input.linkedFromCandidateWebsite) reasons.push('linked_from_candidate_website')
  if (input.searchOnly) reasons.push('search_result_only')
  const confidence: ConfidenceLevel = input.searchOnly
    ? 'low'
    : reasons.includes('linked_from_candidate_website') &&
        reasons.some((reason) => reason.endsWith('match'))
      ? 'high'
      : reasons.length > 0
        ? 'medium'
        : 'low'
  return { confidence, reasons }
}

export async function discoverFromSeed(input: {
  partyId: string
  officialName: string
  acronym: string | null
  seedUrl: string
  maxPages?: number
}) {
  const maxPages = Math.min(Math.max(input.maxPages ?? 6, 1), 10)
  const seed = canonicalizeDiscoveryUrl(input.seedUrl)
  const seedDomain = canonicalDomain(seed)
  const queue = [seed]
  const visited = new Set<string>()
  const candidates = new Map<string, DiscoveryCandidate>()
  let robots = ''
  try {
    const robotsResult = await safeFetch(new URL('/robots.txt', seed).toString(), {
      maximumBytes: 100_000,
      timeoutMs: 5_000,
      allowedContentTypes: ['text/plain', 'text/html'],
    })
    robots = new TextDecoder().decode(robotsResult.body)
  } catch {
    /* missing or unavailable robots policy */
  }

  while (queue.length && visited.size < maxPages) {
    const pageUrl = queue.shift()!
    if (visited.has(pageUrl)) continue
    if (!isPathAllowedByRobots(robots, new URL(pageUrl).pathname)) continue
    visited.add(pageUrl)
    const result = await safeFetch(pageUrl, {
      maximumBytes: 1_500_000,
      timeoutMs: 10_000,
      allowedContentTypes: ['text/html'],
    })
    const html = new TextDecoder().decode(result.body)
    const text = sanitizeEvidenceText(html)
    const identity = classifyConfidence({
      officialName: input.officialName,
      acronym: input.acronym,
      pageText: text,
      linkedFromCandidateWebsite: pageUrl !== seed,
    })
    if (pageUrl === seed) {
      const fingerprint = createHash('sha256')
        .update(`${input.partyId}|website|${result.finalUrl}`)
        .digest('hex')
      candidates.set(fingerprint, {
        fingerprint,
        type: 'website',
        originalUrl: input.seedUrl,
        canonicalUrl: canonicalizeDiscoveryUrl(result.finalUrl),
        evidencePageUrl: result.finalUrl,
        evidenceDescription: 'Administrator-seeded website was fetched and inspected.',
        evidenceExcerpt: text,
        confidence: identity.confidence,
        confidenceReasons: identity.reasons,
        redirects: result.redirects,
      })
    }
    for (const link of extractLinks(html, result.finalUrl)) {
      const type = classifyLink(link)
      if (type) {
        const fingerprint = createHash('sha256')
          .update(`${input.partyId}|${type}|${link}`)
          .digest('hex')
        candidates.set(fingerprint, {
          fingerprint,
          type,
          originalUrl: link,
          canonicalUrl: link,
          evidencePageUrl: result.finalUrl,
          evidenceDescription: 'Link discovered on a candidate first-party website.',
          evidenceExcerpt: text,
          confidence: identity.confidence === 'low' ? 'medium' : 'high',
          confidenceReasons: [...new Set([...identity.reasons, 'linked_from_candidate_website'])],
          redirects: [],
        })
      } else if (
        canonicalDomain(link) === seedDomain &&
        SAME_ORIGIN_TERMS.test(new URL(link).pathname) &&
        !visited.has(link)
      ) {
        queue.push(link)
      }
    }
  }
  return { candidates: [...candidates.values()], pagesVisited: [...visited] }
}
