// lib/supabase-server.ts - 서버 전용 함수들

import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

// ==================================
//        서버 측 클라이언트
// ==================================

// Next.js 미들웨어에서 사용하세요.
export function createMiddlewareClient(req: NextRequest) {
  // 1. response 객체는 여기서 한 번만 생성합니다.
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        // 2. set과 remove에서는 response 객체를 새로 만들지 않고,
        //    이미 만들어진 response의 쿠키를 직접 수정합니다.
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  return { supabase, response }
}

// 서버 컴포넌트, 서버 액션, 라우트 핸들러에서 사용하세요.
export async function createServerActionClient() {
  const cookieStore = await cookies()
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// ==================================
//        서버 인증 헬퍼
// ==================================
// 서버 액션(Server Actions)에서 사용하세요.

export const authServerHelpers = {
  // 새 사용자 회원가입
  async signUp(email: string, password: string, userData: Record<string, unknown> = {}) {
    const supabase = await createServerActionClient()
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        // 이메일 인증 후 리디렉션될 URL을 지정할 수 있습니다.
        // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })
  },

  // 기존 사용자 로그인
  async signIn(email: string, password: string) {
    const supabase = await createServerActionClient()
    return supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  // 현재 사용자 로그아웃
  async signOut() {
    const supabase = await createServerActionClient()
    return supabase.auth.signOut()
  },

  // 서버 컨텍스트에서 현재 사용자 정보 가져오기
  async getUser() {
    const supabase = await createServerActionClient()
    return supabase.auth.getUser()
  },

  // 서버 컨텍스트에서 현재 세션 정보 가져오기
  async getSession() {
    const supabase = await createServerActionClient()
    return supabase.auth.getSession()
  },
  
  // 비밀번호 재설정
  async resetPassword(email: string, redirectTo: string) {
    const supabase = await createServerActionClient();
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  },

  // 로그인된 사용자 비밀번호 업데이트
  async updatePassword(password: string) {
    const supabase = await createServerActionClient();
    return supabase.auth.updateUser({ password });
  },
}
