import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseReqResClient(request)
  
  // Get the session
  const { data: { session }, error } = await supabase.auth.getSession()
  
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/auth/callback',
    '/auth/reset-password',
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // If user is not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated, get their profile
  if (session && !isPublicRoute) {
    try {
      // Get user profile from database
      const profileResponse = await fetch(`${request.nextUrl.origin}/api/auth/profile?id=${session.user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (profileResponse.ok) {
        const { user } = await profileResponse.json()
        
        if (user) {
          // Route protection based on user type
          const isCustomerRoute = pathname.startsWith('/request') || 
                                 pathname.startsWith('/my-projects') || 
                                 pathname.startsWith('/compare')
          
          const isContractorRoute = pathname.startsWith('/dashboard') || 
                                   pathname.startsWith('/bids') || 
                                   pathname.startsWith('/contractor-onboarding')

          // Check if customer is trying to access contractor routes
          if (user.type === 'CUSTOMER' && isContractorRoute) {
            url.pathname = '/my-projects'
            return NextResponse.redirect(url)
          }

          // Check if contractor is trying to access customer routes
          if (user.type === 'CONTRACTOR' && isCustomerRoute) {
            // Check if contractor profile is complete
            if (!user.contractor && pathname !== '/contractor-onboarding') {
              url.pathname = '/contractor-onboarding'
              return NextResponse.redirect(url)
            } else if (user.contractor) {
              url.pathname = '/dashboard'
              return NextResponse.redirect(url)
            }
          }

          // Redirect contractors without complete profile to onboarding
          if (user.type === 'CONTRACTOR' && !user.contractor && pathname !== '/contractor-onboarding') {
            url.pathname = '/contractor-onboarding'
            return NextResponse.redirect(url)
          }
        }
      }
    } catch (error) {
      console.error('Middleware error:', error)
      // If there's an error getting the profile, redirect to login
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // If user is authenticated and trying to access auth pages, redirect them
  if (session && (pathname === '/login' || pathname === '/register')) {
    try {
      const profileResponse = await fetch(`${request.nextUrl.origin}/api/auth/profile?id=${session.user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (profileResponse.ok) {
        const { user } = await profileResponse.json()
        
        if (user) {
          if (user.type === 'CUSTOMER') {
            url.pathname = '/my-projects'
          } else if (user.type === 'CONTRACTOR') {
            url.pathname = user.contractor ? '/dashboard' : '/contractor-onboarding'
          } else {
            url.pathname = '/'
          }
          return NextResponse.redirect(url)
        }
      }
    } catch (error) {
      console.error('Middleware redirect error:', error)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
