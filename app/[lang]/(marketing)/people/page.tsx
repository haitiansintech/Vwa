import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "People",
  description: "Key figures in Haiti's election.",
}

export default function PeoplePage() {
  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <h1 className="font-heading text-4xl font-bold">People</h1>
      <p className="mt-3 text-muted-foreground">
        Profiles of key figures in Haiti&apos;s electoral process are coming soon.
      </p>
    </div>
  )
}
