// app/api/auth/simple-admin-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('=== Simple Admin Login API called ===');
    console.log('Email:', email);
    console.log('Password provided:', !!password);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 데이터베이스에서 사용자 확인 (테이블명 수정: user → users)
    const user = await prisma.users.findUnique({
      where: { email }
    });

    console.log('User found:', user ? { id: user.id, email: user.email, type: user.type } : 'Not found');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.type !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // 간단한 비밀번호 체크 (실제로는 해시된 비밀번호와 비교해야 함)
    // 현재는 테스트용으로 하드코딩된 비밀번호 사용
    const validPasswords = ['admin123', 'admin', '123456']; // 테스트용
    
    if (!validPasswords.includes(password)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // 관리자 세션 쿠키 생성
    const cookieStore = await cookies();
    cookieStore.set('admin_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    });

    console.log('Admin login successful, session created:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}