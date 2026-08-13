import rawGroupingData from '@/data/cep-political-groupings.json'

import {
  normalizePartySearch,
  politicalParties,
  type PoliticalParty,
} from '@/lib/political-parties'

export const CEP_GROUPINGS_SOURCE_URL =
  'https://cephaiti.ht/wp-content/uploads/2026/08/NOTE-PUBLICATION-DES-GROUPEMENTS-POLITIQUES-AGREES-cep.pdf'
export const CEP_GROUPINGS_PUBLICATION_URL =
  'https://cephaiti.ht/publication-de-la-liste-des-groupements-politiques-agrees/'
export const CEP_GROUPINGS_SOURCE_PUBLISHED = '2026-08-08'

type UnlinkedGroupingMember = {
  name: string
  acronym: string
}

type RawPoliticalGrouping = {
  id: string
  name: string
  acronym: string
  representative: string
  memberSequences: number[]
  unlinkedMembers?: UnlinkedGroupingMember[]
  sourceDeclaredMemberCount?: number
}

export type PoliticalGrouping = Omit<RawPoliticalGrouping, 'memberSequences'> & {
  members: PoliticalParty[]
  memberCount: number
  sourceUrl: typeof CEP_GROUPINGS_SOURCE_URL
  publicationUrl: typeof CEP_GROUPINGS_PUBLICATION_URL
  sourcePublished: typeof CEP_GROUPINGS_SOURCE_PUBLISHED
}

const partiesBySequence = new Map(politicalParties.map((party) => [party.sequence, party]))

export const politicalGroupings: PoliticalGrouping[] = (
  rawGroupingData as RawPoliticalGrouping[]
).map((grouping) => {
  const members = grouping.memberSequences.map((sequence) => {
    const party = partiesBySequence.get(sequence)
    if (!party) throw new Error(`Grouping ${grouping.id} references unknown party ${sequence}.`)
    return party
  })

  return {
    ...grouping,
    members,
    memberCount: members.length + (grouping.unlinkedMembers?.length ?? 0),
    sourceUrl: CEP_GROUPINGS_SOURCE_URL,
    publicationUrl: CEP_GROUPINGS_PUBLICATION_URL,
    sourcePublished: CEP_GROUPINGS_SOURCE_PUBLISHED,
  }
})

export const politicalGroupingStats = {
  registered: 18,
  approved: politicalGroupings.length,
  notApproved: 3,
  memberParties: politicalGroupings.reduce((total, grouping) => total + grouping.memberCount, 0),
}

export function filterPoliticalGroupings(groupings: PoliticalGrouping[], query: string) {
  const normalizedQuery = normalizePartySearch(query)
  if (!normalizedQuery) return groupings

  return groupings.filter((grouping) =>
    normalizePartySearch(
      [
        grouping.name,
        grouping.acronym,
        grouping.representative,
        ...grouping.members.flatMap((party) => [party.name ?? '', party.acronym ?? '']),
        ...(grouping.unlinkedMembers ?? []).flatMap((party) => [party.name, party.acronym]),
      ].join(' ')
    ).includes(normalizedQuery)
  )
}

export function getPoliticalGroupingsForParty(sequence: number) {
  return politicalGroupings.filter((grouping) =>
    grouping.members.some((party) => party.sequence === sequence)
  )
}

export function validatePoliticalGroupingDataset(groupings = politicalGroupings) {
  const errors: string[] = []
  const memberSequences = groupings.flatMap((grouping) =>
    grouping.members.map((party) => party.sequence)
  )

  if (groupings.length !== 15)
    errors.push(`Expected 15 approved groupings, found ${groupings.length}.`)
  if (groupings.reduce((total, grouping) => total + grouping.memberCount, 0) !== 208) {
    errors.push('Expected 208 party memberships across approved groupings.')
  }
  if (new Set(groupings.map((grouping) => grouping.id)).size !== groupings.length) {
    errors.push('Grouping identifiers are not unique.')
  }
  if (new Set(memberSequences).size !== memberSequences.length) {
    errors.push('A linked party appears in more than one approved grouping.')
  }
  if (groupings.some((grouping) => grouping.members.some((party) => party.status !== 'approved'))) {
    errors.push('A non-approved party appears in an approved grouping.')
  }

  if (errors.length > 0) throw new Error(errors.join('\n'))

  return {
    approved: groupings.length,
    memberParties: groupings.reduce((total, grouping) => total + grouping.memberCount, 0),
    linkedParties: memberSequences.length,
    unlinkedParties: groupings.reduce(
      (total, grouping) => total + (grouping.unlinkedMembers?.length ?? 0),
      0
    ),
  }
}

validatePoliticalGroupingDataset()
