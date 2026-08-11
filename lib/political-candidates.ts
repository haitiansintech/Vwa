import rawCandidates from '@/data/cep-party-candidates.json'

export type CandidatePartyAffiliation = {
  partyId: string
  electionCycle: string
  sourceTitle: string
  sourceUrl: string
  sourcePublishedAt: string
}

export type PublishedPoliticalCandidate = {
  id: string
  name: string
  profileSlug: string | null
  office: string | null
  department: string | null
  commune: string | null
  constituency: string | null
  electionRound: string | null
  cepStatus: string | null
  affiliations: CandidatePartyAffiliation[]
}

export const publishedPoliticalCandidates = rawCandidates as PublishedPoliticalCandidate[]

export function getPublishedCandidatesForParty(partyId: string) {
  return publishedPoliticalCandidates.filter((candidate) =>
    candidate.affiliations.some((affiliation) => affiliation.partyId === partyId)
  )
}
