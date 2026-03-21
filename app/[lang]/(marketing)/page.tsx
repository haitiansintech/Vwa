import Link from "next/link"
import type { SiteLang } from "@/types"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { SubscriberForm } from "@/components/subscriber-form"
import { DonationBanner } from "@/components/donation-banner"

type Props = {
  params: { lang: SiteLang }
}

export const metadata = {
  title: "Vwa: Civic Platform for Haitians",
  description:
    "A free civic platform helping Haitians in the diaspora understand and participate in Haiti's historic election.",
}

export default function HomePage({ params: { lang } }: Props) {
  return (
    <>
      <DonationBanner />

      {/*
        ─── HERO ──────────────────────────────────────────────────────────────────
        Layer stack (bottom → top):
          Layer 0: background-image (WebP) — served directly, 246 KB, no sharp dep
          Layer 1: base dark overlay       — absolute bg-black/55
          Layer 2: directional gradient    — darkens top + bottom edges
          Layer 3: content                 — relative z-20, white text

        Note: CSS background-image is used instead of <Image fill> because the
        WebP is already pre-converted (2.9 MB PNG → 246 KB) so the size win is
        fully realized without the Next.js image optimization pipeline.
        ──────────────────────────────────────────────────────────────────────────
      */}
      <section
        className="relative w-full"
        style={{
          minHeight: "90vh",
          backgroundImage: "url('/images/hero-collage.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Layer 1: flat dark base — floors minimum contrast */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Layer 2: gradient — lightens center, darkens top + bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.20) 60%, rgba(0,0,0,0.78) 100%)",
          }}
        />

        {/* Layer 3: content */}
        <div className="relative z-20 flex flex-col items-center justify-center px-4 pb-8 pt-28 text-center md:pb-12 md:pt-36">
          {/* Badge */}
          <div className="mb-6 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium tracking-wide text-white/90 backdrop-blur-sm">
            Haiti 2026 Election
          </div>

          {/* Headline */}
          <h1 className="font-heading max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            A Historic Election<br className="hidden sm:block" /> Is Approaching
          </h1>

          {/* Supporting copy */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg md:text-xl md:leading-8">
            For the first time in years, Haiti has a path toward a legitimate democratic
            transition. Millions of Haitians in the diaspora may be eligible to participate.
            Vwa helps you understand what is at stake, whether you may be eligible, and what
            steps to take next.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${lang}/eligibility`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-w-52 bg-white text-gray-900 hover:bg-gray-100 focus-visible:ring-white"
              )}
            >
              Check Your Eligibility
            </Link>
            <Link
              href={`/${lang}/why-this-election-matters`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-w-52 border-white/60 text-white hover:border-white hover:bg-white/10 hover:text-white"
              )}
            >
              Why This Election Matters
            </Link>
          </div>
        </div>

      </section>

      {/*
        ─── STATS ─────────────────────────────────────────────────────────────────
        bg-muted matches the TornEdgeDivider fill exactly so the transition
        is seamless — no gap or color mismatch at any viewport width.
        ──────────────────────────────────────────────────────────────────────────
      */}
      <section className="bg-muted">
        <div className="container grid max-w-5xl gap-10 py-16 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-3xl font-bold">2016</p>
            <p className="font-semibold">Last Completed Presidential Election</p>
            <p className="text-sm text-muted-foreground">
              Haiti’s last completed presidential election was held in 2016, after the 2015 results were annulled. 
              No presidential elections have been held since, marking nearly a decade without a renewed democratic mandate.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">4M+</p>
            <p className="font-semibold">Haitians in the Diaspora</p>
            <p className="text-sm text-muted-foreground">
              Millions of Haitians live outside Haiti, primarily in the United States, Canada,
              France, and the Dominican Republic. Many hold the right to vote.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">Art. 13</p>
            <p className="font-semibold">Haitian Constitution</p>
            <p className="text-sm text-muted-foreground">
              The Haitian constitution guarantees nationality rights to all children of Haitian
              parents, regardless of where they were born.
            </p>
          </div>
        </div>
      </section>

      {/* Eligibility preview */}
      <section className="container max-w-5xl py-16">
        <div className="grid gap-8 rounded-xl border bg-card p-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              Are You Eligible to Participate?
            </h2>
            <p className="text-muted-foreground">
              If you were born in Haiti, or have at least one Haitian parent, you may be a Haitian
              citizen with rights in this election. Our eligibility checker takes about two minutes.
            </p>
            <Link href={`/${lang}/eligibility`} className={cn(buttonVariants(), "w-fit")}>
              Start Eligibility Check
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { q: "Were you born in Haiti or to Haitian parents?", a: "Likely eligible" },
              { q: "Do you hold a Haitian ID or passport?", a: "Helps confirm status" },
              { q: "Are you registered to vote?", a: "Key next step" },
            ].map(({ q, a }) => (
              <div key={q} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">{q}</p>
                  <p className="text-xs text-muted-foreground">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content cards */}
      <section className="bg-muted/30">
        <div className="container max-w-5xl py-16">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Start Here</h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to understand Haiti&apos;s election and your role in it.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                title: "Why This Election Matters",
                description:
                  "The historical context behind Haiti's 2026 election and what is at stake for the country.",
                href: `/${lang}/why-this-election-matters`,
                cta: "Read the context",
              },
              {
                title: "Documentation Guide",
                description:
                  "What documents you may need to participate and how to obtain them from the diaspora.",
                href: `/${lang}/resources/documentation`,
                cta: "View documents",
              },
              {
                title: "Election Timeline",
                description:
                  "Key dates and milestones in Haiti's electoral process, updated as information becomes available.",
                href: `/${lang}/timeline`,
                cta: "See timeline",
              },
            ].map(({ title, description, href, cta }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col rounded-xl border bg-card p-6 transition-colors hover:border-foreground/20 hover:bg-card/80"
              >
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
                <p className="mt-4 text-sm font-medium text-primary group-hover:underline">
                  {cta} &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section className="container max-w-2xl py-16 text-center">
        <h2 className="font-heading text-2xl font-bold">Stay Informed</h2>
        <p className="mt-2 text-muted-foreground">
          Election timelines shift. We will send important updates when things change.
        </p>
        <div className="mt-6">
          <SubscriberForm source="homepage" className="text-left" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          We will never share your email. You can unsubscribe at any time.
        </p>
      </section>
    </>
  )
}
