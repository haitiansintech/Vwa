import { db } from "@/lib/db"

export const metadata = {
  title: "Admin",
}

export default async function AdminPage() {
  const [subscriberCount, donationCount] = await Promise.all([
    db.subscriber.count(),
    db.donation.count({ where: { status: "COMPLETED" } }),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Subscribers</p>
          <p className="mt-1 text-3xl font-bold">{subscriberCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Completed Donations</p>
          <p className="mt-1 text-3xl font-bold">{donationCount}</p>
        </div>
      </div>
    </div>
  )
}
