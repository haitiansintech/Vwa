import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { SiteLang } from '@/types'

import { getPartyPresence } from '@/lib/party-presence'
import { getPublishedCandidatesForParty } from '@/lib/political-candidates'
import { getPoliticalGroupingsForParty } from '@/lib/political-groupings'
import { politicalParties, resolvePoliticalPartySlug } from '@/lib/political-parties'
import { PartyProfile, type PartyProfileCopy } from '@/components/parties/party-profile'
import { getTranslation } from '@/app/i18n'

type Props = {
  params: { lang: SiteLang; slug: string }
}

export function generateStaticParams() {
  return politicalParties.map((party) => ({ slug: party.profileSlug }))
}

export async function generateMetadata({ params: { lang, slug } }: Props): Promise<Metadata> {
  const party = resolvePoliticalPartySlug(slug)
  if (!party) return {}
  const { t } = await getTranslation(lang)
  return {
    title: t('parties.profile.metaTitle').replace(
      '{party}',
      party.name ?? t('parties.missingName')
    ),
    description: t('parties.profile.metaDescription').replace(
      '{party}',
      party.name ?? t('parties.missingName')
    ),
  }
}

export default async function PartyPage({ params: { lang, slug } }: Props) {
  const party = resolvePoliticalPartySlug(slug)
  if (!party) notFound()
  const { t } = await getTranslation(lang)
  const copy: PartyProfileCopy = {
    backToParties: t('parties.profile.backToParties'),
    officialInformation: t('parties.profile.officialInformation'),
    cepSequence: t('parties.profile.cepSequence'),
    cepStatus: t('parties.profile.cepStatus'),
    politicalGrouping: t('parties.profile.politicalGrouping'),
    electionCycle: t('parties.profile.electionCycle'),
    electionCycleValue: t('parties.profile.electionCycleValue'),
    sourcePublication: t('parties.profile.sourcePublication'),
    lastDataUpdate: t('parties.profile.lastDataUpdate'),
    approved: t('parties.approvedFilter'),
    notApproved: t('parties.notApprovedFilter'),
    officialDigitalPresence: t('parties.profile.officialDigitalPresence'),
    vwaResearchNotice: t('parties.profile.vwaResearchNotice'),
    reviewPending: t('parties.profile.reviewPending'),
    noPresenceFound: t('parties.profile.noPresenceFound'),
    verifiedActive: t('parties.profile.verifiedActive'),
    verifiedUnreachable: t('parties.profile.verifiedUnreachable'),
    archivedInactive: t('parties.profile.archivedInactive'),
    lastChecked: t('parties.profile.lastChecked'),
    lastHumanReview: t('parties.profile.lastHumanReview'),
    verificationEvidence: t('parties.profile.verificationEvidence'),
    politicalPlatform: t('parties.profile.politicalPlatform'),
    platformPending: t('parties.profile.platformPending'),
    platformFull: t('parties.profile.platformFull'),
    platformSummary: t('parties.profile.platformSummary'),
    platformVision: t('parties.profile.platformVision'),
    platformSlogans: t('parties.profile.platformSlogans'),
    platformNoneFound: t('parties.profile.platformNoneFound'),
    platformUnknown: t('parties.profile.platformUnknown'),
    originalLanguages: t('parties.profile.originalLanguages'),
    platformSource: t('parties.profile.platformSource'),
    candidates: t('parties.profile.candidates'),
    candidatesUnavailable: t('parties.profile.candidatesUnavailable'),
    office: t('parties.profile.office'),
    geography: t('parties.profile.geography'),
    candidateStatus: t('parties.profile.candidateStatus'),
    sourcesAndHistory: t('parties.profile.sourcesAndHistory'),
    officialCepSource: t('parties.profile.officialCepSource'),
    officialCepGroupingSource: t('parties.profile.officialCepGroupingSource'),
    cepPublicationPage: t('parties.profile.cepPublicationPage'),
    digitalPresenceSnapshot: t('parties.profile.digitalPresenceSnapshot'),
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

  return (
    <PartyProfile
      party={party}
      groupings={getPoliticalGroupingsForParty(party.sequence)}
      presence={getPartyPresence(party.sequence)}
      candidates={getPublishedCandidatesForParty(`cep-${party.sequence}`)}
      copy={copy}
      lang={lang}
    />
  )
}
