'use client'

import { useAuth } from '@/contexts/auth-context'

export function UserMenu() {
  const { user, userProfile, loading, logout } = useAuth();



  // 로딩 중
  if (loading) {
    return (
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
    );
  }

  // 로그인한 사용자
  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-sm text-gray-700">
          <span className="font-medium">
            {userProfile?.name || user.user_metadata?.name || user.email?.split('@')[0]}
          </span>
          {userProfile?.contractor && (
            <span className="ml-2 text-gray-500">
              ({userProfile.contractor.business_name})
            </span>
          )}
        </div>
        <button
          onClick={logout}
          className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  // 로그인하지 않은 사용자
  return (
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
  );
}
