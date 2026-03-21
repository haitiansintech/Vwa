import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Issues",
  description: "Key issues in Haiti's election.",
}

export default function IssuesPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <h1 className="font-heading text-4xl font-bold">Issues</h1>
      <p className="mt-3 text-muted-foreground">
        Structured coverage of the key issues in Haiti&apos;s election is coming soon.
      </p>
    </div>
  )
}
