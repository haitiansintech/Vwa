import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import './test-env'

import { getPublishedCandidatesForParty } from '@/lib/political-candidates'
import {
  filterPoliticalParties,
  getPoliticalPartySlug,
  politicalParties,
  resolvePoliticalPartySlug,
  validatePoliticalPartyDataset,
} from '@/lib/political-parties'
import { PartiesDirectory, type PartiesDirectoryCopy } from '@/components/parties/parties-directory'
import { PartyProfile, type PartyProfileCopy } from '@/components/parties/party-profile'

const copy: PartiesDirectoryCopy = {
  heading: 'Political parties registered for the 2026–2027 electoral process',
  summary: 'Official CEP registry.',
  registered: 'Total registered',
  approved: 'Approved',
  notApproved: 'Not approved',
  searchLabel: 'Search parties',
  searchPlaceholder: 'Search by official name or acronym',
  filterLabel: 'Filter by status',
  all: 'All parties',
  approvedFilter: 'Approved',
  notApprovedFilter: 'Not approved',
  partyColumn: 'Official party name',
  acronymColumn: 'Acronym',
  statusColumn: 'CEP status',
  results: '{count} parties shown',
  noResults: 'No parties match.',
  officialSource: 'Official CEP source',
  publicationPage: 'CEP publication page',
  sourcePublished: 'Source published July 9, 2026',
  qualificationNote: 'Approval does not confirm placement on the final ballot.',
  sourceAnomaly: 'Rows 174, 202, and 309 are absent from the source table.',
  missingName: 'Source row absent — manual verification required',
  needsReview: 'Needs review',
  tableCaption: 'Official CEP political party registry',
  digitalPresenceSnapshotLink: 'View the party digital-presence snapshot',
}

const profileCopy: PartyProfileCopy = {
  backToParties: 'Political Parties',
  officialInformation: 'Official CEP party information',
  cepSequence: 'CEP sequence number',
  cepStatus: 'CEP electoral status',
  electionCycle: 'Election cycle',
  electionCycleValue: '2026–2027 electoral process',
  sourcePublication: 'CEP source published',
  lastDataUpdate: 'Last published data update',
  approved: 'Approved',
  notApproved: 'Not approved',
  officialDigitalPresence: 'Official Digital Presence',
  vwaResearchNotice: 'Human-reviewed VWA research.',
  reviewPending: 'VWA has not yet completed its digital-presence review for this party.',
  noPresenceFound: 'No verified official presence was located.',
  verifiedActive: 'Verified and active',
  verifiedUnreachable: 'Verified but currently unreachable',
  archivedInactive: 'Archived or inactive',
  lastChecked: 'Last successfully checked',
  lastHumanReview: 'Last human-reviewed',
  verificationEvidence: 'Verification evidence',
  politicalPlatform: 'Political Platform',
  platformPending: 'Platform research is pending.',
  platformFull: 'Substantive platform',
  platformSummary: 'Platform summary',
  platformVision: 'General vision',
  platformSlogans: 'Slogans only',
  platformNoneFound: 'No platform located.',
  platformUnknown: 'Platform unknown',
  originalLanguages: 'Original languages',
  platformSource: 'Platform source',
  candidates: 'Candidates Affiliated With This Party',
  candidatesUnavailable: 'Candidate information is not yet available from CEP publications.',
  office: 'Office sought',
  geography: 'Electoral geography',
  candidateStatus: 'CEP candidate status',
  sourcesAndHistory: 'Sources and Status History',
  officialCepSource: 'Official CEP party publication',
  cepPublicationPage: 'CEP publication page',
  digitalPresenceSnapshot: 'Digital-presence snapshot',
  channelLabels: {
    website: 'Website',
    facebook: 'Facebook',
    x: 'X',
    instagram: 'Instagram',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    other: 'Other',
    platform_page: 'Platform page',
    platform_document: 'Platform document',
    contact_page: 'Contact page',
  },
}

test('CEP dataset has the published totals and complete sequence index', () => {
  const result = validatePoliticalPartyDataset()

  assert.equal(result.total, 320)
  assert.equal(result.approved, 316)
  assert.equal(result.notApproved, 4)
  assert.equal(result.uniqueSequences, 320)
})

test('the four printed non-approved parties have the verified status', () => {
  const rejected = politicalParties.filter((party) => party.status === 'not-approved')

  assert.deepEqual(
    rejected.map(({ sequence, name, acronym }) => ({ sequence, name, acronym })),
    [
      { sequence: 272, name: "Parti Nationaliste Chrétien d'Haïti", acronym: 'PNCH' },
      { sequence: 299, name: 'Ayiti Demen Ansanm', acronym: 'AYIDA' },
      {
        sequence: 301,
        name: "Mouvement National pour la Prospérité d'Haïti",
        acronym: 'MONAPHA',
      },
      {
        sequence: 316,
        name: 'Parti Libéral Républicain Bloc Centriste',
        acronym: 'LR Bloc Centriste',
      },
    ]
  )
})

test('search is accent-insensitive and matches acronyms', () => {
  assert.deepEqual(
    filterPoliticalParties(politicalParties, 'prosperite', 'all').map((party) => party.sequence),
    [301]
  )
  assert.deepEqual(
    filterPoliticalParties(politicalParties, 'AYIDA', 'all').map((party) => party.sequence),
    [299]
  )
})

test('status filtering returns only the four non-approved parties', () => {
  const rejected = filterPoliticalParties(politicalParties, '', 'not-approved')

  assert.equal(rejected.length, 4)
  assert.ok(rejected.every((party) => party.status === 'not-approved'))
})

test('stable party slugs are collision-safe and reserve the snapshot route', () => {
  const slugs = politicalParties.map((party) => getPoliticalPartySlug(party.sequence))
  assert.equal(new Set(slugs).size, 320)
  assert.equal(resolvePoliticalPartySlug('cep-163')?.name, 'Fanmi Lavalas')
  assert.equal(resolvePoliticalPartySlug('digital-presence'), undefined)
  assert.equal(resolvePoliticalPartySlug('fanmi-lavalas')?.sequence, 163)
})

test('party directory renders counts, source information, and registry rows', () => {
  const html = renderToStaticMarkup(
    <PartiesDirectory parties={politicalParties} copy={copy} lang="en" />
  )

  assert.match(html, /Political parties registered/)
  assert.match(html, />320</)
  assert.match(html, />316</)
  assert.match(html, /Official CEP source/)
  assert.match(html, /does not confirm placement on the final ballot/)
  assert.match(html, /Fanmi Lavalas/)
  assert.match(html, /href="\/en\/parties\/cep-163"/)
  assert.match(html, /href="\/en\/parties\/digital-presence"/)
  assert.match(html, /Source row absent/)
  assert.doesNotMatch(html, /Verified digital presence/)
  assert.doesNotMatch(html, /Digital-presence methodology/)
})

test('party profile renders official facts and truthful research and candidate empty states', () => {
  const party = resolvePoliticalPartySlug('cep-1')!
  const html = renderToStaticMarkup(
    <PartyProfile
      party={party}
      presence={undefined}
      candidates={getPublishedCandidatesForParty('cep-1')}
      copy={profileCopy}
      lang="en"
    />
  )
  assert.match(html, /Official CEP party information/)
  assert.match(html, /Zouti Pou Yon Lot Ayiti/)
  assert.match(html, /Official Digital Presence/)
  assert.match(html, /has not yet completed its digital-presence review/)
  assert.match(html, /Platform research is pending/)
  assert.match(html, /Candidate information is not yet available/)
  assert.match(html, /href="\/en\/parties"/)
})
