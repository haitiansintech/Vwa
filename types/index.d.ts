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
  | "eligible"
  | "likely_eligible"
  | "needs_verification"
  | "not_eligible"

export type EligibilityIntent =
  | "ready_to_act"
  | "learning_first"
  | "not_ready"

export type EligibilityAnswers = {
  bornInHaiti?: "yes" | "no" | "not_sure"
  haitianParent?: "yes" | "no" | "not_sure"
  hasDocuments?: "yes" | "some" | "no" | "not_sure"
  currentCountry?: string
  intendToVote?: "yes" | "exploring" | "no"
}
