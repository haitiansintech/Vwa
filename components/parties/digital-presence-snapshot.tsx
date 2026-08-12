'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Search } from 'lucide-react'

import type { ChannelType, PublishedPartyPresence } from '@/lib/party-monitor/types'
import { getPresenceState, getPublicOfficialChannels } from '@/lib/party-presence'
import type { PoliticalParty } from '@/lib/political-parties'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type SnapshotRow = { party: PoliticalParty; presence?: PublishedPartyPresence }

export type DigitalPresenceSnapshotCopy = {
  searchLabel: string
  searchPlaceholder: string
  filterLabel: string
  all: string
  verifiedActive: string
  verifiedUnreachable: string
  archivedInactive: string
  noPresenceFound: string
  reviewPending: string
  partyColumn: string
  websiteColumn: string
  channelsColumn: string
  platformColumn: string
  lastReviewedColumn: string
  noResults: string
  results: string
  activeWebsite: string
  unavailableWebsite: string
  noVerifiedWebsite: string
  platformFull: string
  platformSummary: string
  platformVision: string
  platformSlogans: string
  platformNone: string
  platformPending: string
  channelLabels: Record<ChannelType, string>
}

type StateFilter = 'all' | ReturnType<typeof getPresenceState>

const filterOrder: StateFilter[] = [
  'all',
  'verified_active',
  'verified_unreachable',
  'archived_or_inactive',
  'none_found',
  'review_pending',
]

export function DigitalPresenceSnapshot({
  rows,
  copy,
  lang,
}: {
  rows: SnapshotRow[]
  copy: DigitalPresenceSnapshotCopy
  lang: string
}) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<StateFilter>('all')
  const filteredRows = useMemo(() => {
    const normalized = query.toLocaleLowerCase().trim()
    return rows.filter(({ party, presence }) => {
      const matchesQuery =
        !normalized ||
        `${party.name ?? ''} ${party.acronym ?? ''}`.toLocaleLowerCase().includes(normalized)
      return matchesQuery && (state === 'all' || getPresenceState(presence) === state)
    })
  }, [query, rows, state])
  const stateLabels: Record<StateFilter, string> = {
    all: copy.all,
    verified_active: copy.verifiedActive,
    verified_unreachable: copy.verifiedUnreachable,
    archived_or_inactive: copy.archivedInactive,
    none_found: copy.noPresenceFound,
    review_pending: copy.reviewPending,
  }

  return (
    <section aria-labelledby="snapshot-list-heading">
      <h2 id="snapshot-list-heading" className="sr-only">
        {copy.partyColumn}
      </h2>
      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label htmlFor="presence-search" className="mb-2 block text-sm font-medium">
              {copy.searchLabel}
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="presence-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium" id="presence-filter-label">
              {copy.filterLabel}
            </p>
            <div
              className="flex max-w-2xl flex-wrap gap-2"
              role="group"
              aria-labelledby="presence-filter-label"
            >
              {filterOrder.map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  size="sm"
                  variant={state === filter ? 'default' : 'outline'}
                  aria-pressed={state === filter}
                  onClick={() => setState(filter)}
                >
                  {stateLabels[filter]}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          {copy.results.replace('{count}', String(filteredRows.length))}
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{copy.partyColumn}</th>
                <th className="px-4 py-3">{copy.websiteColumn}</th>
                <th className="px-4 py-3">{copy.channelsColumn}</th>
                <th className="px-4 py-3">{copy.platformColumn}</th>
                <th className="px-4 py-3">{copy.lastReviewedColumn}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRows.map(({ party, presence }) => {
                const channels = getPublicOfficialChannels(presence)
                const website = channels.find((channel) => channel.type === 'website')
                const linkedChannels = channels.filter((channel) => channel.type !== 'website')
                const presenceState = getPresenceState(presence)
                const lastReviewed = [
                  presence?.platform.lastHumanVerifiedAt,
                  ...channels.map((channel) => channel.lastHumanVerifiedAt),
                ]
                  .filter((value): value is string => Boolean(value))
                  .sort()
                  .at(-1)
                const platformLabel =
                  !presence || presence.researchStatus !== 'researched'
                    ? copy.platformPending
                    : {
                        full_platform: copy.platformFull,
                        platform_summary: copy.platformSummary,
                        general_vision: copy.platformVision,
                        slogans_only: copy.platformSlogans,
                        none_found: copy.platformNone,
                        unknown: copy.platformPending,
                      }[presence.platform.classification]
                return (
                  <tr key={party.sequence} className="align-top">
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/${lang}/parties/${party.profileSlug}`}
                          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {party.name}
                        </Link>
                        {party.acronym && (
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {party.acronym}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {website ? (
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {website.operationalStatus === 'reachable'
                            ? copy.activeWebsite
                            : ['unreachable', 'temporarily_unreachable', 'unavailable'].includes(
                                  website.operationalStatus
                                )
                              ? copy.unavailableWebsite
                              : copy.channelLabels.website}
                          <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                      ) : (
                        copy.noVerifiedWebsite
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {linkedChannels.length > 0 ? (
                          linkedChannels.map((channel) => (
                            <a
                              key={channel.id}
                              href={channel.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${copy.channelLabels[channel.type]}: ${party.name}`}
                              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Badge
                                variant="outline"
                                className="gap-1 transition-colors hover:bg-accent"
                              >
                                {copy.channelLabels[channel.type]}
                                <ExternalLink className="size-3" aria-hidden="true" />
                              </Badge>
                            </a>
                          ))
                        ) : channels.length > 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="text-muted-foreground">
                            {stateLabels[presenceState]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{platformLabel}</td>
                    <td className="p-4 text-muted-foreground">{lastReviewed ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && (
          <p className="p-10 text-center text-sm text-muted-foreground">{copy.noResults}</p>
        )}
      </div>
    </section>
  )
}
