"use client"

import * as React from "react"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SubscriberFormProps extends React.HTMLAttributes<HTMLFormElement> {
  source?: string
  heading?: string
  description?: string
}

export function SubscriberForm({
  source = "unknown",
  heading = "Stay informed",
  description = "Get updates as Haiti's election timeline evolves. No spam, ever.",
  className,
  ...props
}: SubscriberFormProps) {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus("loading")
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      })

      if (res.ok) {
        setStatus("success")
        setMessage("You're subscribed. We'll be in touch.")
        track("subscriber_signup_submitted", { source })
        setEmail("")
      } else {
        const data = await res.json()
        setStatus("error")
        setMessage(data.error ?? "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-3", className)}
      {...props}
    >
      <div className="space-y-1">
        <h3 className="font-semibold">{heading}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {status === "success" ? (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          {message}
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
              className="flex-1"
              aria-label="Email address"
            />
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
          {status === "error" && (
            <p className="text-sm text-destructive">{message}</p>
          )}
        </>
      )}
    </form>
  )
}
