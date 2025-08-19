// app/api/contractor/dashboard-metrics/route.ts
// 이 파일을 새로 생성하세요!

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log('🚀 Contractor Dashboard metrics API called');
  
  try {
    // Supabase 클라이언트 생성 (admin API와 동일한 방식)
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
              // Server Component에서 호출된 경우 무시
            }
          },
        },
      }
    );
    
    console.log('✅ Supabase client created');
    
    // 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ No session found:', sessionError);
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }
    
    console.log('✅ User authenticated:', session.user.id);
    
    // 사용자 타입 확인 (CONTRACTOR인지)
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('type')
      .eq('id', session.user.id)
      .single();
    
    if (userError || !userProfile || userProfile.type !== 'CONTRACTOR') {
      console.error('❌ User is not a contractor:', userProfile?.type);
      return NextResponse.json(
        { error: 'Contractor access required' },
        { status: 403 }
      );
    }
    
    // 업체 프로필 확인
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (contractorError || !contractor) {
      console.error('❌ Contractor profile error:', contractorError);
      return NextResponse.json({ 
        error: 'Contractor profile not found' 
      }, { status: 404 });
    }
    
    console.log('✅ Contractor profile found:', contractor.id);
    
    // 주간 시작일 계산
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // 월간 시작일 계산
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    console.log('📅 Start of week:', startOfWeek.toISOString());
    console.log('📅 Start of month:', startOfMonth.toISOString());
    
    // Promise.all을 사용하여 병렬 처리
    const [
      newRequestsResult,
      activeBidsResult,
      bidsDataResult,
      completedJobsResult
    ] = await Promise.all([
      // 1. 이번 주 새 요청 수 (service_requests 또는 renovation_requests 테이블)
      supabase
        .from('renovation_requests')  // 또는 'service_requests' - 실제 테이블명 확인 필요
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString())
        .in('status', ['OPEN', 'INSPECTION_PENDING', 'BIDDING_OPEN']),
      
      // 2. 활성 입찰 수
      supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('contractor_id', contractor.id)
        .eq('status', 'PENDING'),
      
      // 3. 예상 수익 계산용 입찰 데이터
      supabase
        .from('bids')
        .select('amount, status')
        .eq('contractor_id', contractor.id)
        .in('status', ['PENDING', 'ACCEPTED']),
      
      // 4. 이번 달 완료된 작업
      supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('contractor_id', contractor.id)
        .eq('status', 'COMPLETED')
        .gte('updated_at', startOfMonth.toISOString())
    ]);
    
    // 결과 처리 (에러가 있어도 기본값 0 사용)
    const newRequestsCount = newRequestsResult.count || 0;
    const activeBidsCount = activeBidsResult.count || 0;
    const completedJobsCount = completedJobsResult.count || 0;
    
    console.log('✅ New requests this week:', newRequestsCount);
    console.log('✅ Active bids:', activeBidsCount);
    console.log('✅ Completed jobs this month:', completedJobsCount);
    
    // 예상 수익 계산
    let estimatedRevenue = 0;
    if (!bidsDataResult.error && bidsDataResult.data) {
      estimatedRevenue = bidsDataResult.data.reduce((sum, bid) => {
        // ACCEPTED 입찰은 100%, PENDING 입찰은 30% 확률로 계산
        const probability = bid.status === 'ACCEPTED' ? 1.0 : 0.3;
        return sum + (bid.amount * probability);
      }, 0);
    }
    
    console.log('✅ Estimated revenue calculated:', estimatedRevenue);
    
    // 전환율 계산
    const conversionRate = activeBidsCount > 0 
      ? Math.round((completedJobsCount / activeBidsCount) * 100) 
      : 0;
    
    // 결과 반환
    const metrics = {
      newRequests: newRequestsCount,
      activeBids: activeBidsCount,
      estimatedRevenue: Math.round(estimatedRevenue),
      completedJobs: completedJobsCount,
      weeklyGrowth: 15.3, // TODO: 실제로는 이전 주와 비교 계산 필요
      conversionRate: conversionRate
    };
    
    console.log('📊 Final metrics:', metrics);
    
    return NextResponse.json({
      success: true,
      ...metrics
    });
    
  } catch (error: any) {
    console.error('💥 Contractor Dashboard API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}