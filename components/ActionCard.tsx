"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface ActionCardProps {
  title: string
  description: string
  href?: string
  icon?: ReactNode
  className?: string
}

interface ActionCardGridProps {
  children: ReactNode
  className?: string
}

export function ActionCardGrid({ children, className }: ActionCardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 xl:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}

export function ActionCard({
  title,
  description,
  href,
  icon,
  className,
}: ActionCardProps) {
  const cardInner = (
    <article
      className={cn(
        "relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-8 text-left shadow-sm transition-all duration-300",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-[1] before:bg-gradient-to-br before:from-primary/12 before:via-transparent before:to-transparent",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg",
        "group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg group-focus-visible:-translate-y-1 group-focus-visible:border-primary/50 group-focus-visible:shadow-lg",
        className
      )}
    >
      <div className="space-y-6">
        {icon ? (
          <span
            aria-hidden="true"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            {icon}
          </span>
        ) : null}

        <div className="space-y-3">
          <h3 className="font-heading text-xl text-foreground transition-colors hover:text-primary group-hover:text-primary group-focus-visible:text-primary sm:text-2xl">
            {title}
          </h3>
          <p className="text-base text-muted-foreground">{description}</p>
        </div>
      </div>

      {href ? (
        <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-foreground transition-colors hover:text-primary group-hover:text-primary group-focus-visible:text-primary">
          Take Action
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-300 hover:-translate-y-1 hover:translate-x-1 group-hover:-translate-y-1 group-hover:translate-x-1 group-focus-visible:-translate-y-1 group-focus-visible:translate-x-1"
          />
        </span>
      ) : null}
    </article>
  )

  if (href) {
    return (
      <Link
        href={href}
        role="button"
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {cardInner}
      </Link>
    )
  }

  return cardInner
}
