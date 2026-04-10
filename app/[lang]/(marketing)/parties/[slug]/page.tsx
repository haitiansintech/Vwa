import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { allParties } from "#velite"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Mdx } from "@/components/mdx-components"
import "@/styles/mdx.css"

type Props = {
  params: { slug: string }
}

export function generateStaticParams() {
  return allParties.map((party) => ({ slug: party.slugAsParams }))
}

export function generateMetadata({ params }: Props): Metadata {
  const party = allParties.find((p) => p.slugAsParams === params.slug)
  if (!party) return {}
  return {
    title: party.title,
    description: party.description,
  }
}

export default function PartyPage({ params }: Props) {
  const party = allParties.find((p) => p.slugAsParams === params.slug)
  if (!party) notFound()

  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <div className="mb-8">
        <Link
          href="/parties"
          className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; All parties
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-4xl font-bold">{party.title}</h1>
          {party.acronym && (
            <span className="rounded-full border px-3 py-1 text-sm font-medium">
              {party.acronym}
            </span>
          )}
        </div>
        {party.description && (
          <p className="mt-3 text-lg text-muted-foreground">{party.description}</p>
        )}
      </div>

      {/* Metadata strip */}
      {(party.founded || party.ideology || party.website) && (
        <div className="mb-8 grid gap-3 rounded-xl border bg-muted/30 p-5 text-sm sm:grid-cols-3">
          {party.founded && (
            <div>
              <p className="font-semibold text-foreground">Founded</p>
              <p className="text-muted-foreground">{party.founded}</p>
            </div>
          )}
          {party.ideology && (
            <div>
              <p className="font-semibold text-foreground">Ideology</p>
              <p className="text-muted-foreground">{party.ideology}</p>
            </div>
          )}
          {party.website && (
            <div>
              <p className="font-semibold text-foreground">Website</p>
              <a
                href={party.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {new URL(party.website).hostname}
              </a>
            </div>
          )}
        </div>
      )}

      <Mdx code={party.body} />

      <div className="mt-10 flex gap-3">
        <Link href="/parties" className={cn(buttonVariants({ variant: "outline" }))}>
          All Parties
        </Link>
        <Link href="/people" className={cn(buttonVariants({ variant: "outline" }))}>
          People
        </Link>
      </div>
    </div>
  )
}
