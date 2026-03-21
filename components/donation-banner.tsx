"use client"

import * as React from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "vwa_donation_banner_dismissed"

interface DonationBannerProps {
  className?: string
}

export function DonationBanner({ className }: DonationBannerProps) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY)
      if (!dismissed) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // ignore
    }
    setVisible(false)
  }

  function handleDonateClick() {
    track("donation_banner_clicked")
  }

  if (!visible) return null

  return (
    <div
      className={cn(
        "relative border-b bg-muted/50 px-4 py-3 text-sm",
        className
      )}
    >
      <div className="container flex items-center justify-between gap-4">
        <p className="text-muted-foreground">
          Vwa is a free resource supported by readers like you.{" "}
          <Link
            href="/support"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
            onClick={handleDonateClick}
          >
            Support our work
          </Link>
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
