import type { Icon } from "lucide-react"
import type { TFunction } from "i18next"

export type TType = TFunction
export type WithClassName<T> = T & { className?: string }

export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type MarketingConfig = {
  mainNav: MainNavItem[]
}

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  icon?: string
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: SidebarNavItem[]
    }
)

export type SiteLang = "en" | "ht"

export type EligibilityStatus =
  | "likely_eligible"
  | "may_be_eligible"
  | "more_info_needed"
  | "likely_ineligible"

export type EligibilityAnswers = {
  birthplace?: "haiti" | "abroad"
  haitianParent?: boolean
  hasHaitianId?: "yes" | "can_get" | "no"
  currentCountry?: string
  intendToVote?: boolean
}
