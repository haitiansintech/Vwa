'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, ExternalLink, Search, XCircle } from 'lucide-react'

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
  heading: string
  summary: string
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
  viewProfile: string
  tableCaption: string
}

type PartiesDirectoryProps = {
  parties: PoliticalParty[]
  copy: PartiesDirectoryCopy
  lang: string
}

const filters: PartyStatusFilter[] = ['all', 'approved', 'not-approved']

export function PartiesDirectory({ parties, copy, lang }: PartiesDirectoryProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PartyStatusFilter>('all')
  const filteredParties = useMemo(
    () => filterPoliticalParties(parties, query, status),
    [parties, query, status]
  )

  const stats = {
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
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">CEP · 2026</p>
        <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          {copy.heading}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{copy.summary}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a
            href={parties[0].sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            {copy.officialSource}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          <a
            href={parties[0].publicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline"
          >
            {copy.publicationPage}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          <span className="text-muted-foreground">{copy.sourcePublished}</span>
        </div>
      </header>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard label={copy.registered} value={stats.total} />
        <StatCard label={copy.approved} value={stats.approved} tone="approved" />
        <StatCard label={copy.notApproved} value={stats.notApproved} tone="rejected" />
      </dl>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6">
          <div className="flex gap-3">
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400"
              aria-hidden="true"
            />
            <p>{copy.qualificationNote}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p>{copy.sourceAnomaly}</p>
          </div>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="party-directory-controls">
        <h2 id="party-directory-controls" className="sr-only">
          {copy.tableCaption}
        </h2>
        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
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
            {copy.results.replace('{count}', String(filteredParties.length))}
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
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
                {filteredParties.map((party) => (
                  <PartyRow key={party.sequence} party={party} copy={copy} lang={lang} />
                ))}
              </tbody>
            </table>
          </div>
          {filteredParties.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">{copy.noResults}</p>
          )}
        </div>
      </section>
    </div>
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
        <div className="font-medium">
          {party.profileSlug && party.name ? (
            <Link
              href={`/${lang}/parties/${party.profileSlug}`}
              className="text-primary hover:underline"
            >
              {party.name}
            </Link>
          ) : (
            (party.name ?? copy.missingName)
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {party.profileSlug && (
            <span className="text-xs text-muted-foreground">{copy.viewProfile}</span>
          )}
          {needsReview && (
            <Badge
              variant="outline"
              className="border-amber-500/60 text-amber-800 dark:text-amber-300"
            >
              {copy.needsReview}
            </Badge>
          )}
        </div>
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
