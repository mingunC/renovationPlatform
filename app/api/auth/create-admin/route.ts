import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 이미 존재하는 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // 이미 존재하는 사용자가 ADMIN이면 성공
      if (existingUser.type === 'ADMIN') {
        return NextResponse.json({
          success: true,
          message: 'Admin account already exists',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            type: existingUser.type
          }
        });
      } else {
        // 다른 타입의 사용자가 존재하면 타입을 ADMIN으로 변경
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { type: 'ADMIN' }
        });

        return NextResponse.json({
          success: true,
          message: 'User type updated to ADMIN',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            type: updatedUser.type
          }
        });
      }
    }

    // 새로운 관리자 계정 생성
    const newAdmin = await prisma.user.create({
      data: {
        email,
        name: 'System Administrator',
        type: 'ADMIN',
        phone: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        type: newAdmin.type
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    );
  }
}
