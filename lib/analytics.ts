import { track as vercelTrack } from "@vercel/analytics"

export type AnalyticsEvent =
  | "homepage_view"
  | "eligibility_checker_started"
  | "eligibility_checker_completed"
  | "eligibility_result_viewed"
  | "subscriber_signup_submitted"
  | "donation_banner_clicked"
  | "donation_completed"
  | "content_page_viewed"

export function track(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>
): void {
  try {
    vercelTrack(event, props)
  } catch {
    // analytics should never break the app
  }
}
