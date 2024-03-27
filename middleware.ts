import { NextResponse } from 'next/server'
import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import acceptLanguage from 'accept-language'
import { fallbacklang, languages, cookieName } from './app/i18n/settings'

acceptLanguage.languages(languages)

// export const config = {
//   // matcher: '/:lang*'
//   matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)']
// }

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/login",
    "/register",
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'
  ],
}

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register")

    // i18n
    let lang
    if (req.cookies.has(cookieName)) lang = acceptLanguage.get(req.cookies.get(cookieName)?.value)
    if (!lang) lang = acceptLanguage.get(req.headers.get('Accept-Language'))
    if (!lang) { lang = fallbacklang }

    // Redirect if lang in path is not supported
    if (
      !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
      !req.nextUrl.pathname.startsWith('/_next')
    ) {
      return NextResponse.redirect(new URL(`/${lang}${req.nextUrl.pathname}`, req.url))
    }

    if (req.headers.has('referer')) {
      const refererUrl = new URL(req.headers.get('referer') as unknown as URL)
      const langInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
      const response = NextResponse.next()
      if (langInReferer) response.cookies.set(cookieName, langInReferer)
      return response
    }

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL(`/${lang}/dashboard`, req.url))
      }

      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }

      return NextResponse.redirect(
        new URL(`/${lang}/login?from=${encodeURIComponent(from)}`, req.url)
      )
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true
      },
    },
  }
)

