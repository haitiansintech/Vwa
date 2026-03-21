import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { SubscriberForm } from "@/components/subscriber-form"
import type { EligibilityAnswers, EligibilityStatus } from "@/types"

export const metadata: Metadata = {
  title: "Your Eligibility Result",
  description: "Your Haitian election eligibility result and recommended next steps.",
}

function computeResult(answers: EligibilityAnswers): {
  status: EligibilityStatus
  headline: string
  summary: string
  nextSteps: string[]
  documents: string[]
} {
  const bornInHaiti = answers.birthplace === "haiti"
  const haitianParent = answers.haitianParent === true
  const hasId = answers.hasHaitianId === true

  if (bornInHaiti || haitianParent) {
    if (hasId) {
      return {
        status: "likely_eligible",
        headline: "You are likely eligible",
        summary:
          "Based on your answers, you appear to meet the citizenship requirements to participate in Haiti's election. The next step is confirming voter registration and verifying any additional requirements with official sources.",
        nextSteps: [
          "Confirm your voter registration status with the CEP",
          "Locate your nearest Haitian consulate or embassy",
          "Review any diaspora voting procedures announced by the CEP",
          "Keep your Haitian ID or passport valid and accessible",
        ],
        documents: [
          "Valid Haitian national ID card (CIN) or passport",
          "Proof of voter registration (if applicable)",
        ],
      }
    } else {
      return {
        status: "may_be_eligible",
        headline: "You may be eligible",
        summary:
          "You appear to have grounds for Haitian citizenship, but you may need to obtain or renew documentation before you can participate. The process is navigable with early preparation.",
        nextSteps: [
          "Contact the nearest Haitian consulate to start the ID or passport process",
          "Gather any existing documents: birth certificate, parents' documents",
          "Ask the consulate about the timeline for document processing",
          "Check the CEP website for voter registration requirements",
        ],
        documents: [
          "Haitian birth certificate (acte de naissance) or parents' documents",
          "Haitian national ID card (CIN) or passport (to obtain)",
          "Proof of Haitian parentage if born abroad",
        ],
      }
    }
  }

  return {
    status: "more_info_needed",
    headline: "More information needed",
    summary:
      "Based on your answers, your eligibility is not immediately clear. Haitian citizenship law has several pathways, and your situation may warrant a closer look with official sources or a legal adviser.",
    nextSteps: [
      "Review the Haitian Constitution, particularly Articles 11 to 14",
      "Contact the Haitian consulate nearest to you",
      "Consult an immigration attorney familiar with Haitian law if needed",
    ],
    documents: [
      "Any documentation linking you to Haitian family or birthplace",
      "Records of ancestors or relatives who held Haitian citizenship",
    ],
  }
}

const statusStyles: Record<EligibilityStatus, { bg: string; text: string; dot: string }> = {
  likely_eligible: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-900 dark:text-green-100",
    dot: "bg-green-500",
  },
  may_be_eligible: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-900 dark:text-yellow-100",
    dot: "bg-yellow-500",
  },
  more_info_needed: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-900 dark:text-blue-100",
    dot: "bg-blue-500",
  },
  likely_ineligible: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
}

type Props = {
  searchParams: Record<string, string>
}

export default function EligibilityResultPage({ searchParams }: Props) {
  const answers: EligibilityAnswers = {
    birthplace: searchParams.birthplace as "haiti" | "abroad" | undefined,
    haitianParent: searchParams.haitianParent === "true",
    hasHaitianId: searchParams.hasHaitianId === "true",
    currentCountry: searchParams.currentCountry,
    intendToVote: searchParams.intendToVote === "true",
  }

  const result = computeResult(answers)
  const style = statusStyles[result.status]

  return (
    <div className="container max-w-2xl py-12 md:py-20">
      {/* Result card */}
      <div className={cn("mb-8 rounded-xl p-6 md:p-8", style.bg)}>
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("size-2.5 rounded-full", style.dot)} />
          <span className={cn("text-xs font-semibold uppercase tracking-wider", style.text)}>
            Eligibility Assessment
          </span>
        </div>
        <h1 className={cn("font-heading text-3xl font-bold mb-3", style.text)}>
          {result.headline}
        </h1>
        <p className={cn("text-base leading-relaxed", style.text)}>
          {result.summary}
        </p>
      </div>

      <p className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        This is not legal advice. Eligibility determinations are made by official Haitian government
        bodies. Use this result as a starting point, not a final answer.
      </p>

      {/* Next steps */}
      <div className="mb-8 space-y-3">
        <h2 className="font-semibold text-lg">Recommended Next Steps</h2>
        <ol className="space-y-2">
          {result.nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Documents */}
      {result.documents.length > 0 && (
        <div className="mb-8 rounded-xl border p-5 space-y-3">
          <h2 className="font-semibold">Documents You May Need</h2>
          <ul className="space-y-2">
            {result.documents.map((doc) => (
              <li key={doc} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-foreground/40" />
                {doc}
              </li>
            ))}
          </ul>
          <Link
            href="/resources/documentation"
            className="inline-block text-sm font-medium text-primary hover:underline"
          >
            Full documentation guide &rarr;
          </Link>
        </div>
      )}

      {/* Continue learning */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/why-this-election-matters"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Why This Election Matters
        </Link>
        <Link
          href="/resources"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Browse Resources
        </Link>
      </div>

      {/* Email capture */}
      <div className="rounded-xl border bg-card p-6">
        <SubscriberForm
          source="eligibility_result"
          heading="Stay updated on next steps"
          description="We will notify you when voter registration opens and key deadlines approach."
        />
      </div>

      {/* Soft donation ask */}
      <div className="mt-6 rounded-xl border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
        Vwa is free and nonpartisan. If this resource helped you,{" "}
        <Link href="/support" className="font-medium text-foreground hover:underline">
          consider supporting our work
        </Link>
        .
      </div>
    </div>
  )
}
