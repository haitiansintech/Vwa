import type { Metadata } from "next"
import { DonationForm } from "@/components/donation-form"

export const metadata: Metadata = {
  title: "Support Vwa",
  description:
    "Support free civic information for Haitians everywhere. Vwa is funded entirely by voluntary contributions.",
}

type Props = {
  searchParams: { payment?: string }
}

export default function SupportPage({ searchParams }: Props) {
  return (
    <div className="container max-w-2xl py-12 md:py-20">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-bold">Support Vwa</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Vwa is free to use and nonpartisan. It is supported entirely by voluntary contributions
          from readers who believe Haitians deserve access to clear civic information.
        </p>
      </div>

      <DonationForm payment={searchParams.payment} />

      <div className="mt-10 grid gap-6 text-center text-sm text-muted-foreground sm:grid-cols-3">
        <div>
          <p className="font-semibold text-foreground">Free forever</p>
          <p>No paywalls. No subscriptions. Civic information is a public good.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Nonpartisan</p>
          <p>We do not accept funding from candidates, parties, or political organizations.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Open source</p>
          <p>The code behind Vwa is public. You can review it, fork it, or contribute.</p>
        </div>
      </div>
    </div>
  )
}
