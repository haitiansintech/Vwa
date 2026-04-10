import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Submit a Profile",
  description: "Help us grow Vwa by submitting a political party or candidate profile for inclusion.",
}

export default function SubmitPage() {
  return (
    <article className="container max-w-3xl py-12 md:py-20">
      <header className="mb-10">
        <h1 className="font-heading text-4xl font-bold">Submit a Profile</h1>
        <p className="mt-3 text-xl text-muted-foreground">
          Know of a party or candidate that should be listed here? Send us the details and
          we&apos;ll review and publish a profile once verified.
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
        <section>
          <h2>Submit a Party</h2>
          <p>
            Send an email to{" "}
            <a href="mailto:vwa@haitiansintech.com">vwa@haitiansintech.com</a> with the
            following subject line:
          </p>
          <pre className="not-prose rounded-md bg-muted px-4 py-3 text-sm font-mono">
            [Party Submission] Full Party Name (Acronym)
          </pre>
          <p>Include the following in the body of your email:</p>
          <ul>
            <li>Full party name</li>
            <li>Acronym</li>
            <li>Year founded</li>
            <li>Political ideology or orientation</li>
            <li>Official website</li>
            <li>Brief description (2–3 sentences)</li>
            <li>Logo or image URL <em>(optional)</em></li>
            <li>Any sources or references supporting the information</li>
          </ul>
          <div className="not-prose">
            <a
              href="mailto:vwa@haitiansintech.com?subject=%5BParty%20Submission%5D%20Full%20Party%20Name%20(Acronym)"
              className={cn(buttonVariants())}
            >
              Submit a Party &rarr;
            </a>
          </div>
        </section>

        <section>
          <h2>Submit a Candidate</h2>
          <p>
            Send an email to{" "}
            <a href="mailto:vwa@haitiansintech.com">vwa@haitiansintech.com</a> with the
            following subject line:
          </p>
          <pre className="not-prose rounded-md bg-muted px-4 py-3 text-sm font-mono">
            [Candidate Submission] Full Name – Role
          </pre>
          <p>Include the following in the body of your email:</p>
          <ul>
            <li>Full name</li>
            <li>Role or position sought</li>
            <li>Party affiliation <em>(if any)</em></li>
            <li>Department</li>
            <li>Municipality</li>
            <li>Short biography (2–3 sentences)</li>
            <li>Photo URL <em>(optional)</em></li>
            <li>Any sources or references supporting the information</li>
          </ul>
          <div className="not-prose">
            <a
              href="mailto:vwa@haitiansintech.com?subject=%5BCandidate%20Submission%5D%20Full%20Name%20%E2%80%93%20Role"
              className={cn(buttonVariants())}
            >
              Submit a Candidate &rarr;
            </a>
          </div>
        </section>

        <section>
          <h2>What Happens Next</h2>
          <p>
            The Vwa team reviews every submission for accuracy before publishing. We may follow
            up by email if we need clarification or additional sources. We do not endorse any
            candidate or party — our goal is simply to provide accurate, sourced information to
            Haitian voters.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/parties"
          className={cn(buttonVariants({ variant: "outline" }), "sm:w-auto w-full")}
        >
          View Parties
        </Link>
        <Link
          href="/people"
          className={cn(buttonVariants({ variant: "outline" }), "sm:w-auto w-full")}
        >
          View Candidates
        </Link>
      </div>
    </article>
  )
}
