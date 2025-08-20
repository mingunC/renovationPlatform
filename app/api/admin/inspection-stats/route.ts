import { NextRequest, NextResponse } from 'next/server';
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

    // 통계 계산 - Supabase 사용
    const [
      totalPendingResult,
      scheduledTodayResult,
      scheduledThisWeekResult,
      totalContractorsInterestedResult
    ] = await Promise.all([
      // 현장 방문 대기 중인 프로젝트 수
      supabase
        .from('renovation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'INSPECTION_PENDING'),
      
      // 오늘 현장 방문 일정이 있는 프로젝트 수
      supabase
        .from('renovation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'INSPECTION_SCHEDULED')
        .gte('inspection_date', today.toISOString())
        .lt('inspection_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()),
      
      // 이번 주 현장 방문 일정이 있는 프로젝트 수
      supabase
        .from('renovation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'INSPECTION_SCHEDULED')
        .gte('inspection_date', thisWeekStart.toISOString())
        .lte('inspection_date', thisWeekEnd.toISOString()),
      
      // 현장 방문에 관심을 보인 업체 수
      supabase
        .from('inspection_interests')
        .select('*', { count: 'exact', head: true })
        .eq('will_participate', true)
    ]);

    // 결과 추출
    const totalPending = totalPendingResult.count || 0;
    const scheduledToday = scheduledTodayResult.count || 0;
    const scheduledThisWeek = scheduledThisWeekResult.count || 0;
    const totalContractorsInterested = totalContractorsInterestedResult.count || 0;

    console.log('Stats calculated:', {
      totalPending,
      scheduledToday,
      scheduledThisWeek,
      totalContractorsInterested
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalPending,
        scheduledToday,
        scheduledThisWeek,
        totalContractorsInterested
      }
    });

  } catch (error: any) {
    console.error('❌ Inspection stats API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch inspection stats', details: error.message },
      { status: 500 }
    );
  }
}
