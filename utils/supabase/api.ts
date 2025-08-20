// utils/supabase/api.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function createSupabaseClient() {
  try {
    const cookieStore = await cookies();
    
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server Component에서 호출된 경우 무시
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw error;
  }
}

export async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user && !error) {
    // 세션으로 재시도
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  }
  
  return user;
}

// 에러 응답을 위한 헬퍼 함수
export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json({
    error: message,
    timestamp: new Date().toISOString(),
    status
  }, { status });
}

// 인증 실패 시 일관된 응답
export function createAuthErrorResponse(message: string = 'Authentication required') {
  return createErrorResponse(message, 401);
}

// 권한 부족 시 일관된 응답
export function createForbiddenResponse(message: string = 'Access denied') {
  return createErrorResponse(message, 403);
}

// 리소스 없음 시 일관된 응답
export function createNotFoundResponse(message: string = 'Resource not found') {
  return createErrorResponse(message, 404);
}
