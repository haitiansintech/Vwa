import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Institutions",
  description: "Key institutions in Haiti's election.",
}

export default function InstitutionsPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <h1 className="font-heading text-4xl font-bold">Institutions</h1>
      <p className="mt-3 text-muted-foreground">
        Coverage of Haiti&apos;s electoral institutions and governance bodies is coming soon.
      </p>
    </div>
  )
}
