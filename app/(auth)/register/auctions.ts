// app/(auth)/register/actions.ts

"use server"

import { createServerActionClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signupAction(formData: FormData) {
  const supabase = await createServerActionClient() // Add 'await' here

  // 폼 데이터 추출
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const userType = formData.get("userType") as 'CUSTOMER' | 'CONTRACTOR'

  // 유효성 검사
  if (!email || !password || !name) {
    return { error: "필수 정보를 모두 입력해주세요." }
  }

  // 1. Supabase Auth에 사용자 등록
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 이 데이터는 auth.users의 raw_user_meta_data에 저장됩니다.
      // emailRedirectTo를 설정하여 확인 이메일 후 리디렉션 경로 지정 가능
      data: {
        user_type: userType, // user_type만 메타데이터로 저장하거나 필요에 따라 조정
      }
    },
  })

  if (authError) {
    return { error: `회원가입 중 오류가 발생했습니다: ${authError.message}` }
  }

  if (authData.user) {
    // 2. (개선 사항) public.profiles 테이블에 프로필 정보 저장
    const { error: profileError } = await supabase
      .from('profiles') // 'profiles'는 직접 만드신 프로필 테이블명
      .insert({
        id: authData.user.id, // Auth 사용자의 ID와 동일하게 설정
        full_name: name,
        phone: phone,
        // user_type도 profiles 테이블에 컬럼이 있다면 추가
      })

    if (profileError) {
      // 프로필 생성 실패 시 오류 처리 (예: 이미 생성된 auth.user 삭제 등 롤백 로직 추가 가능)
      return { error: `프로필 생성 중 오류가 발생했습니다: ${profileError.message}` }
    }
  }

  // 성공 시 경로 재검증 및 리디렉션
  revalidatePath("/", "layout")
  redirect("/login?message=signup-success") // 성공 메시지와 함께 로그인 페이지로 이동
}