"use client";

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  type: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';
  contractor?: {
    id: string;
    business_name: string;
    profile_completed: boolean;
  };
}

export function Header() {
  const [user, setUser] = useState<any>(null); // Supabase user
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Database profile
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // Hydration 방지용
  const processingAuth = useRef(false);
  const router = useRouter();
  
  // Create Supabase client instance
  const supabase = createClient();

  // 클라이언트에서만 렌더링되도록 보장
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // 클라이언트 마운트 전에는 실행하지 않음

    const handleAuthChange = async (event: string, session: any) => {
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
          setUser(session.user); // Supabase user
          setUserProfile(data.user); // Database profile
        } else {
          const errorData = await response.json();
          console.error('❌ Profile processing failed:', response.status, errorData);
          
          // 실패해도 기본 사용자 정보는 설정
          setUser(session.user);
          setUserProfile({
            id: userId,
            email: userEmail,
            name: userName,
            type: 'CONTRACTOR' // 기본값을 CONTRACTOR로 변경
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
  }, [mounted]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      router.push('/');
      console.log('👋 User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 클라이언트 마운트 전에는 기본 skeleton UI 표시
  if (!mounted) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
                  <div className="flex items-center justify-between h-16">
          {/* 왼쪽: 로고 */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-blue-600">
              리노베이트 플랫폼
            </a>
          </div>
          
          {/* 중앙: 네비게이션 메뉴 (로딩 중에는 숨김) */}
          <nav className="flex-1 flex justify-center">
            <div className="flex items-center space-x-6">
              {/* 로딩 중에는 메뉴 숨김 */}
            </div>
          </nav>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 왼쪽: 로고 */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-blue-600">
              리노베이트 플랫폼
            </a>
          </div>
          
          {/* 중앙: 네비게이션 메뉴 */}
          <nav className="flex-1 flex justify-center">
            <div className="flex items-center space-x-6">
              {userProfile?.type === 'CONTRACTOR' && (
                <>
                  <a href="/dashboard" className="text-gray-600 hover:text-blue-600">
                    🏗️ 대시보드
                  </a>
                  <a href="/bids" className="text-gray-600 hover:text-blue-600">
                    내 입찰
                  </a>
                  <a href="/bid" className="text-gray-600 hover:text-blue-600">
                    프로젝트 둘러보기
                  </a>
                </>
              )}
              {userProfile?.type === 'CUSTOMER' && (
                <>
                  <a href="/my-projects" className="text-gray-600 hover:text-blue-600">
                    내 프로젝트
                  </a>
                  <a href="/compare" className="text-gray-600 hover:text-blue-600">
                    견적 비교
                  </a>
                </>
              )}
            </div>
          </nav>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-gray-700 font-medium">
                    {userProfile?.name || user.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {userProfile?.type === 'CONTRACTOR' ? 
                      `🏗️ ${userProfile.contractor?.business_name || 'Contractor'}` : 
                     userProfile?.type === 'CUSTOMER' ? '👤 Customer' : 
                     userProfile?.type === 'ADMIN' ? '⚡ Admin' : 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <a 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  👤 고객 로그인
                </a>
                <a 
                  href="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  📝 회원가입
                </a>
                <a 
                  href="/contractor-login" 
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  🏗️ 업체 로그인
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
