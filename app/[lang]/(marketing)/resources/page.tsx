import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Resources",
  description: "Civic resources to help Haitians understand the electoral process and their rights.",
}

const resources = [
  {
    title: "Documentation Guide",
    description:
      "What documents you may need to participate in Haiti's election and how to obtain them from abroad.",
    href: "/resources/documentation",
    tag: "Documents",
  },
  {
    title: "Eligibility Checker",
    description:
      "A step-by-step tool to help you understand whether you may qualify to participate.",
    href: "/eligibility",
    tag: "Tool",
  },
  {
    title: "Why This Election Matters",
    description:
      "Historical context and the significance of Haiti's 2025 election for diaspora Haitians.",
    href: "/why-this-election-matters",
    tag: "Context",
  },
  {
    title: "Election Timeline",
    description:
      "Key dates in Haiti's electoral process, updated as official information is released.",
    href: "/timeline",
    tag: "Dates",
  },
]

export default function ResourcesPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold">Resources</h1>
        <p className="mt-3 text-muted-foreground">
          Civic tools and information for Haitians who want to understand and participate in Haiti&apos;s
          election.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map(({ title, description, href, tag }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20"
          >
            <span className="mb-2 w-fit rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {tag}
            </span>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
            <p className="mt-3 text-sm font-medium text-primary group-hover:underline">
              View &rarr;
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
