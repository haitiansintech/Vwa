import type { Metadata } from 'next';
import Link from 'next/link';



import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';





export const metadata: Metadata = {
  title: 'Why This Election Matters',
  description:
    "The historical context behind Haiti's 2026 election and what is at stake for the country.",
}

export default function WhyThisElectionMattersPage() {
  return (
    <article className="container max-w-3xl py-12 md:py-20">
      <header className="mb-12">
        <div className="mb-4 text-sm font-medium text-muted-foreground">Historical Context</div>
        <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
          Why This Election Matters
        </h1>
        <p className="mt-4 text-xl text-muted-foreground leading-relaxed">
          Haiti has not completed a full, legitimate democratic transition in nearly a decade. The
          2026 election represents a rare, consequential opportunity.
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <h2>A Decade Without National Elections</h2>

          <p>
            Haiti’s most recent national election cycle began in 2015, covering the presidency,
            parliament, and local offices. During this process, Jovenel Moïse was declared the
            winner of the presidential race. However, the results were widely contested, and the
            presidential election was ultimately annulled following allegations of fraud and
            irregularities, along with broader disruptions affecting legislative and local races.
          </p>

          <p>
            After a period of political transition under interim leadership, new elections were held
            in 2016. Moïse again ran and won the presidency, taking office in 2017. Parliamentary
            elections were also completed during this period, but no subsequent national elections
            have been held to renew most elected offices.
          </p>

          <p>
            Over time, the mandates of elected officials at all levels expired without new elections
            being held, leaving Haiti without a functioning parliament and with many local positions
            vacant or filled through interim arrangements.
          </p>

          <p>
            On July 7, 2021, Moïse was assassinated, creating a leadership vacuum. Since then, Haiti
            has been governed by unelected transitional authorities.
          </p>

          <p>
            The upcoming vote represents a critical opportunity to restore elected governance and
            democratic legitimacy across all levels of the state.
          </p>
        </section>

        <section>
          <h2>What Is at Stake</h2>
          <p>
            The stakes of this election extend beyond who wins. What is fundamentally at stake is
            whether Haiti can restore the basic constitutional framework that makes governance
            accountable to the people.
          </p>
          <p>A credible election outcome would establish:</p>
          <ul>
            <li>A president with a legitimate popular mandate</li>
            <li>A government capable of negotiating with international partners</li>
            <li>A precedent that democratic transfers of power are possible in Haiti</li>
            <li>A foundation for addressing the security and humanitarian crisis</li>
          </ul>
        </section>

        <section>
          <h2>The Role of the Haitian Diaspora</h2>

          <p>
            The Haitian diaspora is one of the most significant forces in Haitian civil society.
            Remittances from Haitians abroad account for approximately 20% to 25% of Haiti’s GDP,
            making it one of the highest remittance-dependent economies in the world. Diaspora
            Haitians maintain deep ties to the country through family, culture, and investment.
          </p>

          <p>
            Legally, the Haitian constitution extends citizenship and its associated rights to all
            children of Haitian nationals, regardless of where they were born. This means millions
            of Haitians in the United States, Canada, France, and elsewhere may hold the right to
            participate.
          </p>

          <p>
            What has historically been missing is access to clear, trustworthy information about how
            to exercise that right. Vwa was built to address that gap.
          </p>
        </section>

        <section>
          <h2>What We Know and Do Not Know</h2>
          <p>
            The full mechanics of diaspora participation are still being determined by the Conseil
            Electoral Provisoire (CEP). We will update this page as official guidance is published.
            What is clear:
          </p>
          <ul>
            <li>The constitutional right to citizenship is not in question</li>
            <li>Documentation requirements will likely apply</li>
            <li>Early preparation is strongly advisable</li>
            <li>The registration window may be limited</li>
          </ul>
        </section>

        <section>
          <h2>A Note on Partisanship</h2>
          <p>
            Vwa is a nonpartisan platform. We do not endorse any candidate, party, or political
            faction. Our purpose is to provide accurate civic information so that Haitians can make
            their own informed decisions. Political questions belong to Haitian citizens, not to
            civic technology platforms.
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <Link href="/eligibility" className={cn(buttonVariants(), 'sm:w-auto w-full')}>
          Check Your Eligibility
        </Link>
        <Link
          href="/resources"
          className={cn(buttonVariants({ variant: 'outline' }), 'sm:w-auto w-full')}
        >
          Browse Resources
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-muted-foreground/20 p-4 text-xs text-muted-foreground">
        Sources: Haitian Constitution (1987), CEP public communications, Inter-American Commission
        on Human Rights, United Nations Office for the Coordination of Humanitarian Affairs. This
        page reflects best available information as of early 2025 and will be updated as the
        electoral process develops.
      </div>
    </article>
  )
}