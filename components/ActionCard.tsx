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
  const content = (
    <article
      className={cn(
        "relative flex h-full min-h-[16rem] flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-white/10 bg-[#101320] p-8 text-left shadow-[0_28px_60px_-40px_rgba(15,23,42,0.95)] transition-transform duration-300 ease-out",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-[1] before:bg-[radial-gradient(circle_at_top,_rgba(72,103,255,0.2),_transparent_55%)] before:opacity-0 before:transition-opacity before:duration-300",
        "after:pointer-events-none after:absolute after:-bottom-16 after:right-[-40%] after:h-48 after:w-48 after:rounded-full after:bg-primary/20 after:blur-3xl after:opacity-0 after:transition-opacity after:duration-300",
        "hover:-translate-y-1 hover:before:opacity-100 hover:after:opacity-100",
        "focus-visible:-translate-y-1 focus-visible:before:opacity-100 focus-visible:after:opacity-100",
        "group-hover:-translate-y-1 group-hover:before:opacity-100 group-hover:after:opacity-100",
        "group-focus-visible:-translate-y-1 group-focus-visible:before:opacity-100 group-focus-visible:after:opacity-100",
        className
      )}
    >
      <div className="space-y-6">
        {icon ? (
          <span
            aria-hidden="true"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary"
          >
            {icon}
          </span>
        ) : null}

        <div className="space-y-3">
          <h3 className="font-heading text-2xl font-semibold text-foreground transition-colors duration-300 group-hover:text-primary group-focus-visible:text-primary sm:text-[1.75rem]">
            {title}
          </h3>
          <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      {href ? (
        <span className="inline-flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-foreground transition-colors duration-300 group-hover:text-primary group-focus-visible:text-primary">
          Take Action
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-focus-visible:-translate-y-1 group-focus-visible:translate-x-1"
          />
        </span>
      ) : null}
    </article>
  )

  if (!href) {
    return content
  }

  return (
    <Link
      href={href}
      role="button"
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {content}
    </Link>
  )
}
