import type { Metadata } from "next"
import Link from "next/link"
import { allParties } from "#velite"

export const metadata: Metadata = {
  title: "Political Parties",
  description: "Profiles of the political parties participating in Haiti's election.",
}

export default function PartiesPage() {
  const parties = allParties

  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold">Political Parties</h1>
        <p className="mt-3 text-muted-foreground">
          An overview of the parties participating in Haiti&apos;s electoral process. Profiles are
          updated as official information becomes available.
        </p>
      </div>

      {parties.length === 0 ? (
        <p className="text-muted-foreground">Party profiles are coming soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {parties.map((party) => (
            <Link
              key={party.slug}
              href={`/parties/${party.slugAsParams}`}
              className="group flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-semibold">{party.title}</h2>
                {party.acronym && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {party.acronym}
                  </span>
                )}
              </div>
              {party.description && (
                <p className="flex-1 text-sm text-muted-foreground line-clamp-3">
                  {party.description}
                </p>
              )}
              {party.ideology && (
                <p className="mt-3 text-xs text-muted-foreground">{party.ideology}</p>
              )}
              <p className="mt-3 text-sm font-medium text-primary group-hover:underline">
                View profile &rarr;
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
