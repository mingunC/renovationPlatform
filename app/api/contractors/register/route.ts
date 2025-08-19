import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json()

    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'Email, password, name, and phone are required' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = await createServerActionClient()

    // Supabase에서 회원가입 (이메일 확인 필요)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          user_type: 'CONTRACTOR_PENDING' // 이메일 확인 전까지는 PENDING 상태
        }
      }
    })

    if (error) {
      console.error('Supabase signup error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // 데이터베이스에 사용자 생성 (이메일 확인 전까지는 CUSTOMER 타입)
    const user = await prisma.user.create({
      data: {
        id: data.user?.id || '',
        email,
        name,
        phone,
        type: 'CUSTOMER', // 이메일 확인 후 CONTRACTOR로 변경될 예정
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contractor registration successful. Please check your email to confirm your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type
      }
    })

  } catch (error) {
    console.error('Contractor registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
