import type { Metadata } from 'next'
import type { SiteLang } from '@/types'

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
    heading: t('parties.heading'),
    summary: t('parties.summary'),
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
    viewProfile: t('parties.viewProfile'),
    tableCaption: t('parties.tableCaption'),
  }

  return <PartiesDirectory parties={politicalParties} copy={copy} lang={lang} />
}
