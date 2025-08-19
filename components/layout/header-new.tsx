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
    const handleAuthChange = async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      // 중복 처리 방지
      if (processingAuth.current) {
        console.log('⏸️ Auth processing already in progress...');
        return;
      }

      if (!session?.user?.id) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      processingAuth.current = true;
      
      try {
        const userId = session.user.id;
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.name || 
                        session.user.user_metadata?.full_name ||
                        userEmail?.split('@')[0] || 
                        'Unknown';

        console.log('📝 Processing user profile:', { userId, userEmail, userName });

        // 사용자 프로필 생성/업데이트
        const response = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({
            id: userId,
            email: userEmail,
            name: userName
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ User profile processed successfully:', data.user);
          setUser(session.user);
          setUserProfile(data.user);
        } else {
          const errorData = await response.json();
          console.error('❌ Profile processing failed:', response.status, errorData);
          
          // 실패해도 기본 사용자 정보는 설정
          setUser(session.user);
          setUserProfile({
            id: userId,
            email: userEmail,
            name: userName,
            type: 'CONTRACTOR'
          });
        }

      } catch (error) {
        console.error('❌ Auth processing error:', error);
        
        // 에러 발생해도 기본 사용자 정보는 설정
        setUser(session.user);
        setUserProfile({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || 'Unknown',
          type: 'CONTRACTOR'
        });
      } finally {
        processingAuth.current = false;
        setLoading(false);
      }
    };

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange('INITIAL_SESSION', session);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      console.log('👋 User logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

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

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {userProfile?.name || user.email?.split('@')[0] || 'User'}!
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
                <Link href="/contractor-login">
                  <Button variant="secondary" size="sm">
                    업체 로그인
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
