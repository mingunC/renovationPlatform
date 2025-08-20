"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Create Supabase client instance
  const supabase = getSupabaseBrowser();

  // 클라이언트에서만 렌더링되도록 보장
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const processingAuth = useRef(false);

  // React Query를 사용한 profile API 호출
  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async (): Promise<{ user: UserProfile }> => {
      if (!user?.id) throw new Error('No user ID');
      
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return response.json();
    },
    enabled: !!user?.id, // user가 있을 때만 실행
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 15 * 60 * 1000, // 15분 (cacheTime 대신 gcTime 사용)
  });

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
        setLoading(false);
        return;
      }

      processingAuth.current = true;
      
      try {
        setUser(session.user);
        setLoading(false);
      } catch (error) {
        console.error('❌ Auth processing error:', error);
        setLoading(false);
      } finally {
        processingAuth.current = false;
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
  }, []); // 의존성 배열을 빈 배열로 변경하여 마운트 시 한 번만 실행

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
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
              {userProfile?.user?.type === 'CONTRACTOR' && (
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
              
              {userProfile?.user?.type === 'CUSTOMER' && (
                <>
                  <a href="/my-projects" className="text-gray-600 hover:text-blue-600">
                    📋 내 프로젝트
                  </a>
                  <a href="/request" className="text-gray-600 hover:text-blue-600">
                    🚀 새 프로젝트 요청
                  </a>
                </>
              )}
              
              {userProfile?.user?.type === 'ADMIN' && (
                <>
                  <a href="/admin" className="text-gray-600 hover:text-blue-600">
                    ⚙️ 관리자 패널
                  </a>
                </>
              )}
            </div>
          </nav>
          
          {/* 오른쪽: 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">
                    {userProfile?.user?.name || user.user_metadata?.name || user.email?.split('@')[0]}
                  </span>
                  {userProfile?.user?.contractor && (
                    <span className="ml-2 text-gray-500">
                      ({userProfile.user.contractor.business_name})
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <a
                  href="/login"
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  로그인
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  회원가입
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
