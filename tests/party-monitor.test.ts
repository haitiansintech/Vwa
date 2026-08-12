import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  createAuditEvent,
  createPendingUpdate,
  fetchWithConservativeRetry,
  operationalProposalForChannel,
} from '@/lib/party-monitor/audit'
import { applyApprovedUpdate, recordReviewDecision } from '@/lib/party-monitor/review'
import type {
  PendingUpdate,
  PublishedPartyPresence,
  PublishedPresenceFile,
} from '@/lib/party-monitor/types'
import {
  assertPublicUrl,
  normalizeMonitoredUrl,
  safeFetch,
  type SafeFetchResult,
} from '@/lib/party-monitor/url-security'
import { calculatePresenceStats, getPublicOfficialChannels } from '@/lib/party-presence'
import en from '@/app/i18n/locales/en/translation.json'
import es from '@/app/i18n/locales/es/translation.json'
import fr from '@/app/i18n/locales/fr/translation.json'
import ht from '@/app/i18n/locales/ht/translation.json'

const now = '2026-08-09T12:00:00.000Z'
const publicLookup = async () => ['93.184.216.34']

function partyRecord(): PublishedPartyPresence {
  return {
    partyId: 'cep-1',
    cepSequence: 1,
    researchStatus: 'researched',
    channels: [
      {
        id: 'website-1',
        type: 'website',
        url: 'https://party.example/',
        verificationStatus: 'verified_official',
        operationalStatus: 'reachable',
        evidence: [
          {
            description: 'Cross-linked official publication.',
            urls: ['https://evidence.example/'],
          },
        ],
        confidence: 'high',
        firstDiscoveredAt: now,
        lastCheckedAt: now,
        lastSuccessfullyReachedAt: now,
        lastHumanVerifiedAt: now,
        verifiedBy: 'reviewer',
      },
      {
        id: 'candidate-1',
        type: 'facebook',
        url: 'https://facebook.com/candidate',
        verificationStatus: 'candidate',
        operationalStatus: 'unknown',
        evidence: [],
        confidence: 'low',
        firstDiscoveredAt: now,
        lastCheckedAt: null,
        lastSuccessfullyReachedAt: null,
        lastHumanVerifiedAt: null,
        verifiedBy: null,
      },
    ],
    platform: {
      classification: 'full_platform',
      urls: ['https://party.example/platform.pdf'],
      languages: ['fr'],
      summary: null,
      lastHumanVerifiedAt: now,
      verifiedBy: 'reviewer',
    },
    sourceTitle: 'CEP list',
    sourceUrl: 'https://cephaiti.ht/list.pdf',
    sourcePublicationDate: '2026-07-09',
    lastObservedSubstantiveUpdateAt: null,
    changeHistory: [],
  }
}

function pendingCandidate(): PendingUpdate {
  return {
    id: 'proposal-1',
    fingerprint: 'a'.repeat(64),
    partyId: 'cep-2',
    changeType: 'candidate_channel',
    existingValue: null,
    proposedValue: { type: 'website', url: 'https://party-two.example/' },
    evidence: [{ description: 'Submitted evidence.', urls: ['https://evidence.example/'] }],
    confidence: 'medium',
    discoveredAt: now,
    auditedAt: now,
    sourceUrls: ['https://party-two.example/'],
    decision: 'pending',
    reviewer: null,
    reviewedAt: null,
  }
}

test('URL normalization permits only credential-free HTTP(S) URLs', () => {
  assert.equal(normalizeMonitoredUrl('HTTPS://Example.COM:443/a#fragment'), 'https://example.com/a')
  assert.throws(() => normalizeMonitoredUrl('file:///etc/passwd'), /HTTP and HTTPS/)
  assert.throws(() => normalizeMonitoredUrl('https://user:secret@example.com'), /Credentials/)
})

test('SSRF checks block localhost, private networks, and metadata addresses', async () => {
  await assert.rejects(() => assertPublicUrl('http://localhost/admin', publicLookup), /blocked/)
  await assert.rejects(
    () => assertPublicUrl('http://10.0.0.2/', async () => ['10.0.0.2']),
    /private/
  )
  await assert.rejects(
    () =>
      assertPublicUrl('http://169.254.169.254/latest/meta-data', async () => ['169.254.169.254']),
    /private/
  )
})

test('safe fetch validates redirects and returns a bounded response', async () => {
  const calls: string[] = []
  const fetchImpl = async (input: string | URL | Request) => {
    calls.push(String(input))
    if (calls.length === 1)
      return new Response(null, { status: 302, headers: { location: '/final' } })
    return new Response('ok', { status: 200, headers: { 'content-type': 'text/html' } })
  }
  const result = await safeFetch('https://example.com/start', {
    fetchImpl: fetchImpl as typeof fetch,
    addressLookup: publicLookup,
    maximumBytes: 10,
  })
  assert.equal(result.finalUrl, 'https://example.com/final')
  assert.deepEqual(result.redirects, ['https://example.com/final'])
  assert.equal(new TextDecoder().decode(result.body), 'ok')
})

test('safe fetch rejects oversized and unexpected responses', async () => {
  const oversized = async () => new Response('12345', { headers: { 'content-type': 'text/plain' } })
  await assert.rejects(
    () =>
      safeFetch('https://example.com', {
        fetchImpl: oversized as typeof fetch,
        addressLookup: publicLookup,
        maximumBytes: 4,
      }),
    /exceeds/
  )
  const image = async () => new Response('x', { headers: { 'content-type': 'image/png' } })
  await assert.rejects(
    () =>
      safeFetch('https://example.com', {
        fetchImpl: image as typeof fetch,
        addressLookup: publicLookup,
        allowedContentTypes: ['text/html'],
      }),
    /Unexpected content type/
  )
})

test('temporary request failures are retried conservatively', async () => {
  let attempts = 0
  const expected = {
    requestedUrl: 'https://example.com/',
    finalUrl: 'https://example.com/',
    status: 200,
    contentType: 'text/html',
    etag: null,
    lastModified: null,
    body: new Uint8Array(),
    redirects: [],
  } satisfies SafeFetchResult
  const result = await fetchWithConservativeRetry('https://example.com', async () => {
    attempts += 1
    if (attempts === 1) throw new Error('temporary')
    return expected
  })
  assert.equal(attempts, 2)
  assert.equal(result.status, 200)
})

test('pending proposals are deduplicated and failures do not mark channels unofficial', () => {
  const party = partyRecord()
  const first = operationalProposalForChannel(party, 'website-1', new Error('timeout'), now, [])
  assert.ok(first)
  assert.equal(
    (first.proposedValue as { operationalStatus: string }).operationalStatus,
    'temporarily_unreachable'
  )
  assert.equal(party.channels[0].verificationStatus, 'verified_official')
  const duplicate = createPendingUpdate(
    {
      partyId: first.partyId,
      changeType: first.changeType,
      existingValue: first.existingValue,
      proposedValue: first.proposedValue,
      evidence: first.evidence,
      confidence: first.confidence,
      discoveredAt: now,
      auditedAt: now,
      sourceUrls: first.sourceUrls,
    },
    [first]
  )
  assert.equal(duplicate, null)
})

test('review decisions are independent and only approval publishes a candidate', () => {
  const rejected = pendingCandidate()
  const published: PublishedPresenceFile = {
    schemaVersion: 1,
    latestCompletedAudit: null,
    records: [],
  }
  recordReviewDecision(rejected, 'rejected', 'alice', now)
  assert.equal(applyApprovedUpdate(published, rejected, 'alice', now, partyRecord), false)
  assert.equal(published.records.length, 0)

  const approved = pendingCandidate()
  recordReviewDecision(approved, 'approved', 'bob', now)
  const created = partyRecord()
  created.partyId = 'cep-2'
  created.cepSequence = 2
  created.channels = []
  assert.equal(
    applyApprovedUpdate(published, approved, 'bob', now, () => created),
    true
  )
  assert.equal(published.records[0].channels[0].verificationStatus, 'verified_official')
  assert.equal(published.records[0].changeHistory.length, 1)
})

test('platform classifications remain proposals until a reviewer approves them', () => {
  const item = pendingCandidate()
  item.changeType = 'platform_classification'
  item.partyId = 'cep-1'
  item.proposedValue = {
    classification: 'platform_summary',
    urls: ['https://party.example/platform'],
    languages: ['fr', 'ht'],
    summary: null,
  }
  const record = partyRecord()
  record.platform.classification = 'unknown'
  const published: PublishedPresenceFile = {
    schemaVersion: 1,
    latestCompletedAudit: null,
    records: [record],
  }
  assert.equal(applyApprovedUpdate(published, item, 'nobody', now, partyRecord), false)
  assert.equal(record.platform.classification, 'unknown')
  recordReviewDecision(item, 'approved', 'carole', now)
  assert.equal(applyApprovedUpdate(published, item, 'carole', now, partyRecord), true)
  assert.equal(record.platform.classification, 'platform_summary')
  assert.deepEqual(record.platform.languages, ['fr', 'ht'])
})

test('public selectors exclude pending channels and summary statistics use published records only', () => {
  const record = partyRecord()
  assert.deepEqual(
    getPublicOfficialChannels(record).map((channel) => channel.id),
    ['website-1']
  )
  const stats = calculatePresenceStats([1, 2], [record])
  assert.equal(stats.researched, 1)
  assert.equal(stats.verifiedActiveWebsite, 1)
  assert.equal(stats.substantivePlatform, 1)
  assert.equal(stats.notResearched, 1)
})

test('audit events contain stable provenance fields', () => {
  const event = createAuditEvent('audit_completed', 'fixture run', now, 'cep-1')
  assert.equal(event.at, now)
  assert.equal(event.partyId, 'cep-1')
  assert.match(event.id, /^event-/)
})

test('party monitoring copy exists in English, Spanish, French, and Haitian Creole', () => {
  for (const translation of [en, es, fr, ht]) {
    assert.ok(translation.parties.methodology)
    assert.ok(translation.parties.notYetResearched)
    assert.ok(translation.parties.substantivePlatform)
    assert.ok(translation.parties.profile.candidatesUnavailable)
    assert.ok(translation.parties.snapshot.heading)
  }
})

test('the GitHub workflow exposes authenticated manual dry-run, one-party, and resume inputs', async () => {
  const workflow = await readFile('.github/workflows/party-presence-monitor.yml', 'utf8')
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /dry_run:/)
  assert.match(workflow, /party_id:/)
  assert.match(workflow, /resume_after:/)
  assert.match(workflow, /concurrency:/)
})
