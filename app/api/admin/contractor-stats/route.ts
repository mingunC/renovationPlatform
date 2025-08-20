import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/admin/contractor-stats called');
    
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
      console.error('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 사용자 역할 확인 (users 테이블에서 type 필드 사용)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('type')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile || userProfile.type !== 'ADMIN') {
      console.error('❌ User not admin:', { userId: session.user.id, type: userProfile?.type });
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Admin user authenticated');

    // 업체 통계 조회
    const [
      totalContractorsResult,
      verifiedContractorsResult,
      activeContractorsResult,
      totalParticipationsResult
    ] = await Promise.all([
      supabase
        .from('contractors')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('contractors')
        .select('*', { count: 'exact', head: true })
        .eq('insurance_verified', true)
        .eq('wsib_verified', true),
      supabase
        .from('contractors')
        .select('*', { count: 'exact', head: true })
        .eq('profile_completed', true),
      supabase
        .from('inspection_interests')
        .select('*', { count: 'exact', head: true })
        .eq('will_participate', true)
    ]);

    // 결과 추출
    const totalContractors = totalContractorsResult.count || 0;
    const verifiedContractors = verifiedContractorsResult.count || 0;
    const activeContractors = activeContractorsResult.count || 0;
    const totalParticipations = totalParticipationsResult.count || 0;

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

    console.log('✅ Contractor stats calculated:', stats);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('❌ Contractor stats API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch contractor stats', details: error.message },
      { status: 500 }
    );
  }
}
