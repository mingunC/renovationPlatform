// lib/supabase-admin.ts - 관리자 권한을 가진 Supabase 클라이언트

import { createClient } from '@supabase/supabase-js'

// ==================================
//        관리자 클라이언트
// ==================================
// Service Role Key를 사용하여 관리자 권한으로 작업

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or Service Role Key')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// ==================================
//        관리자 인증 헬퍼
// ==================================

export const adminAuthHelpers = {
  // 관리자 권한으로 새 사용자 생성
  async createUser(email: string, password: string, userData: Record<string, unknown> = {}) {
    const supabase = createAdminClient()
    return supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 확인 자동 완료
      user_metadata: userData
    })
  },

  // 사용자 정보 업데이트
  async updateUser(userId: string, updates: Record<string, unknown>) {
    const supabase = createAdminClient()
    return supabase.auth.admin.updateUserById(userId, updates)
  },

  // 사용자 삭제
  async deleteUser(userId: string) {
    const supabase = createAdminClient()
    return supabase.auth.admin.deleteUser(userId)
  },

  // 모든 사용자 조회
  async listUsers() {
    const supabase = createAdminClient()
    return supabase.auth.admin.listUsers()
  }
}
