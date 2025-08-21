'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface RouteGuardProps {
  children: React.ReactNode;
  allowedTypes: ('CUSTOMER' | 'CONTRACTOR' | 'ADMIN')[];
  redirectTo?: string;
}

export function RouteGuard({ children, allowedTypes, redirectTo = '/' }: RouteGuardProps) {
  const { userProfile, loading, userType } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 로딩 중이면 대기
    if (loading) return;

    // 사용자가 로그인하지 않은 경우
    if (!userProfile) {
      console.log('🚫 RouteGuard: User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // 사용자 타입이 허용되지 않은 경우
    if (!allowedTypes.includes(userType!)) {
      console.log(`🚫 RouteGuard: User type ${userType} not allowed for this route`);
      
      // 사용자 타입에 따른 적절한 리다이렉트
      if (userType === 'CUSTOMER') {
        router.push('/my-projects');
      } else if (userType === 'CONTRACTOR') {
        router.push('/dashboard');
      } else if (userType === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
      return;
    }

    console.log(`✅ RouteGuard: Access granted for user type ${userType}`);
  }, [userProfile, loading, userType, allowedTypes, router, redirectTo, pathname]);

  // 로딩 중이거나 권한이 없는 경우
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 권한이 없는 경우
  if (!userProfile || !allowedTypes.includes(userType!)) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  // 권한이 있는 경우
  return <>{children}</>;
}

// 편의를 위한 특정 타입별 가드들
export function CustomerGuard({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedTypes={['CUSTOMER']}>{children}</RouteGuard>;
}

export function ContractorGuard({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedTypes={['CONTRACTOR']}>{children}</RouteGuard>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedTypes={['ADMIN']}>{children}</RouteGuard>;
}

export function CustomerOrContractorGuard({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedTypes={['CUSTOMER', 'CONTRACTOR']}>{children}</RouteGuard>;
}
