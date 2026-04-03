import type { Metadata } from "next"
import Link from "next/link"
import { allPeople } from "#velite"

export const metadata: Metadata = {
  title: "People",
  description: "Candidates and key figures in Haiti's election.",
}

export default function PeoplePage() {
  const people = allPeople.filter((p) => p.slugAsParams !== "placeholder")

  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold">People</h1>
        <p className="mt-3 text-muted-foreground">
          Candidates and key figures in Haiti&apos;s electoral process. Profiles are updated as
          official information becomes available.
        </p>
      </div>

      {people.length === 0 ? (
        <p className="text-muted-foreground">
          Candidate profiles are coming soon. Check back as the electoral field develops.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {people.map((person) => (
            <Link
              key={person.slug}
              href={`/people/${person.slugAsParams}`}
              className="group flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <h2 className="font-semibold">{person.title}</h2>
              {(person.role || person.municipality || person.department) && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[person.role, person.municipality, person.department]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {person.bio && (
                <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                  {person.bio}
                </p>
              )}
              {person.party && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Party:{" "}
                  <Link
                    href={`/parties/${person.party}`}
                    className="font-medium text-foreground hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {person.party}
                  </Link>
                </p>
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
