import clx from 'classnames'
import { getTranslation } from '@/app/i18n'
import { languages } from '@/app/i18n/settings'
import Link from 'next/link'
import { Trans } from 'react-i18next/TransWithoutContext'
import { SiteLang } from '@/types'

type Props = {
  lng: SiteLang['lng']
  className?: string
}

const getFlag = (lng: string) => {
  switch (lng) {
    case 'en':
      return '🇺🇸'
    case 'ht':
      return '🇭🇹'
  }
}

export const LanguageSwitcher = async ({ lng, className}: Props) => {
  const { t } = await getTranslation(lng, 'footer')
  // const { t } = useTranslation(lng)

  return (
    <div className={clx("text-2xl", className)}>
      <Trans i18nKey="languageSwitcher" t={t}>
        Switch from <strong>{getFlag(lng)}</strong> to:{' '}
      </Trans>
      {languages.filter((l) => lng !== l).map((l, index) => {
        return (
          <span key={l}>
            {index > 0 && (' or ')}
            <Link href={`/${l}`}>
              {getFlag(l)}
            </Link>
          </span>
        )
      })}
    </div>
  )
}