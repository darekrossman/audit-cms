import { type NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get(
    process.env.AUTH_COOKIE_NAME ?? 'audit-cms-auth',
  )
  const pathname = request.nextUrl.pathname

  // Allow login page and auth API without authentication
  const publicPaths = ['/login', '/api/auth']
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!authCookie?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
