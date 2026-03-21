import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "About Vwa",
  description: "Vwa is a free civic platform built by Haitians for Haitians.",
}

export default function AboutPage() {
  return (
    <article className="container max-w-3xl py-12 md:py-20">
      <header className="mb-10">
        <h1 className="font-heading text-4xl font-bold">About Vwa</h1>
        <p className="mt-3 text-xl text-muted-foreground">
          A free, open civic platform built to help Haitians in the diaspora understand and
          participate in Haiti's political process.
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <h2>Our Mission</h2>
          <p>
            Vwa (which means "voice" in Haitian Creole) was built on a simple belief: informed
            participation is the foundation of a functioning democracy. We exist to lower the
            barriers between Haitian citizens and their civic responsibilities.
          </p>
        </section>

        <section>
          <h2>What We Do</h2>
          <ul>
            <li>Clear, sourced information about Haiti's elections and political institutions</li>
            <li>An eligibility checker to help diaspora Haitians understand whether they can participate</li>
            <li>Guidance on documentation and next steps for those who want to engage</li>
            <li>A structured, trustworthy reference for issues, people, and institutions</li>
          </ul>
        </section>

        <section>
          <h2>Who Built This</h2>
          <p>
            Vwa was created by Haitians in Tech, a community of Haitian technologists committed
            to using their skills to benefit Haiti.
          </p>
        </section>

        <section>
          <h2>Principles</h2>
          <p>
            <strong>We are nonpartisan.</strong> We do not endorse candidates, parties, or political positions.
          </p>
          <p>
            <strong>We cite our sources.</strong> Every factual claim links to its origin.
          </p>
          <p>
            <strong>We stay accurate.</strong> When information is uncertain or contested, we say so.
          </p>
          <p>
            <strong>We are free.</strong> Vwa costs nothing to use and always will.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link href="/eligibility" className={cn(buttonVariants(), "sm:w-auto w-full")}>
          Check Your Eligibility
        </Link>
        <Link
          href="mailto:vwa@haitiansintech.com"
          className={cn(buttonVariants({ variant: "outline" }), "sm:w-auto w-full")}
        >
          Contact Us
        </Link>
      </div>
    </article>
  )
}
