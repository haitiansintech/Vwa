import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import './test-env'
import {
  filterPoliticalParties,
  politicalParties,
  validatePoliticalPartyDataset,
} from '@/lib/political-parties'
import { PartiesDirectory, type PartiesDirectoryCopy } from '@/components/parties/parties-directory'

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
  viewProfile: 'Detailed profile available',
  tableCaption: 'Official CEP political party registry',
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
  assert.match(html, /Source row absent/)
})
