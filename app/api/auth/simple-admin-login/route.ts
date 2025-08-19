import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/auth/simple-admin-login called ===');
    
    const { email } = await request.json();
    console.log('Login attempt for email:', email);

    if (!email) {
      console.log('Email is required');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 데이터베이스에서 사용자 확인
    const user = await prisma.user.findFirst({
      where: { email }
    });

    console.log('User found:', user);

    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.type !== 'ADMIN') {
      console.log('User is not admin:', { userId: user.id, userType: user.type });
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    console.log('Admin user authenticated, setting session cookie');

    // 개발 환경에서는 간단하게 세션 쿠키 설정
    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type
      }
    });

    // 간단한 세션 쿠키 설정 (개발용)
    const cookieValue = user.id
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 // 24시간
    }
    
    console.log('Setting cookie with options:', { cookieValue, cookieOptions })
    response.cookies.set('admin_session', cookieValue, cookieOptions)

    console.log('Session cookie set for user:', user.id);
    console.log('Response cookies:', response.cookies.getAll());
    return response;

  } catch (error) {
    console.error('Simple admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
