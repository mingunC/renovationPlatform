'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  name: string | null
  type: 'CUSTOMER' | 'CONTRACTOR'
  contractor?: {
    id: string
    business_name: string
    phone: string
    service_categories: string[]
    service_areas: string[]
    years_experience: number
    license_number: string | null
    insurance_info: string | null
    website: string | null
    bio: string | null
    hourly_rate: number | null
    profile_completed: boolean
    verified: boolean
  }
}

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const processingAuth = useRef(false)

  // Create Supabase client instance
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      if (session?.user) {
        try {
          const response = await fetch(`/api/auth/profile?id=${session.user.id}`)
          if (response.ok) {
            const { user: profile } = await response.json()
            setUserProfile(profile)
          } else if (response.status === 404) {
            // 사용자 프로필이 없는 경우 자동으로 생성
            console.log('⚠️ User profile not found in getUser, creating automatically...')
            try {
              const createResponse = await fetch('/api/auth/profile', {
                method: 'POST', // Use POST for simplified profile handling
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown',
                  type: 'CONTRACTOR' // 기본값으로 CONTRACTOR 설정
                })
              })
              
              if (createResponse.ok) {
                const { user: newProfile } = await createResponse.json()
                console.log('✅ User profile created successfully in getUser')
                setUserProfile(newProfile)
              } else {
                console.error('❌ Failed to create user profile in getUser:', createResponse.status)
              }
            } catch (createError) {
              console.error('Profile creation error in getUser:', createError)
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
      setLoading(false)
    }

    getUser()

    // Prevent multiple simultaneous profile creation requests
    const creatingProfile = useRef(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      
      if (!session?.user?.id) {
        setUserProfile(null)
        return
      }
      
      const userId = session.user.id
      
      // Prevent multiple simultaneous requests
      if (creatingProfile.current) {
        console.log('🔄 Profile creation already in progress, skipping...')
        return
      }
      
      try {
        // Check if profile exists
        const response = await fetch(`/api/auth/profile?id=${userId}`)
        
        if (response.ok) {
          const { user: profile } = await response.json()
          setUserProfile(profile)
          console.log('✅ User profile found and loaded')
        } else if (response.status === 404) {
          // User profile not found, create automatically
          creatingProfile.current = true
          console.log('⚠️ User profile not found, creating automatically...')
          
          try {
            const createResponse = await fetch('/api/auth/profile', {
              method: 'POST', // Use POST for simplified profile handling
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: userId,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown',
                type: 'CONTRACTOR' // Default to CONTRACTOR
              })
            })
            
            if (createResponse.ok) {
              const { user: newProfile } = await createResponse.json()
              console.log('✅ User profile created successfully')
              setUserProfile(newProfile)
            } else if (createResponse.status === 409) {
              console.log('ℹ️ Profile already exists (race condition resolved)')
              // This is actually success - profile exists now
              // Try to fetch the profile again
              const retryResponse = await fetch(`/api/auth/profile?id=${userId}`)
              if (retryResponse.ok) {
                const { user: profile } = await retryResponse.json()
                setUserProfile(profile)
                console.log('✅ Profile retrieved after race condition')
              }
            } else {
              console.error('❌ Failed to create user profile:', createResponse.status)
              throw new Error(`Failed to create profile: ${createResponse.status}`)
            }
          } catch (createError) {
            console.error('❌ Profile creation error:', createError)
          }
        } else {
          console.error('❌ Unexpected response status:', response.status)
        }
      } catch (error) {
        console.error('❌ Error handling user profile:', error)
      } finally {
        creatingProfile.current = false
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getNavigationLinks = () => {
    if (!userProfile) return []

    if (userProfile.type === 'CUSTOMER') {
      return [
        { href: '/my-projects', label: 'My Projects' },
        { href: '/compare', label: 'Compare Bids' },
      ]
    } else if (userProfile.type === 'CONTRACTOR') {
      return [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/bids', label: 'My Bids' },
        { href: '/bid', label: 'Browse Requests' },
      ]
    }

    return []
  }

  const navigationLinks = getNavigationLinks()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Renovate Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {userProfile?.type === 'CONTRACTOR' && userProfile.contractor?.business_name
                        ? userProfile.contractor.business_name
                        : userProfile?.name || user.email}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {userProfile?.type === 'CONTRACTOR' ? 'Contractor' : 'Customer'}
                    </p>
                  </div>
                </div>

                {/* Settings */}
                <Button asChild variant="ghost" size="sm">
                  <Link href="/settings">Settings</Link>
                </Button>

                {/* Sign Out */}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/contractor-login">업체 로그인</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/settings"
                    className="text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
