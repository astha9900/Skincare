import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const role = (req.auth?.user as { role?: string } | undefined)?.role
  const path = req.nextUrl.pathname

  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
  }
  if (path.startsWith('/vendor') && !['ADMIN', 'VENDOR'].includes(role ?? '')) {
    return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
  }
  const protectedPaths = ['/profile', '/checkout', '/my-orders', '/wishlist']
  if (protectedPaths.some((p) => path.startsWith(p)) && !req.auth) {
    return NextResponse.redirect(new URL(`/login?redirect=${path}`, req.url))
  }
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/my-orders/:path*',
    '/wishlist/:path*',
  ],
}
