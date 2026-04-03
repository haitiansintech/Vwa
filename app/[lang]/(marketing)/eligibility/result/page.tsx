import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { SubscriberForm } from "@/components/subscriber-form"
import type { EligibilityAnswers, EligibilityIntent, EligibilityStatus } from "@/types"

export const metadata: Metadata = {
  title: "Your Eligibility Result",
  description: "Your Haitian election eligibility result and recommended next steps.",
}

function determineEligibilityResult(answers: EligibilityAnswers): EligibilityStatus {
  const hasPositiveBasis =
    answers.bornInHaiti === "yes" || answers.haitianParent === "yes"
  const hasClearNegative =
    answers.bornInHaiti === "no" && answers.haitianParent === "no"
  const hasUncertainty =
    answers.bornInHaiti === "not_sure" || answers.haitianParent === "not_sure"

  if (hasClearNegative) return "not_eligible"
  if (hasUncertainty && !hasPositiveBasis) return "needs_verification"
  if (answers.hasDocuments === "yes") return "eligible"
  return "likely_eligible"
}

function determineIntent(answers: EligibilityAnswers): EligibilityIntent {
  if (answers.intendToVote === "yes") return "ready_to_act"
  if (answers.intendToVote === "no") return "not_ready"
  return "learning_first"
}

type ResultContent = {
  headline: string
  summary: string
  nextSteps: string[]
  documents: string[]
}

function getResultContent(
  status: EligibilityStatus,
  answers: EligibilityAnswers
): ResultContent {
  if (status === "eligible") {
    return {
      headline: "You are eligible to participate",
      summary:
        "Based on your answers, you have a clear citizenship basis and the documentation to support it. The next step is confirming your voter registration status and staying informed about diaspora voting procedures as the election approaches.",
      nextSteps: [
        "Confirm your voter registration status with the Provisional Electoral Council (CEP)",
        "Locate your nearest Haitian consulate or embassy",
        "Keep your Haitian ID or passport valid and accessible",
        "Review any diaspora voting procedures announced by the CEP as August 2026 approaches",
      ],
      documents: [
        "Valid Haitian national ID card (CIN) or passport",
        "Proof of voter registration (if announced by the CEP)",
      ],
    }
  }

  if (status === "likely_eligible") {
    const hasSomeDocuments = answers.hasDocuments === "some"
    const hasNoDocuments = answers.hasDocuments === "no"

    if (hasSomeDocuments) {
      return {
        headline: "You are likely eligible — your documents are the next step",
        summary:
          "You have a clear citizenship basis and you already have some supporting documents. Haitian nationals born abroad can use a parent's birth certificate and related records to apply for a passport at their nearest consulate. That passport is what you will need to participate.",
        nextSteps: [
          "Gather your parent's Haitian birth certificate (acte de naissance) — this is the key document",
          "Book an appointment at your nearest Haitian consulate or embassy",
          "Bring your own birth certificate showing your parent's name",
          "Apply for a Haitian passport — consulates process these for nationals living abroad",
          "Once you have your passport, confirm your voter registration status with the CEP",
        ],
        documents: [
          "Your parent's Haitian birth certificate (acte de naissance)",
          "Your own birth certificate showing your parent's name",
          "Any existing Haitian documentation (prior IDs, baptismal records, etc.)",
          "Haitian passport (to obtain — this will be your primary document to participate)",
        ],
      }
    }

    if (hasNoDocuments) {
      return {
        headline: "You are likely eligible — documentation is the next step",
        summary:
          "You have a clear citizenship basis, but you will need to obtain documentation before you can participate. Haitian consulates are the starting point — they can guide you through the process based on your specific situation.",
        nextSteps: [
          "Contact your nearest Haitian consulate and explain your situation",
          "Gather any family records you have: your birth certificate, parents' names, any prior Haitian IDs",
          "Ask specifically about obtaining a Haitian passport through parentage or birthplace",
          "Once you have your passport, confirm your voter registration status with the CEP",
        ],
        documents: [
          "Your birth certificate (to establish your identity)",
          "A parent's Haitian birth certificate or ID, if available",
          "Any prior Haitian documentation your family may hold",
          "Haitian national ID card (CIN) or passport (to obtain)",
        ],
      }
    }

    // hasDocuments === "not_sure" or undefined
    return {
      headline: "You are likely eligible — contact a consulate to confirm your documents",
      summary:
        "You have a clear citizenship basis. A Haitian consulate can tell you exactly which documents you need and whether what you already have is sufficient. This is a routine inquiry — you do not need to have everything figured out before reaching out.",
      nextSteps: [
        "Contact your nearest Haitian consulate — bring any documents you already have",
        "Ask them to confirm what is needed for a passport application in your situation",
        "Once you have your Haitian passport, confirm your voter registration status with the CEP",
      ],
      documents: [
        "Any documents you currently have (birth certificate, parent's ID, prior Haitian documents)",
        "Haitian passport (to obtain — consulate will advise on the exact requirements)",
      ],
    }
  }

  if (status === "needs_verification") {
    return {
      headline: "Your eligibility needs verification",
      summary:
        "Your citizenship basis is not immediately clear from your answers, but this is not a final result. Haitian citizenship law has multiple pathways, and a consulate or legal adviser can help you determine whether you qualify.",
      nextSteps: [
        "Review Articles 11 to 14 of the Haitian Constitution, which define citizenship rights",
        "Contact your nearest Haitian consulate — explain your family background and ask about your options",
        "Gather any documents that connect you to Haitian family or birthplace",
        "Consult an immigration attorney familiar with Haitian nationality law if needed",
      ],
      documents: [
        "Any documentation linking you to Haitian family or birthplace",
        "Records of parents or grandparents who held Haitian citizenship",
        "Your own birth certificate",
      ],
    }
  }

  // not_eligible
  return {
    headline: "You may not be eligible through these pathways",
    summary:
      "Based on your answers, you do not appear to have a citizenship basis through birth in Haiti or Haitian parentage. However, Haitian citizenship law has other pathways — including naturalization — that are not captured in this checker.",
    nextSteps: [
      "Review Articles 11 to 14 of the Haitian Constitution for a full picture of citizenship pathways",
      "Contact a Haitian consulate if you believe there are other factors that may apply",
      "Consult an attorney familiar with Haitian nationality law for a personalized assessment",
    ],
    documents: [],
  }
}

type ConsulateInfo = {
  name: string
  city: string
  url: string
  phone?: string
}

const consulateByCountry: Record<string, ConsulateInfo[]> = {
  us: [
    { name: "Haitian Embassy", city: "Washington, D.C.", url: "https://www.haiti.org", phone: "(202) 332-4090" },
    { name: "Consulate General of Haiti", city: "New York, NY", url: "https://www.haitianconsulate-nyc.org", phone: "(212) 697-9767" },
    { name: "Consulate General of Haiti", city: "Miami, FL", url: "https://haitianconsulatemiamifl.com", phone: "(305) 859-2003" },
    { name: "Consulate General of Haiti", city: "Boston, MA", url: "https://www.consulatehaitiboston.org", phone: "(617) 266-3660" },
    { name: "Consulate General of Haiti", city: "Chicago, IL", url: "https://haitianconsulate-chicago.com", phone: "(312) 372-5933" },
    { name: "Consulate General of Haiti", city: "Orlando, FL", url: "https://haitianconsulateorlando.com", phone: "(407) 578-2500" },
  ],
  ca: [
    { name: "Haitian Embassy", city: "Ottawa, ON", url: "https://ambahaiti-canada.ca", phone: "(613) 238-1628" },
    { name: "Consulate General of Haiti", city: "Montréal, QC", url: "https://consulat-haiti-montreal.org", phone: "(514) 499-1919" },
  ],
  fr: [
    { name: "Haitian Embassy", city: "Paris", url: "https://www.ambafrance-ht.org", phone: "+33 1 47 63 47 78" },
  ],
  do: [
    { name: "Haitian Embassy", city: "Santo Domingo", url: "https://www.embajadahaiti.org.do" },
  ],
  ht: [
    { name: "Provisional Electoral Council (CEP)", city: "Port-au-Prince", url: "https://www.cep-ht.org" },
  ],
  other: [],
}

const statusStyles: Record<EligibilityStatus, { bg: string; text: string; dot: string }> = {
  eligible: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-900 dark:text-green-100",
    dot: "bg-green-500",
  },
  likely_eligible: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-900 dark:text-green-100",
    dot: "bg-green-400",
  },
  needs_verification: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-900 dark:text-blue-100",
    dot: "bg-blue-500",
  },
  not_eligible: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
}

type Props = {
  searchParams: Record<string, string>
}

const intentCta: Record<EligibilityIntent, { label: string; href: string } | null> = {
  ready_to_act: { label: "View Documentation Guide", href: "/resources/documentation" },
  learning_first: { label: "Why This Election Matters", href: "/why-this-election-matters" },
  not_ready: null,
}

export default function EligibilityResultPage({ searchParams }: Props) {
  const answers: EligibilityAnswers = {
    bornInHaiti: searchParams.bornInHaiti as EligibilityAnswers["bornInHaiti"],
    haitianParent: searchParams.haitianParent as EligibilityAnswers["haitianParent"],
    hasDocuments: searchParams.hasDocuments as EligibilityAnswers["hasDocuments"],
    currentCountry: searchParams.currentCountry,
    intendToVote: searchParams.intendToVote as EligibilityAnswers["intendToVote"],
  }

  const status = determineEligibilityResult(answers)
  const intent = determineIntent(answers)
  const result = getResultContent(status, answers)
  const style = statusStyles[status]
  const primaryCta = intentCta[intent]

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

      {/* Consulate links */}
      {answers.currentCountry && (
        (() => {
          const consulates = consulateByCountry[answers.currentCountry] ?? []
          if (consulates.length === 0) return null
          const isHaiti = answers.currentCountry === "ht"
          return (
            <div className="mb-8 rounded-xl border p-5 space-y-3">
              <h2 className="font-semibold">
                {isHaiti ? "Electoral Authority" : "Haitian Consulates Near You"}
              </h2>
              <ul className="space-y-3">
                {consulates.map((c) => (
                  <li key={c.url} className="flex flex-col gap-0.5 text-sm">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {c.name} — {c.city}
                    </a>
                    {c.phone && (
                      <span className="text-muted-foreground">{c.phone}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })()
      )}

      {/* Intent-driven CTA + secondary links */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {primaryCta && (
          <Link href={primaryCta.href} className={cn(buttonVariants(), "w-full")}>
            {primaryCta.label}
          </Link>
        )}
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
