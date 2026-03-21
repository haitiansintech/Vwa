import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export const metadata: Metadata = {
  title: "Admin Login",
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <Icons.chevronLeft className="mr-2 h-4 w-4" />
        Back
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            This area is for Vwa administrators only.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Contact{" "}
          <a href="mailto:admin@vwa.app" className="underline underline-offset-4 hover:text-primary">
            admin@vwa.app
          </a>{" "}
          to request access.
        </p>
      </div>
    </div>
  )
}
