import type { Metadata } from 'next'
import Link from 'next/link'
import type { SiteLang } from '@/types'

import {
  calculateChannelBreakdown,
  calculatePresenceStats,
  getPartyPresence,
} from '@/lib/party-presence'
import { politicalParties } from '@/lib/political-parties'
import {
  DigitalPresenceSnapshot,
  type DigitalPresenceSnapshotCopy,
} from '@/components/parties/digital-presence-snapshot'
import { getTranslation } from '@/app/i18n'

type Props = { params: { lang: SiteLang } }

export async function generateMetadata({ params: { lang } }: Props): Promise<Metadata> {
  const { t } = await getTranslation(lang)
  return {
    title: t('parties.snapshot.metaTitle'),
    description: t('parties.snapshot.metaDescription'),
  }
}

export default async function DigitalPresencePage({ params: { lang } }: Props) {
  const { t } = await getTranslation(lang)
  const approvedParties = politicalParties.filter((party) => party.status === 'approved')
  const sequences = approvedParties.map((party) => party.sequence)
  const stats = calculatePresenceStats(sequences)
  const channels = calculateChannelBreakdown(sequences)
  const copy: DigitalPresenceSnapshotCopy = {
    searchLabel: t('parties.snapshot.searchLabel'),
    searchPlaceholder: t('parties.snapshot.searchPlaceholder'),
    filterLabel: t('parties.snapshot.filterLabel'),
    all: t('parties.snapshot.all'),
    verifiedActive: t('parties.profile.verifiedActive'),
    verifiedUnreachable: t('parties.profile.verifiedUnreachable'),
    archivedInactive: t('parties.profile.archivedInactive'),
    noPresenceFound: t('parties.profile.noPresenceFound'),
    reviewPending: t('parties.profile.reviewPending'),
    partyColumn: t('parties.snapshot.partyColumn'),
    websiteColumn: t('parties.snapshot.websiteColumn'),
    channelsColumn: t('parties.snapshot.channelsColumn'),
    platformColumn: t('parties.snapshot.platformColumn'),
    lastReviewedColumn: t('parties.snapshot.lastReviewedColumn'),
    noResults: t('parties.snapshot.noResults'),
    results: t('parties.snapshot.results'),
    activeWebsite: t('parties.snapshot.activeWebsite'),
    unavailableWebsite: t('parties.snapshot.unavailableWebsite'),
    noVerifiedWebsite: t('parties.snapshot.noVerifiedWebsite'),
    platformFull: t('parties.profile.platformFull'),
    platformSummary: t('parties.profile.platformSummary'),
    platformVision: t('parties.profile.platformVision'),
    platformSlogans: t('parties.profile.platformSlogans'),
    platformNone: t('parties.profile.platformNoneFound'),
    platformPending: t('parties.profile.platformPending'),
    channelLabels: {
      website: t('parties.channels.website'),
      facebook: t('parties.channels.facebook'),
      x: t('parties.channels.x'),
      instagram: t('parties.channels.instagram'),
      youtube: t('parties.channels.youtube'),
      tiktok: t('parties.channels.tiktok'),
      other: t('parties.channels.other'),
      platform_page: t('parties.channels.platformPage'),
      platform_document: t('parties.channels.platformDocument'),
      contact_page: t('parties.channels.contactPage'),
    },
  }
  const socialTypes = ['facebook', 'x', 'instagram', 'youtube', 'tiktok'] as const
  const socialBreakdown = socialTypes.map((type) => ({
    type,
    count: channels[type] ?? 0,
  }))

  return (
    <div className="container max-w-6xl py-12 md:py-20">
      <Link href={`/${lang}/parties`} className="text-sm font-medium text-primary hover:underline">
        ← {t('parties.profile.backToParties')}
      </Link>
      <header className="mt-6 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {t('parties.snapshot.eyebrow')}
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          {t('parties.snapshot.heading')}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          {t('parties.snapshot.summary')}
        </p>
      </header>
      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('parties.researched')} value={stats.researched} />
        <Stat label={t('parties.notResearched')} value={stats.notResearched} />
        <Stat label={t('parties.officialPresence')} value={stats.verifiedPresence} />
        <Stat label={t('parties.activeWebsite')} value={stats.verifiedActiveWebsite} />
        <Stat
          label={t('parties.snapshot.noPresenceCompleted')}
          value={stats.noVerifiedPresenceFound}
        />
        <div className="rounded-xl border bg-card p-5">
          <dt className="text-sm text-muted-foreground">{t('parties.latestAudit')}</dt>
          <dd className="mt-2 text-lg font-semibold">
            {stats.latestCompletedAudit ?? t('parties.latestAuditNever')}
          </dd>
        </div>
      </dl>
      {socialBreakdown.some((item) => item.count > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {socialBreakdown.map(({ type, count }) => (
            <BadgeStat key={type} label={copy.channelLabels[type]} value={count} />
          ))}
        </div>
      )}
      <div className="mt-10">
        <DigitalPresenceSnapshot
          rows={approvedParties.map((party) => ({
            party,
            presence: getPartyPresence(party.sequence),
          }))}
          copy={copy}
          lang={lang}
        />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-heading text-4xl font-bold">{value}</dd>
    </div>
  )
}

function BadgeStat({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border px-3 py-1 text-sm">
      {label}: {value}
    </span>
  )
}
