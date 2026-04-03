import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { allPeople, allParties } from "#velite"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Mdx } from "@/components/mdx-components"
import "@/styles/mdx.css"

type Props = {
  params: { slug: string }
}

export function generateStaticParams() {
  return allPeople
    .filter((p) => p.slugAsParams !== "placeholder")
    .map((p) => ({ slug: p.slugAsParams }))
}

export function generateMetadata({ params }: Props): Metadata {
  const person = allPeople.find((p) => p.slugAsParams === params.slug)
  if (!person) return {}
  return {
    title: person.title,
    description: person.bio,
  }
}

export default function PersonPage({ params }: Props) {
  const person = allPeople.find((p) => p.slugAsParams === params.slug)
  if (!person || person.slugAsParams === "placeholder") notFound()

  const party = person.party
    ? allParties.find((p) => p.slugAsParams === person.party)
    : null

  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <div className="mb-8">
        <Link
          href="/people"
          className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; All people
        </Link>
        <h1 className="font-heading text-4xl font-bold">{person.title}</h1>
        {person.role && (
          <p className="mt-1 text-lg text-muted-foreground">{person.role}</p>
        )}
      </div>

      {/* Metadata strip */}
      {party && (
        <div className="mb-8 rounded-xl border bg-muted/30 p-5 text-sm">
          <p className="font-semibold text-foreground">Party</p>
          <Link
            href={`/parties/${party.slugAsParams}`}
            className="text-primary hover:underline"
          >
            {party.title}
            {party.acronym && ` (${party.acronym})`}
          </Link>
        </div>
      )}

      {person.bio && (
        <p className="mb-8 text-base text-muted-foreground">{person.bio}</p>
      )}

      <Mdx code={person.body} />

      <div className="mt-10 flex gap-3">
        <Link href="/people" className={cn(buttonVariants({ variant: "outline" }))}>
          All People
        </Link>
        <Link href="/parties" className={cn(buttonVariants({ variant: "outline" }))}>
          Parties
        </Link>
      </div>
    </div>
  )
}
