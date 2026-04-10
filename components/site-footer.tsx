import Link from "next/link"

import { siteConfig } from "@/config/site"

export function SiteFooter() {
  return (
    <footer className="border-t py-10">
      <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Link href="/" className="font-bold">
            {siteConfig.name}
          </Link>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            A free civic platform for Haitians.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground md:justify-end">
          <Link href="/why-this-election-matters" className="hover:text-foreground">
            Why This Election
          </Link>
          <Link href="/eligibility" className="hover:text-foreground">
            Eligibility
          </Link>
          <Link href="/resources" className="hover:text-foreground">
            Resources
          </Link>
          <Link href="/timeline" className="hover:text-foreground">
            Timeline
          </Link>
          <Link href="/support" className="hover:text-foreground">
            Support Vwa
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/pages/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>

      <div className="container mt-6 border-t pt-6">
        <p className="text-center text-xs text-muted-foreground">
          Vwa is a nonpartisan civic resource. We do not endorse any candidate or political party.
        </p>
      </div>
    </footer>
  )
}
