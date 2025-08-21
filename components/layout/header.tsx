'use client'

import { useAuth } from '@/contexts/auth-context'
import { UserMenu } from './user-menu'
import { NavigationMenu } from './navigation-menu'

export function Header() {
  const { loading } = useAuth()
  
  // 디버깅: loading 상태 확인
  console.log('🔍 Header Debug:', { loading });
  
  // 서버와 첫 클라이언트 렌더링에서 동일한 컴포넌트 반환
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
              {!loading && (
                // 로딩이 완료되면 네비게이션 렌더링
                <NavigationMenu />
              )}
            </div>
          </nav>
          
          {/* 오른쪽: 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {!loading ? (
              // 로딩이 완료되면 사용자 메뉴 렌더링
              <UserMenu />
            ) : (
              // 로딩 중일 때 스켈레톤
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
