import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import type { ChannelType, PublishedPartyPresence } from '@/lib/party-monitor/types'
import { getPresenceState, getPublicOfficialChannels } from '@/lib/party-presence'
import type { PublishedPoliticalCandidate } from '@/lib/political-candidates'
import type { PoliticalGrouping } from '@/lib/political-groupings'
import type { PoliticalParty } from '@/lib/political-parties'
import { Badge } from '@/components/ui/badge'

export type PartyProfileCopy = {
  backToParties: string
  officialInformation: string
  cepSequence: string
  cepStatus: string
  politicalGrouping: string
  electionCycle: string
  electionCycleValue: string
  sourcePublication: string
  lastDataUpdate: string
  approved: string
  notApproved: string
  officialDigitalPresence: string
  vwaResearchNotice: string
  reviewPending: string
  noPresenceFound: string
  verifiedActive: string
  verifiedUnreachable: string
  archivedInactive: string
  lastChecked: string
  lastHumanReview: string
  verificationEvidence: string
  politicalPlatform: string
  platformPending: string
  platformFull: string
  platformSummary: string
  platformVision: string
  platformSlogans: string
  platformNoneFound: string
  platformUnknown: string
  originalLanguages: string
  platformSource: string
  candidates: string
  candidatesUnavailable: string
  office: string
  geography: string
  candidateStatus: string
  sourcesAndHistory: string
  officialCepSource: string
  officialCepGroupingSource: string
  cepPublicationPage: string
  digitalPresenceSnapshot: string
  channelLabels: Record<ChannelType, string>
}

type Props = {
  party: PoliticalParty
  groupings: PoliticalGrouping[]
  presence?: PublishedPartyPresence
  candidates: PublishedPoliticalCandidate[]
  copy: PartyProfileCopy
  lang: string
}

const platformCopyKey = {
  full_platform: 'platformFull',
  platform_summary: 'platformSummary',
  general_vision: 'platformVision',
  slogans_only: 'platformSlogans',
  none_found: 'platformNoneFound',
  unknown: 'platformUnknown',
} as const

export function PartyProfile({ party, groupings, presence, candidates, copy, lang }: Props) {
  const channels = getPublicOfficialChannels(presence)
  const presenceState = getPresenceState(presence)
  const stateLabel = {
    review_pending: copy.reviewPending,
    none_found: copy.noPresenceFound,
    verified_active: copy.verifiedActive,
    verified_unreachable: copy.verifiedUnreachable,
    archived_or_inactive: copy.archivedInactive,
  }[presenceState]
  const lastPresenceChange = presence?.changeHistory[presence.changeHistory.length - 1]?.at

  return (
    <div className="container max-w-5xl py-12 md:py-20">
      <Link
        href={`/${lang}/parties`}
        className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        ← {copy.backToParties}
      </Link>

      <header className="mt-6 border-b pb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {copy.officialInformation}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {party.name ?? copy.officialInformation}
          </h1>
          {party.acronym && <Badge variant="outline">{party.acronym}</Badge>}
        </div>
        <dl className="mt-6 grid gap-4 rounded-xl border bg-muted/30 p-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Fact label={copy.cepSequence} value={String(party.sequence)} />
          <Fact
            label={copy.cepStatus}
            value={party.status === 'approved' ? copy.approved : copy.notApproved}
          />
          {groupings.length > 0 && (
            <Fact
              label={copy.politicalGrouping}
              value={groupings.map((grouping) => grouping.name).join(', ')}
            />
          )}
          <Fact label={copy.electionCycle} value={copy.electionCycleValue} />
          <Fact label={copy.sourcePublication} value={party.sourcePublished} />
          <Fact label={copy.lastDataUpdate} value={lastPresenceChange ?? party.sourcePublished} />
        </dl>
      </header>

      <section className="mt-10" aria-labelledby="digital-presence-heading">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="digital-presence-heading" className="font-heading text-2xl font-bold">
              {copy.officialDigitalPresence}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {copy.vwaResearchNotice}
            </p>
          </div>
          <Link
            href={`/${lang}/parties/digital-presence`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {copy.digitalPresenceSnapshot} →
          </Link>
        </div>
        <div className="mt-5 rounded-xl border p-5">
          <Badge variant="outline">{stateLabel}</Badge>
          {channels.length > 0 && (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {channels.map((channel) => (
                <li key={channel.id} className="rounded-lg border bg-card p-4">
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  >
                    {copy.channelLabels[channel.type]}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                  <dl className="mt-3 space-y-2 text-xs text-muted-foreground">
                    {channel.lastSuccessfullyReachedAt && (
                      <Fact label={copy.lastChecked} value={channel.lastSuccessfullyReachedAt} />
                    )}
                    {channel.lastHumanVerifiedAt && (
                      <Fact label={copy.lastHumanReview} value={channel.lastHumanVerifiedAt} />
                    )}
                  </dl>
                  {channel.evidence.length > 0 && (
                    <div className="mt-3 text-xs">
                      <p className="font-medium">{copy.verificationEvidence}</p>
                      {channel.evidence.map((evidence) => (
                        <p
                          key={`${channel.id}-${evidence.description}`}
                          className="mt-1 text-muted-foreground"
                        >
                          {evidence.description}
                        </p>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="platform-heading">
        <h2 id="platform-heading" className="font-heading text-2xl font-bold">
          {copy.politicalPlatform}
        </h2>
        <div className="mt-5 rounded-xl border p-5">
          {!presence || presence.researchStatus !== 'researched' ? (
            <p className="text-sm text-muted-foreground">{copy.platformPending}</p>
          ) : (
            <>
              <p className="font-medium">
                {copy[platformCopyKey[presence.platform.classification]]}
              </p>
              {presence.platform.languages.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {copy.originalLanguages}: {presence.platform.languages.join(', ')}
                </p>
              )}
              {presence.platform.urls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-3 mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  {copy.platformSource}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ))}
              {presence.platform.lastHumanVerifiedAt && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {copy.lastHumanReview}: {presence.platform.lastHumanVerifiedAt}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="candidates-heading">
        <h2 id="candidates-heading" className="font-heading text-2xl font-bold">
          {copy.candidates}
        </h2>
        {candidates.length === 0 ? (
          <p className="mt-5 rounded-xl border p-5 text-sm text-muted-foreground">
            {copy.candidatesUnavailable}
          </p>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {candidates.map((candidate) => (
              <li key={candidate.id} className="rounded-xl border p-5">
                {candidate.profileSlug ? (
                  <Link
                    href={`/${lang}/people/${candidate.profileSlug}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {candidate.name}
                  </Link>
                ) : (
                  <p className="font-semibold">{candidate.name}</p>
                )}
                <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {candidate.office && <Fact label={copy.office} value={candidate.office} />}
                  {[candidate.department, candidate.commune, candidate.constituency].filter(Boolean)
                    .length > 0 && (
                    <Fact
                      label={copy.geography}
                      value={[candidate.department, candidate.commune, candidate.constituency]
                        .filter(Boolean)
                        .join(' · ')}
                    />
                  )}
                  {candidate.cepStatus && (
                    <Fact label={copy.candidateStatus} value={candidate.cepStatus} />
                  )}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10" aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="font-heading text-2xl font-bold">
          {copy.sourcesAndHistory}
        </h2>
        <div className="mt-5 rounded-xl border p-5 text-sm">
          <ul className="space-y-3">
            <li>
              <a
                href={party.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                {copy.officialCepSource}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={party.publicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                {copy.cepPublicationPage}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </li>
            {groupings.length > 0 && (
              <li>
                <a
                  href={groupings[0].sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  {copy.officialCepGroupingSource}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </li>
            )}
            {presence?.changeHistory.map((event) => (
              <li key={`${event.at}-${event.description}`} className="text-muted-foreground">
                {event.at} · {event.description}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-foreground">{label}</dt>
      <dd className="mt-0.5 text-muted-foreground">{value}</dd>
    </div>
  )
}
