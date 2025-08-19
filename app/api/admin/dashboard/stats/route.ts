import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
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

    // 통계 데이터 수집 (Supabase 사용)
    const [
      totalProjectsResult,
      openProjectsResult,
      inspectionPendingResult,
      inspectionScheduledResult,
      biddingOpenResult,
      completedProjectsResult,
      totalContractorsResult,
      verifiedContractorsResult,
      totalCustomersResult
    ] = await Promise.all([
      // 전체 프로젝트 수
      supabase.from('renovation_requests').select('*', { count: 'exact', head: true }),
      
      // OPEN 상태 프로젝트 수
      supabase.from('renovation_requests').select('*', { count: 'exact', head: true }).eq('status', 'OPEN'),
      
      // INSPECTION_PENDING 상태 프로젝트 수
      supabase.from('renovation_requests').select('*', { count: 'exact', head: true }).eq('status', 'INSPECTION_PENDING'),
      
      // INSPECTION_SCHEDULED 상태 프로젝트 수
      supabase.from('renovation_requests').select('*', { count: 'exact', head: true }).eq('status', 'INSPECTION_SCHEDULED'),
      
      // BIDDING_OPEN 상태 프로젝트 수
      supabase.from('renovation_requests').select('*', { count: 'exact', head: true }).eq('status', 'BIDDING_OPEN'),
      
      // 완료된 프로젝트 수
      supabase.from('renovation_requests').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
      
      // 전체 업체 수
      supabase.from('contractors').select('*', { count: 'exact', head: true }),
      
      // 인증 완료된 업체 수
      supabase.from('contractors').select('*', { count: 'exact', head: true })
        .eq('insurance_verified', true)
        .eq('wsib_verified', true)
        .eq('profile_completed', true),
      
      // 전체 고객 수
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('type', 'CUSTOMER')
    ]);

    // 에러 체크 및 카운트 추출
    const totalProjects = totalProjectsResult.count || 0;
    const openProjects = openProjectsResult.count || 0;
    const inspectionPending = inspectionPendingResult.count || 0;
    const inspectionScheduled = inspectionScheduledResult.count || 0;
    const biddingOpen = biddingOpenResult.count || 0;
    const completedProjects = completedProjectsResult.count || 0;
    const totalContractors = totalContractorsResult.count || 0;
    const verifiedContractors = verifiedContractorsResult.count || 0;
    const totalCustomers = totalCustomersResult.count || 0;

    // 수익 계산 (간단한 예시 - 실제로는 더 복잡한 로직 필요)
    const totalRevenue = 0; // TODO: 실제 수익 계산 로직 구현

    const stats = {
      totalProjects,
      openProjects,
      inspectionPending,
      inspectionScheduled,
      biddingOpen,
      completedProjects,
      totalContractors,
      verifiedContractors,
      totalCustomers,
      totalRevenue
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
