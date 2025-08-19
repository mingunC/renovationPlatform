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

    // 업체 통계 조회
    const [
      totalContractors,
      verifiedContractors,
      activeContractors,
      totalParticipations
    ] = await Promise.all([
      prisma.contractor.count(),
      prisma.contractor.count({
        where: {
          insurance_verified: true,
          wsib_verified: true
        }
      }),
      prisma.contractor.count({
        where: {
          profile_completed: true
        }
      }),
      prisma.inspectionInterest.count({
        where: {
          will_participate: true
        }
      })
    ]);

    // 참여율 계산
    const participationRate = totalContractors > 0 
      ? Math.round((totalParticipations / totalContractors) * 100)
      : 0;

    const stats = {
      total_contractors: totalContractors,
      verified_contractors: verifiedContractors,
      active_contractors: activeContractors,
      total_participations: totalParticipations,
      participation_rate: participationRate
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Admin contractor stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contractor stats' },
      { status: 500 }
    );
  }
}
