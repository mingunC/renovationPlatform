'use client'

import { useAuth } from '@/contexts/auth-context'

export function NavigationMenu() {
  const { userProfile, loading, userType } = useAuth();

  // 디버깅: 현재 상태 출력
  console.log('🔍 NavigationMenu Debug:', {
    hasUserProfile: !!userProfile,
    userType,
    loading
  });

  // 로딩 중인 경우 스켈레톤 표시
  if (loading) {
    return <NavigationSkeleton />;
  }

  // 로그인하지 않은 경우 공개 메뉴 표시
  if (!userProfile) {
    return (
      <>
        <a href="/request" className="text-gray-600 hover:text-blue-600">
          🚀 프로젝트 요청
        </a>
        <a href="/compare" className="text-gray-600 hover:text-blue-600">
          💰 견적 비교
        </a>
      </>
    );
  }

  console.log('✅ NavigationMenu: Rendering menu for user type:', userType);

  // 사용자 타입에 따른 메뉴 렌더링
  return (
    <>
      {userType === 'CONTRACTOR' && (
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
      
      {userType === 'CUSTOMER' && (
        <>
          <a href="/my-projects" className="text-gray-600 hover:text-blue-600">
            📋 내 프로젝트
          </a>
          <a href="/request" className="text-gray-600 hover:text-blue-600">
            🚀 새 프로젝트 요청
          </a>
        </>
      )}
      
      {userType === 'ADMIN' && (
        <>
          <a href="/admin" className="text-gray-600 hover:text-blue-600">
            ⚙️ 관리자 패널
          </a>
        </>
      )}
    </>
  );
}

// Navigation Skeleton 컴포넌트
function NavigationSkeleton() {
  return (
    <div className="flex items-center space-x-6">
      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}
