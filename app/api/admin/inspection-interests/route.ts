import { NextRequest, NextResponse } from 'next/server';
import { createServerActionClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const supabase = await createServerActionClient();

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 데이터베이스에서 사용자 정보 확인
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser || dbUser.type !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 현장 방문 참여 현황 조회
    const interests = await prisma.inspectionInterest.findMany({
      include: {
        request: {
          select: {
            id: true,
            property_type: true,
            category: true,
            address: true,
            customer: {
              select: {
                name: true
              }
            }
          }
        },
        contractor: {
          select: {
            id: true,
            business_name: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      interests
    });

  } catch (error) {
    console.error('Admin inspection interests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspection interests' },
      { status: 500 }
    );
  }
}
