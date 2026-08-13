import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import './test-env'

import { getPublishedCandidatesForParty } from '@/lib/political-candidates'
import {
  filterPoliticalGroupings,
  politicalGroupings,
  validatePoliticalGroupingDataset,
} from '@/lib/political-groupings'
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
  eyebrow: 'CEP • August 2026',
  heading: 'Political groupings approved for the 2026–2027 electoral process',
  summary: 'Official CEP grouping registry.',
  groupingsRegistered: 'Groupings registered',
  groupingsApproved: 'Groupings approved',
  memberParties: 'Parties in approved groupings',
  groupingsView: 'Approved groupings',
  partiesView: 'All political parties',
  groupingsHeading: 'Approved political groupings',
  groupingsIntro: 'Each grouping brings together approved political parties.',
  groupingSearchLabel: 'Search groupings and member parties',
  groupingSearchPlaceholder: 'Search groupings',
  groupingResults: '{count} of {total} approved groupings shown',
  noGroupings: 'No approved grouping matches.',
  representative: 'CEP-listed representative',
  memberCount: 'Member parties',
  members: 'View {count} member parties',
  noProfileLink: 'No profile link available.',
  partyRegistryHeading: 'Complete political-party registry',
  partyRegistrySummary: 'The underlying July registry remains available.',
  partyRegistryNote: 'Rows 174, 202, and 309 are absent from the July table.',
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
  politicalGrouping: 'Approved political grouping',
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
  officialCepGroupingSource: 'Official CEP grouping publication',
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

test('CEP grouping dataset has the published totals and resolves known party profiles', () => {
  const result = validatePoliticalGroupingDataset()

  assert.equal(result.approved, 15)
  assert.equal(result.memberParties, 208)
  assert.equal(result.linkedParties, 205)
  assert.equal(result.unlinkedParties, 3)
})

test('grouping search matches grouping names, representatives, and member parties', () => {
  assert.deepEqual(
    filterPoliticalGroupings(politicalGroupings, 'Wadner').map((grouping) => grouping.id),
    ['soley']
  )
  assert.deepEqual(
    filterPoliticalGroupings(politicalGroupings, 'Fanmi Ayisyen').map((grouping) => grouping.id),
    ['ayiti-transfome']
  )
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

test('party directory defaults to approved political groupings and preserves party profile links', () => {
  const html = renderToStaticMarkup(
    <PartiesDirectory
      groupings={politicalGroupings}
      parties={politicalParties}
      copy={copy}
      lang="en"
    />
  )

  assert.match(html, /Political groupings approved/)
  assert.match(html, />18</)
  assert.match(html, />15</)
  assert.match(html, />208</)
  assert.match(html, /Official CEP source/)
  assert.match(html, /SOLÈY/)
  assert.match(html, /VIKTWA/)
  assert.match(html, /href="\/en\/parties\/cep-180"/)
  assert.match(html, /href="\/en\/parties\/digital-presence"/)
  assert.match(html, /Action Démocratique pour Bâtir Haïti/)
})

test('party profile renders official facts and truthful research and candidate empty states', () => {
  const party = resolvePoliticalPartySlug('cep-1')!
  const html = renderToStaticMarkup(
    <PartyProfile
      party={party}
      groupings={politicalGroupings.filter((grouping) =>
        grouping.members.some((member) => member.sequence === party.sequence)
      )}
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
