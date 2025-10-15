import type { ReactNode } from "react"
import { dir } from "i18next"
import { Inter as FontSans } from "next/font/google"
import localFont from "next/font/local"

import "@/styles/globals.css"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Analytics } from "@/components/analytics"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { languages, fallbacklang } from "../i18n/settings"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = localFont({
  src: "../../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

const SUPPORTED = languages

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Haiti", "Haitian"],
  authors: [
    {
      name: "Haitians in Tech",
      url: "https://haitiansintech.com",
    },
  ],
  creator: "haitians-in-tech",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@haitiansintech",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export function generateStaticParams() {
  return SUPPORTED.map((lang) => ({ lang }))
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { lang: string }
}) {
  const lang = SUPPORTED.includes(params.lang) ? params.lang : fallbacklang

  return (
    <html lang={lang} dir={dir(lang)} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}
