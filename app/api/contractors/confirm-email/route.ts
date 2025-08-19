import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = await createServerActionClient()

    // 현재 사용자 세션 확인
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // 데이터베이스에서 사용자 확인
    const dbUser = await prisma.user.findFirst({
      where: { email }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 사용자 타입을 CONTRACTOR로 변경
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        type: 'CONTRACTOR',
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email confirmed. You can now complete your contractor onboarding.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        type: updatedUser.type
      }
    })

  } catch (error) {
    console.error('Email confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
