'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Building2, 
  Users, 
  Calendar, 
  Settings, 
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      // Check admin session
      const response = await fetch('/api/auth/check-admin-session')
      if (response.ok) {
        const userData = await response.json()
        if (userData.success && userData.user) {
          console.log('Admin user authenticated:', userData.user)
          setUser(userData.user)
        } else {
          console.error('Invalid admin session data:', userData)
          router.push('/adminlogin')
        }
      } else {
        console.error('Admin session check failed:', response.status)
        // 관리자 세션이 없으면 관리자 로그인 페이지로 리다이렉트
        router.push('/adminlogin')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/adminlogin')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navigation = [
    { name: '대시보드', href: '/admin', icon: BarChart3 },
    { name: '프로젝트 관리', href: '/admin/project-management', icon: Building2 },
    { name: '업체 참여 현황', href: '/admin/contractor-participation', icon: Users },
    { name: '업체 추가', href: '/admin/add-contractor', icon: Building2 },
    { name: '현장 방문 일정', href: '/admin/inspection-schedule', icon: Calendar },
  ]

  // 디버깅: navigation 배열 확인
  console.log('navigation:', navigation);
  navigation.forEach((item, index) => {
    console.log(`navigation[${index}]:`, item);
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* 모바일 사이드바 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-lg font-semibold text-gray-900">관리자 패널</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-5 px-2">
          {(navigation || []).map((item, index) => (
            <a
              key={item?.name || `nav-${index}`}
              href={item?.href || '#'}
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {item?.icon && <item.icon className="mr-4 h-6 w-6" />}
              {item?.name || '메뉴'}
            </a>
          ))}
        </nav>
      </div>

      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-lg font-semibold text-gray-900">관리자 패널</h1>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {(navigation || []).map((item, index) => (
              <a
                key={item?.name || `nav-${index}`}
                href={item?.href || '#'}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {item?.icon && <item.icon className="mr-3 h-5 w-5" />}
                {item?.name || '메뉴'}
              </a>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="lg:pl-64">
        {/* 모바일 헤더 */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white shadow">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">관리자 패널</h1>
            <div className="w-8" />
          </div>
        </div>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
