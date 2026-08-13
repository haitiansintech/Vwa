'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Search,
  Users,
  XCircle,
} from 'lucide-react'

import {
  filterPoliticalGroupings,
  politicalGroupingStats,
  type PoliticalGrouping,
} from '@/lib/political-groupings'
import {
  filterPoliticalParties,
  type PartyStatusFilter,
  type PoliticalParty,
} from '@/lib/political-parties'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type PartiesDirectoryCopy = {
  eyebrow: string
  heading: string
  summary: string
  groupingsRegistered: string
  groupingsApproved: string
  memberParties: string
  groupingsView: string
  partiesView: string
  groupingsHeading: string
  groupingsIntro: string
  groupingSearchLabel: string
  groupingSearchPlaceholder: string
  groupingResults: string
  noGroupings: string
  representative: string
  memberCount: string
  members: string
  noProfileLink: string
  partyRegistryHeading: string
  partyRegistrySummary: string
  partyRegistryNote: string
  registered: string
  approved: string
  notApproved: string
  searchLabel: string
  searchPlaceholder: string
  filterLabel: string
  all: string
  approvedFilter: string
  notApprovedFilter: string
  partyColumn: string
  acronymColumn: string
  statusColumn: string
  results: string
  noResults: string
  officialSource: string
  publicationPage: string
  sourcePublished: string
  qualificationNote: string
  sourceAnomaly: string
  missingName: string
  needsReview: string
  tableCaption: string
  digitalPresenceSnapshotLink: string
}

type PartiesDirectoryProps = {
  groupings: PoliticalGrouping[]
  parties: PoliticalParty[]
  copy: PartiesDirectoryCopy
  lang: string
}

type DirectoryView = 'groupings' | 'parties'
const filters: PartyStatusFilter[] = ['all', 'approved', 'not-approved']

export function PartiesDirectory({ groupings, parties, copy, lang }: PartiesDirectoryProps) {
  const [view, setView] = useState<DirectoryView>('groupings')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PartyStatusFilter>('all')
  const filteredGroupings = useMemo(
    () => filterPoliticalGroupings(groupings, query),
    [groupings, query]
  )
  const filteredParties = useMemo(
    () => filterPoliticalParties(parties, query, status),
    [parties, query, status]
  )
  const partyStats = {
    total: parties.length,
    approved: parties.filter((party) => party.status === 'approved').length,
    notApproved: parties.filter((party) => party.status === 'not-approved').length,
  }
  const filterLabels: Record<PartyStatusFilter, string> = {
    all: copy.all,
    approved: copy.approvedFilter,
    'not-approved': copy.notApprovedFilter,
  }

  return (
    <div className="container max-w-6xl py-12 md:py-20">
      <header className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{copy.eyebrow}</p>
        <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          {copy.heading}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{copy.summary}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a
            href={groupings[0].sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copy.officialSource}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          <a
            href={groupings[0].publicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copy.publicationPage}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          <span className="text-muted-foreground">{copy.sourcePublished}</span>
        </div>
        <Link
          href={`/${lang}/parties/digital-presence`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copy.digitalPresenceSnapshotLink}
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard label={copy.groupingsRegistered} value={politicalGroupingStats.registered} />
        <StatCard
          label={copy.groupingsApproved}
          value={politicalGroupingStats.approved}
          tone="approved"
        />
        <StatCard label={copy.memberParties} value={politicalGroupingStats.memberParties} />
      </dl>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6">
          <div className="flex gap-3">
            <Users
              className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400"
              aria-hidden="true"
            />
            <p>{copy.qualificationNote}</p>
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6">
          <div className="flex gap-3">
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400"
              aria-hidden="true"
            />
            <p>{copy.sourceAnomaly}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label={copy.heading}>
        <Button
          type="button"
          variant={view === 'groupings' ? 'default' : 'outline'}
          aria-pressed={view === 'groupings'}
          onClick={() => {
            setView('groupings')
            setQuery('')
          }}
        >
          {copy.groupingsView}
        </Button>
        <Button
          type="button"
          variant={view === 'parties' ? 'default' : 'outline'}
          aria-pressed={view === 'parties'}
          onClick={() => {
            setView('parties')
            setQuery('')
          }}
        >
          {copy.partiesView}
        </Button>
      </div>

      {view === 'groupings' ? (
        <GroupingDirectory
          groupings={filteredGroupings}
          total={groupings.length}
          query={query}
          setQuery={setQuery}
          copy={copy}
          lang={lang}
        />
      ) : (
        <PartyRegistry
          parties={filteredParties}
          stats={partyStats}
          query={query}
          setQuery={setQuery}
          status={status}
          setStatus={setStatus}
          filterLabels={filterLabels}
          copy={copy}
          lang={lang}
        />
      )}
    </div>
  )
}

function GroupingDirectory({
  groupings,
  total,
  query,
  setQuery,
  copy,
  lang,
}: {
  groupings: PoliticalGrouping[]
  total: number
  query: string
  setQuery: (value: string) => void
  copy: PartiesDirectoryCopy
  lang: string
}) {
  return (
    <section className="mt-8" aria-labelledby="groupings-heading">
      <div className="max-w-3xl">
        <h2 id="groupings-heading" className="font-heading text-3xl font-bold">
          {copy.groupingsHeading}
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">{copy.groupingsIntro}</p>
      </div>
      <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <label htmlFor="grouping-search" className="mb-2 block text-sm font-medium">
          {copy.groupingSearchLabel}
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="grouping-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.groupingSearchPlaceholder}
            className="pl-9"
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          {copy.groupingResults
            .replace('{count}', String(groupings.length))
            .replace('{total}', String(total))}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {groupings.map((grouping) => (
          <GroupingCard key={grouping.id} grouping={grouping} copy={copy} lang={lang} />
        ))}
      </div>
      {groupings.length === 0 && (
        <p className="mt-5 rounded-xl border px-4 py-12 text-center text-sm text-muted-foreground">
          {copy.noGroupings}
        </p>
      )}
    </section>
  )
}

function GroupingCard({
  grouping,
  copy,
  lang,
}: {
  grouping: PoliticalGrouping
  copy: PartiesDirectoryCopy
  lang: string
}) {
  return (
    <article className="rounded-xl border bg-card shadow-sm">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-xl font-bold">{grouping.name}</h3>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{grouping.acronym}</p>
          </div>
          <Badge variant="outline" className="gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="size-3.5 text-emerald-600" aria-hidden="true" />
            {copy.approvedFilter}
          </Badge>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <Fact label={copy.representative} value={grouping.representative} />
          <Fact label={copy.memberCount} value={String(grouping.memberCount)} />
        </dl>
      </div>
      <details className="group border-t">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          {copy.members.replace('{count}', String(grouping.memberCount))}
          <ChevronDown
            className="size-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <ol className="grid gap-2 border-t px-5 py-4 text-sm sm:grid-cols-2">
          {grouping.unlinkedMembers?.map((party) => (
            <li key={party.acronym} className="flex items-start gap-2">
              <span className="text-muted-foreground">—</span>
              <span>
                <span className="font-medium">{party.name}</span> ({party.acronym})
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {copy.noProfileLink}
                </span>
              </span>
            </li>
          ))}
          {grouping.members.map((party) => (
            <li key={party.sequence} className="flex items-start gap-2">
              <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                {party.sequence}
              </span>
              <Link
                href={`/${lang}/parties/${party.profileSlug}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {party.name}{' '}
                {party.acronym && <span className="font-normal">({party.acronym})</span>}
              </Link>
            </li>
          ))}
        </ol>
      </details>
    </article>
  )
}

function PartyRegistry({
  parties,
  stats,
  query,
  setQuery,
  status,
  setStatus,
  filterLabels,
  copy,
  lang,
}: {
  parties: PoliticalParty[]
  stats: { total: number; approved: number; notApproved: number }
  query: string
  setQuery: (value: string) => void
  status: PartyStatusFilter
  setStatus: (status: PartyStatusFilter) => void
  filterLabels: Record<PartyStatusFilter, string>
  copy: PartiesDirectoryCopy
  lang: string
}) {
  return (
    <section className="mt-8" aria-labelledby="party-registry-heading">
      <div className="max-w-3xl">
        <h2 id="party-registry-heading" className="font-heading text-3xl font-bold">
          {copy.partyRegistryHeading}
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">{copy.partyRegistrySummary}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.partyRegistryNote}</p>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label={copy.registered} value={stats.total} />
        <StatCard label={copy.approved} value={stats.approved} tone="approved" />
        <StatCard label={copy.notApproved} value={stats.notApproved} tone="rejected" />
      </dl>
      <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label htmlFor="party-search" className="mb-2 block text-sm font-medium">
              {copy.searchLabel}
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="party-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium" id="party-status-filter-label">
              {copy.filterLabel}
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="party-status-filter-label"
            >
              {filters.map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  size="sm"
                  variant={status === filter ? 'default' : 'outline'}
                  aria-pressed={status === filter}
                  onClick={() => setStatus(filter)}
                >
                  {filterLabels[filter]}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          {copy.results.replace('{count}', String(parties.length))}
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.tableCaption}</caption>
            <thead className="border-b bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="w-16 px-4 py-3 font-semibold">
                  #
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {copy.partyColumn}
                </th>
                <th scope="col" className="w-48 px-4 py-3 font-semibold">
                  {copy.acronymColumn}
                </th>
                <th scope="col" className="w-44 px-4 py-3 font-semibold">
                  {copy.statusColumn}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {parties.map((party) => (
                <PartyRow key={party.sequence} party={party} copy={copy} lang={lang} />
              ))}
            </tbody>
          </table>
        </div>
        {parties.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">{copy.noResults}</p>
        )}
      </div>
    </section>
  )
}

function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'approved' | 'rejected'
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn('mt-2 font-heading text-4xl font-bold', {
          'text-emerald-700 dark:text-emerald-400': tone === 'approved',
          'text-red-700 dark:text-red-400': tone === 'rejected',
        })}
      >
        {value}
      </dd>
    </div>
  )
}

function PartyRow({
  party,
  copy,
  lang,
}: {
  party: PoliticalParty
  copy: PartiesDirectoryCopy
  lang: string
}) {
  const isApproved = party.status === 'approved'
  const needsReview = party.verification !== 'visually-verified'
  return (
    <tr className="align-top transition-colors hover:bg-muted/30">
      <th scope="row" className="p-4 font-mono text-xs font-medium text-muted-foreground">
        {party.sequence}
      </th>
      <td className="p-4">
        {party.name ? (
          <Link
            href={`/${lang}/parties/${party.profileSlug}`}
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {party.name}
          </Link>
        ) : (
          <span className="font-medium">{copy.missingName}</span>
        )}
        {needsReview && (
          <div className="mt-1">
            <Badge
              variant="outline"
              className="border-amber-500/60 text-amber-800 dark:text-amber-300"
            >
              {copy.needsReview}
            </Badge>
          </div>
        )}
      </td>
      <td className="p-4 font-mono text-xs sm:text-sm">
        {party.acronym ?? <span className="text-muted-foreground">—</span>}
      </td>
      <td className="p-4">
        <Badge
          variant="outline"
          className={cn('gap-1.5 whitespace-nowrap', {
            'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300':
              isApproved,
            'border-red-500/50 bg-red-500/10 text-red-800 dark:text-red-300': !isApproved,
          })}
        >
          {isApproved ? (
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
          ) : (
            <XCircle className="size-3.5" aria-hidden="true" />
          )}
          {isApproved ? copy.approvedFilter : copy.notApprovedFilter}
        </Badge>
      </td>
    </tr>
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
