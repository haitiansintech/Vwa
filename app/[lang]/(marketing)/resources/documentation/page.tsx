import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Documentation Guide",
  description: "What documents Haitians may need to participate in Haiti's election.",
}

const documents = [
  {
    name: "Carte d'Identification Nationale (CIN)",
    description:
      "The primary Haitian national ID card. Required for most electoral processes. Issued by the Office National d'Identification (ONI).",
    howToGet: "Apply through your nearest Haitian consulate if you are abroad.",
    required: true,
  },
  {
    name: "Haitian Passport",
    description:
      "Accepted as proof of citizenship in many contexts. Useful if you do not yet have a CIN.",
    howToGet: "Apply or renew through your nearest Haitian consulate.",
    required: false,
  },
  {
    name: "Haitian Birth Certificate (Acte de Naissance)",
    description:
      "Often required to obtain or renew a CIN or passport, especially for those born in Haiti.",
    howToGet:
      "Request from the civil registration office in the commune where you were born, or through the Haitian consulate.",
    required: false,
  },
  {
    name: "Parent's Haitian Documents",
    description:
      "If you were born abroad to Haitian parents, documents proving your parent's Haitian citizenship may support your own citizenship claim.",
    howToGet: "Ask your parents for copies of their Haitian ID, passport, or birth certificate.",
    required: false,
  },
]

export default function DocumentationPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold">Documentation Guide</h1>
        <p className="mt-3 text-muted-foreground">
          What you may need to participate in Haiti&apos;s election and how to obtain it from the
          diaspora.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        Requirements are set by Haitian government institutions. This guide reflects generally
        known requirements and may not capture the latest CEP guidelines. Always verify with
        official sources before taking action.
      </div>

      <div className="space-y-4">
        {documents.map(({ name, description, howToGet, required }) => (
          <div key={name} className="rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{name}</h2>
              {required && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Commonly required
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-3 rounded-md bg-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                How to obtain
              </p>
              <p className="mt-1 text-sm">{howToGet}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Find your nearest Haitian consulate</p>
        <p>
          The Haitian Ministry of Foreign Affairs maintains a list of consulates and embassies
          worldwide.{" "}
          <a
            href="https://www.mae.gouv.ht"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Visit mae.gouv.ht
          </a>
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/eligibility" className={cn(buttonVariants(), "w-fit")}>
          Check Eligibility
        </Link>
        <Link href="/resources" className={cn(buttonVariants({ variant: "outline" }), "w-fit")}>
          All Resources
        </Link>
      </div>
    </div>
  )
}
