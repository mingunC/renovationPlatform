// lib/supabase.ts (또는 원하시는 다른 경로)

import { createBrowserClient } from '@supabase/ssr'

// ==================================
//        클라이언트 측 클라이언트
// ==================================
// 클라이언트 컴포넌트나 다른 클라이언트 측 코드에서 사용하세요.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}