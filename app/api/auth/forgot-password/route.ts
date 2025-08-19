import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import { PasswordResetEmail } from '@/components/emails/PasswordResetEmail'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 1. 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      // 보안을 위해 사용자가 존재하지 않아도 성공 응답
      return NextResponse.json(
        { success: true, message: '비밀번호 재설정 링크가 발송되었습니다.' },
        { status: 200 }
      )
    }

    // 2. Supabase에서 비밀번호 재설정 링크 생성
    const supabase = await createServerActionClient()
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      console.error('Supabase password reset error:', error)
      
      // Rate limit 에러 처리
      if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
        return NextResponse.json(
          { 
            error: '보안을 위해 잠시 후 다시 시도해주세요. (약 30초 대기 필요)',
            code: 'RATE_LIMIT'
          },
          { status: 429 }
        )
      }
      
      // 기타 Supabase 에러
      return NextResponse.json(
        { error: '비밀번호 재설정 링크 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 3. 이메일 발송
    try {
      const emailHtml = render(
        PasswordResetEmail({
          userName: user.name,
          resetLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password`,
          expiryHours: 24
        })
      )

      await emailService.sendEmail({
        to: user.email,
        subject: '🔐 비밀번호 재설정 요청 - Renovate Platform',
        html: emailHtml,
      })

      console.log(`✅ Password reset email sent to ${user.email}`)

    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // 이메일 발송 실패해도 API는 성공 응답 (Supabase 링크는 생성됨)
    }

    // 4. 성공 응답
    return NextResponse.json(
      { 
        success: true, 
        message: '비밀번호 재설정 링크가 발송되었습니다. 이메일을 확인해주세요.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
