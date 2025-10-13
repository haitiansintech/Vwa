import Link from "next/link"
import { Facebook, Linkedin, Twitter } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const shareTarget = encodeURIComponent(
  process.env.NEXT_PUBLIC_APP_URL ?? "https://vwa.community"
)
const shareMessage = encodeURIComponent(
  "Empowering the Haitian Diaspora for Change"
)

const shareLinks = [
  {
    href: `https://twitter.com/intent/tweet?text=${shareMessage}&url=${shareTarget}`,
    label: "Share on X (Twitter)",
    icon: Twitter,
  },
  {
    href: `https://www.facebook.com/sharer/sharer.php?u=${shareTarget}`,
    label: "Share on Facebook",
    icon: Facebook,
  },
  {
    href: `https://www.linkedin.com/shareArticle?mini=true&url=${shareTarget}&title=${shareMessage}`,
    label: "Share on LinkedIn",
    icon: Linkedin,
  },
] as const

const highlightSections = [
  {
    href: "/about",
    eyebrow: "About",
    title: "Our story of collective advocacy",
    description:
      "Discover how Vwa unites the Haitian diaspora to confront systemic challenges with organized, people-powered action.",
  },
  {
    href: "/take-action",
    eyebrow: "Take Action",
    title: "Turn solidarity into measurable impact",
    description:
      "Explore campaigns, events, and resources that make it simple to lend your time, voice, or support right now.",
  },
]

export function SiteHomePage() {
  return (
    <main className="bg-background">
      <section className="relative overflow-hidden">
        <div className="container py-16 sm:py-24 lg:py-32">
          <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[auto,1fr] lg:items-start lg:gap-24">
            <aside className="-ml-6 flex flex-row items-center gap-6 lg:-ml-12 lg:min-h-[18rem] lg:flex-col lg:items-start">
              <div className="flex items-center gap-2 lg:flex-col">
                <span
                  aria-hidden="true"
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.5em] text-muted-foreground lg:translate-x-1 lg:transform lg:[writing-mode:vertical-rl]"
                >
                  Share
                </span>
                <span className="h-px w-14 bg-muted lg:h-20 lg:w-px" aria-hidden="true" />
              </div>
              <nav aria-label="Share" className="flex flex-row gap-4 lg:flex-col">
                {shareLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </aside>

            <div className="flex flex-col gap-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                Collective Power
              </p>
              <div className="space-y-6">
                <h1 className="font-heading text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
                  Empowering the Haitian Diaspora for Change
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
                  Vwa connects organizers, advocates, and supporters across the globe to champion policies, drive investment,
                  and amplify Haitian-led solutions that build lasting change at home and abroad.
                </p>
              </div>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/take-action"
                  className={cn(buttonVariants({ size: "lg" }), "px-6 py-3 text-base font-semibold")}
                >
                  Join the Movement
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center text-base font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Learn about Vwa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/20 py-16 sm:py-20 lg:py-24">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                Continue Exploring
              </p>
              <h2 className="font-heading text-2xl text-foreground sm:text-3xl">
                Build knowledge and take meaningful steps
              </h2>
            </div>
            <Link
              href="/take-action"
              className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              All actions
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {highlightSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group flex h-full flex-col justify-between gap-6 rounded-3xl border border-border bg-card/80 p-8 transition-colors hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
                    {section.eyebrow}
                  </span>
                  <h3 className="font-heading text-2xl text-foreground transition-colors group-hover:text-primary">
                    {section.title}
                  </h3>
                  <p className="text-base text-muted-foreground">{section.description}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-foreground transition-colors group-hover:text-primary">
                  Explore
                  <svg
                    aria-hidden="true"
                    className="h-3 w-3 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 6h7M6 2l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default SiteHomePage
