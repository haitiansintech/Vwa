import clx from 'classnames'
import { getTranslation } from '@/app/i18n'
import { languages } from '@/app/i18n/settings'
import Link from 'next/link'
import { Trans } from 'react-i18next/TransWithoutContext'
import type { SiteLang, TType, WithClassName } from '@/types'

type Props = WithClassName<{
  lang: SiteLang,
  t: TType
}>

const getFlag = (lang: string) => {
  switch (lang) {
    case 'en':
      return '🇺🇸'
    case 'ht':
      return '🇭🇹'
  }
}

export const LanguageSwitcher = ({ lang, className, t }: Props) => {

  return (
    <div className={clx("text-2xl", className)}>
      <Trans i18nKey="languageSwitcher" t={t}>
        Switch from <strong>{getFlag(lang)}</strong> to:{' '}
      </Trans>
      {languages.filter((l) => lang !== l).map((l, index) => {
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