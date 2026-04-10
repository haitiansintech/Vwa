"use client"

import * as React from "react"
import Link from "next/link"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SUGGESTED_AMOUNTS = [10, 25, 50, 100]

interface DonationFormProps {
  /** Value of the ?payment= query param, set by Stripe redirect */
  payment?: string
}

export function DonationForm({ payment }: DonationFormProps) {
  const [amount, setAmount] = React.useState<number>(25)
  const [customAmount, setCustomAmount] = React.useState("")
  const [useCustom, setUseCustom] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle")
  const [errorMessage, setErrorMessage] = React.useState("")

  const finalAmount = useCustom ? parseFloat(customAmount) || 0 : amount

  async function handleDonate() {
    if (finalAmount < 1) return
    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: Math.round(finalAmount * 100),
          returnUrl: window.location.href.split("?")[0], // strip any existing query params
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus("error")
        setErrorMessage(data.error ?? "Something went wrong. Please try again.")
        return
      }

      if (!data.url) {
        setStatus("error")
        setErrorMessage("Could not start the payment. Please try again.")
        return
      }

      // Redirect to Stripe Checkout. Success fires only after payment is confirmed.
      track("donation_checkout_started", { amount: finalAmount })
      window.location.href = data.url
    } catch {
      setStatus("error")
      setErrorMessage("Could not reach the payment processor. Please try again.")
    }
  }

  // Fire analytics once when the success state mounts
  React.useEffect(() => {
    if (payment === "success") {
      track("donation_completed")
    }
  }, [payment])

  // Stripe redirected back after a successful payment
  if (payment === "success") {
    return (
      <div className="rounded-xl border bg-green-50 p-8 text-center dark:bg-green-950/30">
        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
          Thank you for your support.
        </p>
        <p className="mt-2 text-green-800 dark:text-green-200">
          Your donation supports free civic information for Haitians everywhere. A receipt will
          be sent to your email if you provided one.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-green-900 underline underline-offset-4 hover:no-underline dark:text-green-100"
        >
          Return to Vwa
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-6 md:p-8">
      {/* Canceled notice — shown when user clicked Back on Stripe's page */}
      {payment === "canceled" && (
        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Your payment was not completed. You can try again below.
        </div>
      )}

      <h2 className="mb-5 text-lg font-semibold">Choose an amount</h2>

      <div className="mb-4 grid grid-cols-4 gap-3">
        {SUGGESTED_AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => {
              setAmount(a)
              setUseCustom(false)
            }}
            className={cn(
              "rounded-lg border py-3 text-sm font-semibold transition-colors",
              !useCustom && amount === a
                ? "border-primary bg-primary/5 text-primary"
                : "hover:border-foreground/30"
            )}
          >
            ${a}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <button
          onClick={() => setUseCustom(true)}
          className={cn(
            "mb-2 text-sm font-medium",
            useCustom ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Enter a custom amount
        </button>
        {useCustom && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">$</span>
            <Input
              type="number"
              min={1}
              placeholder="Other amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-40"
              autoFocus
            />
          </div>
        )}
      </div>

      {status === "error" && (
        <p className="mb-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={status === "loading" || finalAmount < 1}
        onClick={handleDonate}
      >
        {status === "loading" ? "Redirecting to payment…" : `Donate $${finalAmount.toFixed(2)}`}
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        You will be taken to Stripe&apos;s secure checkout to complete your payment. Vwa is not a
        501(c)(3). Contributions are not tax-deductible.
      </p>
    </div>
  )
}
