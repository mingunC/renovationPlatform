import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/admin/inspection-stats called ===');
    
    // Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    
    // 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log('No Supabase session found');
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    console.log('Supabase session found for user:', session.user.id);

    // 사용자 역할 확인 (users 테이블에서 type 필드 사용)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('type')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile || userProfile.type !== 'ADMIN') {
      console.log('User not admin:', { userId: session.user.id, type: userProfile?.type });
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('Admin user authenticated successfully');

    // 오늘 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 이번 주 시작일 (월요일)
    const thisWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 일요일이면 6일, 월요일이면 0일
    thisWeekStart.setDate(today.getDate() - daysToSubtract);
    thisWeekStart.setHours(0, 0, 0, 0);
    
    // 이번 주 종료일 (일요일)
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);

    console.log('Date ranges:', { today: today.toISOString(), thisWeekStart: thisWeekStart.toISOString(), thisWeekEnd: thisWeekEnd.toISOString() });

    // 통계 계산
    const [
      totalPending,
      scheduledToday,
      scheduledThisWeek,
      totalContractorsInterested
    ] = await Promise.all([
      // 현장 방문 대기 중인 프로젝트 수
      prisma.renovationRequest.count({
        where: { status: 'INSPECTION_PENDING' }
      }),
      
      // 오늘 현장 방문 일정이 있는 프로젝트 수
      prisma.renovationRequest.count({
        where: {
          status: 'INSPECTION_SCHEDULED',
          inspection_date: {
            gte: today.toISOString(),
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
          }
        }
      }),
      
      // 이번 주 현장 방문 일정이 있는 프로젝트 수
      prisma.renovationRequest.count({
        where: {
          status: 'INSPECTION_SCHEDULED',
          inspection_date: {
            gte: thisWeekStart.toISOString(),
            lte: thisWeekEnd.toISOString()
          }
        }
      }),
      
      // 현장 방문에 참여 희망하는 업체 수
      prisma.inspectionInterest.count({
        where: { will_participate: true }
      })
    ]);

    console.log('Calculated stats:', {
      totalPending,
      scheduledToday,
      scheduledThisWeek,
      totalContractorsInterested
    });

    const stats = {
      total_pending: totalPending,
      scheduled_today: scheduledToday,
      scheduled_this_week: scheduledThisWeek,
      total_contractors_interested: totalContractorsInterested
    };

    console.log('Returning inspection stats:', stats);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Admin inspection stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspection stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
