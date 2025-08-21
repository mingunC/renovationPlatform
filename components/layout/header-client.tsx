"use client";

import { Suspense, useEffect, useRef, useState } from 'react';
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

// Header Skeleton 컴포넌트
function HeaderSkeleton() {
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
              {/* 로딩 중에는 메뉴 숨김 */}
            </div>
          </nav>
          
          {/* 오른쪽: 로딩 스켈레톤 */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Header Content 컴포넌트 (실제 인증 상태 기반 UI)
function HeaderContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Create Supabase client instance
  const supabase = getSupabaseBrowser();

  // 클라이언트 전용 렌더링을 위한 상태
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const processingAuth = useRef(false);

  // React Query를 사용한 profile API 호출
  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<{ user: UserProfile }> => {
      if (!user?.id) throw new Error('No user ID');
      
      console.log('🔍 Fetching user profile for:', user.id);
      
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

      const result = await response.json();
      console.log('✅ User profile fetched:', result);
      return result;
    },
    enabled: !!user?.id, // user가 있을 때만 실행 (loading 조건 제거)
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 15 * 60 * 1000, // 15분 (cacheTime 대신 gcTime 사용)
  });

  // 클라이언트 전용 렌더링을 위한 상태 설정
  useEffect(() => {
    console.log('🚀 Header component mounting...');
    setIsClient(true);
    console.log('✅ Header component mounted');
  }, []);

  useEffect(() => {
    if (!isClient) return; // 클라이언트 마운트 전에는 실행하지 않음

    const getUser = async () => {
      // 중복 처리 방지
      if (processingAuth.current) {
        console.log('⏸️ Auth processing already in progress...');
        return;
      }
      
      processingAuth.current = true;
      console.log('🔍 Starting user authentication check...');
      setLoading(true);
      
      try {
        // 초기 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session check error:', sessionError);
          setUser(null);
          return;
        }

        if (session?.user?.id) {
          console.log('✅ User session found:', session.user.id);
          setUser(session.user);
        } else {
          console.log('ℹ️ No user session found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Authentication check error:', error);
        setUser(null);
      } finally {
        processingAuth.current = false; // 반드시 리셋
        setLoading(false);
        console.log('✅ Authentication check completed');
      }
    };

    // 사용자 정보 로드
    getUser();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      // 중복 처리 방지
      if (processingAuth.current) {
        console.log('⏸️ Auth processing already in progress...');
        return;
      }

      processingAuth.current = true;
      
      try {
        if (session?.user?.id) {
          console.log('✅ User authenticated:', session.user.id);
          setUser(session.user);
        } else {
          console.log('ℹ️ User signed out');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
      } finally {
        processingAuth.current = false; // 반드시 리셋
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isClient]); // isClient를 의존성으로 추가

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

  // 서버와 클라이언트 첫 렌더링에서 동일한 UI 반환 (Hydration 불일치 방지)
  if (!isClient) {
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
            
            {/* 오른쪽: 로그인/회원가입/업체로그인 버튼 (서버와 동일하게 표시) */}
            <div className="flex items-center space-x-3">
              <a
                href="/login"
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                로그인
              </a>
              <a
                href="/contractor-login"
                className="px-3 py-2 text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                업체로그인
              </a>
              <a
                href="/register"
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                회원가입
              </a>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 디버깅: 현재 상태 출력
  console.log('🔍 Header Debug Info:', {
    mounted,
    loading,
    user: !!user,
    userProfile: !!userProfile,
    userType: userProfile?.user?.type
  });

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
              // 로딩 중에도 로그인/회원가입/업체로그인 버튼 표시
              <div className="flex items-center space-x-3">
                <a
                  href="/login"
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  로그인
                </a>
                <a
                  href="/contractor-login"
                  className="px-3 py-2 text-sm text-green-600 hover:text-green-700 transition-colors"
                >
                  업체로그인
                </a>
                <a
                  href="/register"
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  회원가입
                </a>
              </div>
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
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  로그인
                </a>
                <a
                  href="/contractor-login"
                  className="px-3 py-2 text-sm text-green-600 hover:text-green-700 transition-colors"
                >
                  업체로그인
                </a>
                <a
                  href="/register"
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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

// Header Client 컴포넌트 (클라이언트에서만 실행)
export default function HeaderClient() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderContent />
    </Suspense>
  );
}
