import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface PagerItem {
  title: string
  href: string
}

interface PagerProps {
  prev?: PagerItem | null
  next?: PagerItem | null
}

export function DocsPager({ prev, next }: PagerProps) {
  if (!prev && !next) return null

  return (
    <div className="flex flex-row items-center justify-between">
      {prev && (
        <Link
          href={prev.href}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          {prev.title}
        </Link>
      )}
      {next && (
        <Link
          href={next.href}
          className={cn(buttonVariants({ variant: "ghost" }), "ml-auto")}
        >
          {next.title}
          <Icons.chevronRight className="ml-2 h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
