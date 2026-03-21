"use client"

import * as React from "react"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SUGGESTED_AMOUNTS = [10, 25, 50, 100]

export default function SupportPage() {
  const [amount, setAmount] = React.useState<number>(25)
  const [customAmount, setCustomAmount] = React.useState("")
  const [useCustom, setUseCustom] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState("")

  const finalAmount = useCustom
    ? parseFloat(customAmount) || 0
    : amount

  async function handleDonate() {
    if (finalAmount < 1) return

    setStatus("loading")
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: Math.round(finalAmount * 100),
        }),
      })

      if (res.ok) {
        track("donation_completed", { amount: finalAmount })
        setStatus("success")
        setMessage(
          "Thank you. Your donation supports free civic information for Haitians everywhere."
        )
      } else {
        setStatus("error")
        setMessage("Something went wrong. Please try again or contact us at hello@vwa.app.")
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="container max-w-2xl py-12 md:py-20">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-bold">Support Vwa</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Vwa is free to use and nonpartisan. It is supported entirely by voluntary contributions
          from readers who believe Haitians deserve access to clear civic information.
        </p>
      </div>

      {status === "success" ? (
        <div className="rounded-xl border bg-green-50 p-8 text-center dark:bg-green-950/30">
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            Thank you for your support.
          </p>
          <p className="mt-2 text-green-800 dark:text-green-200">{message}</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6 md:p-8">
          <h2 className="mb-5 font-semibold text-lg">Choose an amount</h2>

          <div className="mb-4 grid grid-cols-4 gap-3">
            {SUGGESTED_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => { setAmount(a); setUseCustom(false) }}
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
              {message}
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={status === "loading" || finalAmount < 1}
            onClick={handleDonate}
          >
            {status === "loading"
              ? "Processing..."
              : `Donate $${finalAmount.toFixed(2)}`}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Donations are processed securely. Vwa is not a 501(c)(3). Contributions are not
            tax-deductible.
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-3 text-center text-sm text-muted-foreground">
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
