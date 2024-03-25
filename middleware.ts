import { NextResponse } from 'next/server'
import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName } from './app/i18n/settings'

acceptLanguage.languages(languages)

// export const config = {
//   // matcher: '/:lng*'
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
    let lng
    if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)?.value)
    if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
    if (!lng) { lng = fallbackLng }

    // Redirect if lng in path is not supported
    if (
      !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
      !req.nextUrl.pathname.startsWith('/_next')
    ) {
      return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url))
    }

    if (req.headers.has('referer')) {
      const refererUrl = new URL(req.headers.get('referer') as unknown as URL)
      const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
      const response = NextResponse.next()
      if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
      return response
    }

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL(`/${lng}/dashboard`, req.url))
      }

      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }

      return NextResponse.redirect(
        new URL(`/${lng}/login?from=${encodeURIComponent(from)}`, req.url)
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

