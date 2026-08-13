import type { Metadata } from 'next'
import type { SiteLang } from '@/types'

import { politicalGroupings } from '@/lib/political-groupings'
import { politicalParties } from '@/lib/political-parties'
import { PartiesDirectory, type PartiesDirectoryCopy } from '@/components/parties/parties-directory'
import { getTranslation } from '@/app/i18n'

type Props = {
  params: { lang: SiteLang }
}

export async function generateMetadata({ params: { lang } }: Props): Promise<Metadata> {
  const { t } = await getTranslation(lang)

  return {
    title: t('parties.metaTitle'),
    description: t('parties.metaDescription'),
  }
}

export default async function PartiesPage({ params: { lang } }: Props) {
  const { t } = await getTranslation(lang)
  const copy: PartiesDirectoryCopy = {
    eyebrow: t('parties.eyebrow'),
    heading: t('parties.heading'),
    summary: t('parties.summary'),
    groupingsRegistered: t('parties.groupingsRegistered'),
    groupingsApproved: t('parties.groupingsApproved'),
    memberParties: t('parties.memberParties'),
    groupingsView: t('parties.groupingsView'),
    partiesView: t('parties.partiesView'),
    groupingsHeading: t('parties.groupingsHeading'),
    groupingsIntro: t('parties.groupingsIntro'),
    groupingSearchLabel: t('parties.groupingSearchLabel'),
    groupingSearchPlaceholder: t('parties.groupingSearchPlaceholder'),
    groupingResults: t('parties.groupingResults'),
    noGroupings: t('parties.noGroupings'),
    representative: t('parties.representative'),
    memberCount: t('parties.memberCount'),
    members: t('parties.members'),
    noProfileLink: t('parties.noProfileLink'),
    partyRegistryHeading: t('parties.partyRegistryHeading'),
    partyRegistrySummary: t('parties.partyRegistrySummary'),
    partyRegistryNote: t('parties.partyRegistryNote'),
    registered: t('parties.registered'),
    approved: t('parties.approved'),
    notApproved: t('parties.notApproved'),
    searchLabel: t('parties.searchLabel'),
    searchPlaceholder: t('parties.searchPlaceholder'),
    filterLabel: t('parties.filterLabel'),
    all: t('parties.all'),
    approvedFilter: t('parties.approvedFilter'),
    notApprovedFilter: t('parties.notApprovedFilter'),
    partyColumn: t('parties.partyColumn'),
    acronymColumn: t('parties.acronymColumn'),
    statusColumn: t('parties.statusColumn'),
    results: t('parties.results'),
    noResults: t('parties.noResults'),
    officialSource: t('parties.officialSource'),
    publicationPage: t('parties.publicationPage'),
    sourcePublished: t('parties.sourcePublished'),
    qualificationNote: t('parties.qualificationNote'),
    sourceAnomaly: t('parties.sourceAnomaly'),
    missingName: t('parties.missingName'),
    needsReview: t('parties.needsReview'),
    tableCaption: t('parties.tableCaption'),
    digitalPresenceSnapshotLink: t('parties.digitalPresenceSnapshotLink'),
  }

  return (
    <PartiesDirectory
      groupings={politicalGroupings}
      parties={politicalParties}
      copy={copy}
      lang={lang}
    />
  )
}
