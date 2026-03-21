import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import acceptLanguage from "accept-language"
import { fallbacklang, languages, cookieName } from "./app/i18n/settings"

acceptLanguage.languages(languages)

export const config = {
  matcher: [
    // Protect admin routes explicitly
    "/admin/:path*",
    // Apply i18n detection to all routes except static assets and Next.js internals
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|images|fonts|icons|assets|favicon\\.ico|robots\\.txt|sitemap\\.xml|sw\\.js).*)",
  ],
}

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token

    // i18n: detect language
    let lang: string | null = null
    if (req.cookies.has(cookieName)) {
      lang = acceptLanguage.get(req.cookies.get(cookieName)?.value ?? null)
    }
    if (!lang) lang = acceptLanguage.get(req.headers.get("Accept-Language"))
    if (!lang) lang = fallbacklang

    // Redirect to language-prefixed path if needed
    if (
      !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
      !req.nextUrl.pathname.startsWith("/_next")
    ) {
      return NextResponse.redirect(
        new URL(`/${lang}${req.nextUrl.pathname}`, req.url)
      )
    }

    // Persist language cookie from referer
    if (req.headers.has("referer")) {
      const refererUrl = new URL(req.headers.get("referer") as string)
      const langInReferer = languages.find((l) =>
        refererUrl.pathname.startsWith(`/${l}`)
      )
      const response = NextResponse.next()
      if (langInReferer) response.cookies.set(cookieName, langInReferer)
      return response
    }

    // Protect admin routes
    if (req.nextUrl.pathname.includes("/admin") && !isAuth) {
      const from = encodeURIComponent(req.nextUrl.pathname)
      return NextResponse.redirect(
        new URL(`/${lang}/login?from=${from}`, req.url)
      )
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      async authorized() {
        return true
      },
    },
  }
)
