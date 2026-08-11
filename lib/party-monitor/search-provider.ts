export type SearchCandidate = {
  url: string
  title: string
  snippet: string
  provider: string
}

export interface PartySearchProvider {
  readonly name: string
  readonly enabled: boolean
  searchPartyPresence(input: {
    partyId: string
    officialName: string
    acronym: string | null
  }): Promise<SearchCandidate[]>
}

export class DisabledPartySearchProvider implements PartySearchProvider {
  readonly name = 'disabled'
  readonly enabled = false

  async searchPartyPresence() {
    return []
  }
}

// No search provider is configured in Vwa. Future integrations must implement this
// interface and return candidates for human review, never verified official records.
export const partySearchProvider: PartySearchProvider = new DisabledPartySearchProvider()
