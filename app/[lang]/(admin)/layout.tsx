import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-3">
        <p className="text-sm font-medium">Vwa Admin</p>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
