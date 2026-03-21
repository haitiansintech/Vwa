import type { Metadata } from "next"
import { EligibilityChecker } from "@/components/eligibility/checker"

export const metadata: Metadata = {
  title: "Eligibility Checker",
  description:
    "Find out whether you may be eligible to participate in Haiti's upcoming election.",
}

export default function EligibilityPage() {
  return (
    <div className="container max-w-2xl py-12 md:py-20">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">
          Eligibility Checker
        </h1>
        <p className="mt-3 text-muted-foreground">
          Answer a few questions to understand whether you may be eligible to participate
          in Haiti&apos;s election. This is not legal advice.
        </p>
      </div>
      <EligibilityChecker />
    </div>
  )
}
