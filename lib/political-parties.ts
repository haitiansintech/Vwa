import rawPartyData from '@/data/cep-political-parties.json'

import type { PublishedPartyPresence } from '@/lib/party-monitor/types'
import { getPartyPresence } from '@/lib/party-presence'

export const CEP_PARTIES_SOURCE_URL =
  'https://cephaiti.ht/wp-content/uploads/2026/07/NOTE-PP-AGREES-9-JUILLET-2026.pdf'
export const CEP_PARTIES_PUBLICATION_URL =
  'https://cephaiti.ht/publication-de-la-liste-definitive-des-partis-politioues-agrees/'
export const CEP_PARTIES_SOURCE_PUBLISHED = '2026-07-09'
export const CEP_PARTIES_TABLE_DATE = '2026-07-07'
export const RESERVED_PARTY_SLUGS = new Set(['digital-presence'])

export type PartyApprovalStatus = 'approved' | 'not-approved'
export type PartyStatusFilter = 'all' | PartyApprovalStatus
export type PartyVerification = 'visually-verified' | 'needs-review' | 'source-row-missing'
export type PartyStatusEvidence = 'printed' | 'inferred-from-summary'

type RawPartyRecord = {
  sequence: number
  name: string | null
  acronym: string | null
  status: PartyApprovalStatus
  verification: PartyVerification
  statusEvidence: PartyStatusEvidence
  sourcePage: number
  sourceNote?: string
}

export type PoliticalParty = RawPartyRecord & {
  sourcePublished: typeof CEP_PARTIES_SOURCE_PUBLISHED
  sourceTableDate: typeof CEP_PARTIES_TABLE_DATE
  sourceUrl: typeof CEP_PARTIES_SOURCE_URL
  publicationUrl: typeof CEP_PARTIES_PUBLICATION_URL
  profileSlug: string
  digitalPresence?: PublishedPartyPresence
}

export function getPoliticalPartySlug(sequence: number) {
  return `cep-${sequence}`
}

export const politicalParties: PoliticalParty[] = (rawPartyData as RawPartyRecord[]).map(
  (party) => ({
    ...party,
    sourcePublished: CEP_PARTIES_SOURCE_PUBLISHED,
    sourceTableDate: CEP_PARTIES_TABLE_DATE,
    sourceUrl: CEP_PARTIES_SOURCE_URL,
    publicationUrl: CEP_PARTIES_PUBLICATION_URL,
    profileSlug: getPoliticalPartySlug(party.sequence),
    digitalPresence: getPartyPresence(party.sequence),
  })
)

export function resolvePoliticalPartySlug(slug: string) {
  if (RESERVED_PARTY_SLUGS.has(slug)) return undefined
  const match = /^cep-(\d+)$/.exec(slug)
  if (match) return politicalParties.find((party) => party.sequence === Number(match[1]))

  // Preserve the one profile URL that existed before stable CEP identifiers were introduced.
  if (slug === 'fanmi-lavalas') return politicalParties.find((party) => party.sequence === 163)
  return undefined
}

export const politicalPartyStats = {
  total: politicalParties.length,
  approved: politicalParties.filter((party) => party.status === 'approved').length,
  notApproved: politicalParties.filter((party) => party.status === 'not-approved').length,
}

export function normalizePartySearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim()
}

export function filterPoliticalParties(
  parties: PoliticalParty[],
  query: string,
  status: PartyStatusFilter
) {
  const normalizedQuery = normalizePartySearch(query)

  return parties.filter((party) => {
    const matchesStatus = status === 'all' || party.status === status
    if (!matchesStatus) return false
    if (!normalizedQuery) return true

    return normalizePartySearch(`${party.name ?? ''} ${party.acronym ?? ''}`).includes(
      normalizedQuery
    )
  })
}

const expectedRejectedParties = [
  [272, "Parti Nationaliste Chrétien d'Haïti", 'PNCH'],
  [299, 'Ayiti Demen Ansanm', 'AYIDA'],
  [301, "Mouvement National pour la Prospérité d'Haïti", 'MONAPHA'],
  [316, 'Parti Libéral Républicain Bloc Centriste', 'LR Bloc Centriste'],
] as const

export function validatePoliticalPartyDataset(parties = politicalParties) {
  const errors: string[] = []
  const sequences = parties.map((party) => party.sequence)
  const approved = parties.filter((party) => party.status === 'approved')
  const notApproved = parties.filter((party) => party.status === 'not-approved')

  if (parties.length !== 320) errors.push(`Expected 320 records, found ${parties.length}.`)
  if (approved.length !== 316) errors.push(`Expected 316 approved, found ${approved.length}.`)
  if (notApproved.length !== 4) {
    errors.push(`Expected 4 not approved, found ${notApproved.length}.`)
  }

  const uniqueSequences = new Set(sequences)
  if (uniqueSequences.size !== 320) errors.push('CEP sequence numbers are not unique.')
  for (let sequence = 1; sequence <= 320; sequence += 1) {
    if (!uniqueSequences.has(sequence)) errors.push(`Missing CEP sequence ${sequence}.`)
  }

  const printedKeys = parties
    .filter((party) => party.name && party.acronym)
    .map((party) => normalizePartySearch(`${party.name}|${party.acronym}`))
  if (new Set(printedKeys).size !== printedKeys.length) {
    errors.push('Duplicate party name/acronym records were introduced.')
  }

  for (const [sequence, name, acronym] of expectedRejectedParties) {
    const party = parties.find((item) => item.sequence === sequence)
    if (!party || party.name !== name || party.acronym !== acronym) {
      errors.push(`Rejected party ${sequence} does not match the verified CEP transcription.`)
    } else if (party.status !== 'not-approved') {
      errors.push(`Rejected party ${sequence} is not marked not-approved.`)
    }
  }

  if (errors.length > 0) throw new Error(errors.join('\n'))

  return {
    total: parties.length,
    approved: approved.length,
    notApproved: notApproved.length,
    uniqueSequences: uniqueSequences.size,
    needsReview: parties.filter((party) => party.verification !== 'visually-verified'),
  }
}

validatePoliticalPartyDataset()
