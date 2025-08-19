// /app/api/contractor/dashboard-metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log('🚀 Contractor Dashboard metrics API called');
  
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
    
    // 사용자 타입 확인
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('type')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('⚠️ Error fetching user profile:', userError);
      // 에러가 있어도 계속 진행 (기본값 사용)
    }
    
    // CONTRACTOR 타입이 아니어도 일단 진행 (디버깅용)
    if (userProfile && userProfile.type !== 'CONTRACTOR') {
      console.warn('⚠️ User is not a contractor:', userProfile.type);
      // 경고만 하고 계속 진행
    }
    
    // 업체 프로필 확인
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (contractorError) {
      console.error('⚠️ Contractor profile error:', contractorError);
      // 에러가 있어도 기본값으로 진행
    }
    
    const contractorId = contractor?.id || session.user.id; // fallback to user id
    console.log('📋 Using contractor ID:', contractorId);
    
    // 주간 시작일 계산
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // 월간 시작일 계산
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    console.log('📅 Start of week:', startOfWeek.toISOString());
    
    // 메트릭 초기값
    let newRequestsThisWeek = 0;
    let activeBids = 0;
    let estimatedRevenue = 0;
    let completedJobs = 0;
    
    // 1. 이번 주 새 요청 수 (에러 시 0)
    try {
      const { count: requestsCount, error: requestsError } = await supabase
        .from('renovation_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString())
        .in('status', ['OPEN', 'INSPECTION_PENDING', 'BIDDING_OPEN']);
      
      if (requestsError) {
        console.error('⚠️ Error counting new requests:', requestsError);
        // throw 하지 않고 기본값 사용
      } else {
        newRequestsThisWeek = requestsCount || 0;
      }
    } catch (error) {
      console.error('⚠️ Exception counting requests:', error);
      // 기본값 유지
    }
    
    console.log('✅ New requests this week:', newRequestsThisWeek);
    
    // 2. 활성 입찰 수 (에러 시 0)
    if (contractor?.id) {
      try {
        const { count: bidsCount, error: bidsError } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('contractor_id', contractor.id)
          .eq('status', 'PENDING');
        
        if (bidsError) {
          console.error('⚠️ Error counting active bids:', bidsError);
        } else {
          activeBids = bidsCount || 0;
        }
      } catch (error) {
        console.error('⚠️ Exception counting bids:', error);
      }
    }
    
    console.log('✅ Active bids:', activeBids);
    
    // 3. 예상 수익 계산 (에러 시 0)
    if (contractor?.id) {
      try {
        const { data: bidsData, error: bidsDataError } = await supabase
          .from('bids')
          .select('amount, status')
          .eq('contractor_id', contractor.id)
          .in('status', ['PENDING', 'ACCEPTED']);
        
        if (bidsDataError) {
          console.error('⚠️ Error fetching bids data:', bidsDataError);
        } else if (bidsData && bidsData.length > 0) {
          estimatedRevenue = bidsData.reduce((sum, bid) => {
            const probability = bid.status === 'ACCEPTED' ? 1.0 : 0.3;
            return sum + (bid.amount * probability);
          }, 0);
        }
      } catch (error) {
        console.error('⚠️ Exception calculating revenue:', error);
      }
    }
    
    console.log('✅ Estimated revenue:', estimatedRevenue);
    
    // 4. 완료된 작업 수 (에러 시 0)
    if (contractor?.id) {
      try {
        const { count: completedCount, error: completedError } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('contractor_id', contractor.id)
          .eq('status', 'COMPLETED')
          .gte('updated_at', startOfMonth.toISOString());
        
        if (completedError) {
          console.error('⚠️ Error counting completed jobs:', completedError);
        } else {
          completedJobs = completedCount || 0;
        }
      } catch (error) {
        console.error('⚠️ Exception counting completed:', error);
      }
    }
    
    console.log('✅ Completed jobs this month:', completedJobs);
    
    // 결과 반환 (클라이언트가 기대하는 형식에 맞춤)
    const metrics = {
      data: {
        newRequestsThisWeek: newRequestsThisWeek,
        activeBids: activeBids,
        estimatedRevenue: Math.round(estimatedRevenue)
      },
      // 추가 메트릭 (선택적)
      completedJobs: completedJobs,
      weeklyGrowth: 15.3, // 임시 고정값
      conversionRate: activeBids > 0 ? Math.round((completedJobs / activeBids) * 100) : 0
    };
    
    console.log('📊 Final metrics:', metrics);
    
    return NextResponse.json(metrics);
    
  } catch (error: any) {
    console.error('💥 Dashboard API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    // 에러가 있어도 기본값 반환
    return NextResponse.json({
      data: {
        newRequestsThisWeek: 0,
        activeBids: 0,
        estimatedRevenue: 0
      },
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
}