import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase-server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)
  
  // Use getUser() instead of getSession() for better security
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  const url = request.nextUrl.clone()
  const pathname = url.pathname
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/contractor-login',
    '/register',
    '/adminlogin',
    '/auth/callback',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/health',
    '/manifest.json',
    '/.well-known/',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/apple-touch-icon.svg'
  ]
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/request',
    '/my-projects',
    '/compare',
    '/dashboard',
    '/bids',
    '/contractor-onboarding',
  ]
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/' || route.endsWith('.json') || route.endsWith('.ico') || route.endsWith('.png')) {
      return pathname === route
    }
    return pathname.startsWith(route)
  })
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Debug logging
  console.log(`[Middleware] Path: ${pathname}, SupabaseUser: ${!!user}, Public: ${isPublicRoute}, Protected: ${isProtectedRoute}`)
  
  // 무한 리다이렉트 방지
  const redirectTo = url.searchParams.get('redirectTo')
  if (redirectTo && pathname === '/login' && redirectTo === pathname) {
    console.log(`[Middleware] Preventing infinite loop for path: ${pathname}`)
    return NextResponse.next()
  }
  
  // Check if user is authenticated (Supabase user only)
  const isAuthenticated = !!user
  
  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && (isProtectedRoute || !isPublicRoute)) {
    console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to /login`)
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }
  
  // If user is authenticated (Supabase user) and trying to access auth pages, redirect them
  if (!!user && (pathname === '/login' || pathname === '/register')) {
    console.log(`[Middleware] Redirecting authenticated Supabase user from ${pathname} to home`)
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.well-known/|robots.txt|sitemap.xml|apple-touch-icon).*)',
  ],
}                                                     