import type { Metadata } from 'next'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Why This Election Matters',
  description:
    "Why Haiti's 2026-2027 electoral process matters and what the latest CEP updates mean.",
}

const cepCalendarUrl =
  'https://cephaiti.ht/publication-officielle-du-calendrier-electoral-2026-2027/'
const cepUpdatesUrl = 'https://cephaiti.ht/notes-communiques/'

export default function WhyThisElectionMattersPage() {
  return (
    <article className="container max-w-3xl py-12 md:py-20">
      <header className="mb-12">
        <div className="mb-4 text-sm font-medium text-muted-foreground">
          Updated August 11, 2026
        </div>
        <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
          Why This Election Matters
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-muted-foreground">
          Haiti is preparing for its first national vote in a decade. The CEP&apos;s new calendar
          makes the path more concrete, but security, funding, and public trust will determine
          whether the process succeeds.
        </p>
      </header>

      <div className="prose prose-slate max-w-none space-y-8 dark:prose-invert">
        <section>
          <h2>A Decade Without National Elections</h2>
          <p>
            Haiti&apos;s last national election cycle began in 2015. After the initial presidential
            result was annulled amid allegations of fraud and irregularities, a rerun was held in
            2016. Jovenel Moïse won that vote and took office in 2017.
          </p>
          <p>
            No subsequent national elections renewed the country&apos;s elected institutions. As
            mandates expired, Haiti was left without a functioning national legislature and with
            many local offices vacant or managed through interim appointments. Moïse&apos;s
            assassination on July 7, 2021 deepened the institutional crisis, and national authority
            has since remained in transitional, unelected hands.
          </p>
          <p>
            The 2026-2027 process is therefore not a routine election. It is an attempt to restore
            representative institutions after years without nationally elected government.
          </p>
        </section>

        <section>
          <h2>What Has Changed</h2>
          <p>
            The electoral process has moved beyond preliminary planning. A revised electoral decree
            was adopted on June 2, 2026 and later amended. The CEP published its definitive list of
            political parties on July 9, launched voter registration on July 20, and published a new
            2026-2027 electoral calendar on July 27.
          </p>
          <p>
            Under that calendar, the first round of presidential and legislative elections is
            scheduled for December 13, 2026, together with a popular vote on proposed constitutional
            changes. Any second round, along with elections for territorial collectivities, is
            scheduled for February 21, 2027. Final results are expected in March 2027.
          </p>
          <p>
            Recent CEP activity also includes the progressive opening of voter-registration centers,
            the review of political alliances, and the launch of accreditation for journalists and
            election observers. These are tangible operational steps, not only promised dates.
          </p>
        </section>

        <section>
          <h2>What Is at Stake</h2>
          <p>
            The election will shape the presidency, the legislature, and local government. More
            fundamentally, it will test whether Haiti can rebuild institutions that answer to voters
            and create a lawful basis for governing through the country&apos;s security,
            humanitarian, and economic crises.
          </p>
          <p>A credible process could provide:</p>
          <ul>
            <li>Elected national and local authorities with a popular mandate</li>
            <li>A restored legislature able to exercise representation and oversight</li>
            <li>A constitutional path away from prolonged transitional rule</li>
            <li>A stronger basis for public accountability and international cooperation</li>
          </ul>
          <p>
            Credibility depends on more than holding a vote. Voters and candidates must be able to
            participate safely, election administration must be impartial, and results must be
            transparent and open to lawful challenge.
          </p>
        </section>

        <section>
          <h2>The Calendar Is Official, but Conditional</h2>
          <p>
            The new dates replace the earlier plan for elections on August 30 and December 6, 2026.
            In publishing the revised calendar, the CEP explicitly stated that meeting its deadlines
            depends on an acceptable security environment and the availability of sufficient
            funding.
          </p>
          <p>
            That condition matters. The calendar is the current official plan, not a guarantee. Vwa
            will distinguish between scheduled milestones, completed steps, and any future changes
            announced by the CEP.
          </p>
        </section>

        <section>
          <h2>Voter Registration and the Diaspora</h2>
          <p>
            The CEP says a voter must be at least 18, be registered on the electoral roll, hold a
            national identification card (CIN), and retain full civil and political rights. Voter
            registration began on July 20 and is scheduled to continue through October 13, 2026,
            with registration-and-voting centers opening progressively across Haiti.
          </p>
          <p>
            Haitians abroad remain deeply connected to the country through family, civic life,
            investment, and remittances. However, citizenship alone should not be treated as
            confirmation that a person can vote from abroad. As of this update, the CEP has not
            published a complete, operational overseas voting process. Diaspora voters should wait
            for official instructions on registration locations, required documents, and where a
            ballot may be cast.
          </p>
        </section>

        <section>
          <h2>A Note on Partisanship</h2>
          <p>
            Vwa is a nonpartisan platform. We do not endorse any candidate, party, or political
            faction. Our purpose is to make official civic information easier to understand so that
            Haitians can make their own informed decisions.
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <Link href="/eligibility" className={cn(buttonVariants(), 'w-full sm:w-auto')}>
          Check Your Eligibility
        </Link>
        <Link
          href="/timeline"
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full sm:w-auto')}
        >
          View the Election Timeline
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-muted-foreground/20 p-4 text-xs text-muted-foreground">
        <p>
          This page reflects official information available on August 11, 2026. Election dates and
          procedures may change.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <a
            className="font-medium text-primary underline-offset-4 hover:underline"
            href={cepCalendarUrl}
          >
            Official CEP calendar
          </a>
          <a
            className="font-medium text-primary underline-offset-4 hover:underline"
            href={cepUpdatesUrl}
          >
            Latest CEP notices
          </a>
        </div>
      </div>
    </article>
  )
}
