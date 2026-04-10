import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Election Timeline",
  description: "Key dates and milestones in Haiti's 2026 electoral process.",
}

const timelineItems = [
  {
    date: "2024",
    title: "Transitional Presidential Council Formed",
    description:
      "A transitional council with representatives from major political parties and civil society was established to oversee a path toward elections.",
    category: "Government",
  },
  {
    date: "Early 2025",
    title: "Electoral Framework Under Review",
    description:
      "The Conseil Electoral Provisoire (CEP) began formal review of the electoral framework and registration requirements.",
    category: "Electoral Process",
  },
  {
    date: "March 2 - 12 2026",
    title: "Political Party Registration",
    description:
      "The CEP opened registration for political parties, marking the formal start of the 2026 electoral process.",
    category: "Electoral Process",
  },
  {
    date: "TBD",
    title: "Voter Registration Period",
    description:
      "Official voter registration dates to be announced by the CEP. Diaspora participation requirements will be published at this time.",
    category: "Registration",
    pending: true,
  },
  {
    date: "TBD",
    title: "Campaign Period",
    description:
      "Official campaign period dates to be set by the CEP following confirmation of the electoral calendar.",
    category: "Campaigns",
    pending: true,
  },
  {
    date: "30 August 2026",
    title: "General Election",
    description:
      "Haiti's government has pledged to hold a general election on this date, as part of a revised electoral calendar approved by the Transitional Presidential Council. Voters will elect the president, all 119 seats in the Chamber of Deputies, all 30 Senate seats, and local and municipal offices.",
    category: "Election",
  },
  {
    date: "6 December 2026",
    title: "Presidential Runoff",
    description:
      "A runoff election is scheduled if no presidential candidate wins an outright majority in the first round.",
    category: "Election",
  },
]

export default function TimelinePage() {
  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold">Election Timeline</h1>
        <p className="mt-3 text-muted-foreground">
          Key dates and milestones in Haiti&apos;s 2026 electoral process. This page is updated as
          official information becomes available.
        </p>
      </div>

      <div className="relative space-y-0 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
        {timelineItems.map((item, index) => (
          <div key={index} className="relative pl-12 pb-10">
            <div className={cn(
              "absolute left-2.5 top-1 size-3 -translate-x-1/2 rounded-full border-2 border-background",
              item.pending ? "bg-muted-foreground/40" : "bg-primary"
            )} />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-semibold">{item.title}</span>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                item.pending
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary"
              )}>
                {item.pending ? "Pending" : item.category}
              </span>
            </div>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">{item.date}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border p-4 text-sm text-muted-foreground">
        Timeline is based on publicly available information and is subject to change.
        Sources include CEP official communications and credible Haitian and international news outlets.
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/eligibility" className={cn(buttonVariants(), "w-fit")}>
          Check Eligibility
        </Link>
        <Link href="/resources" className={cn(buttonVariants({ variant: "outline" }), "w-fit")}>
          Resources
        </Link>
      </div>
    </div>
  )
}
