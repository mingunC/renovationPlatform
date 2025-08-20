import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Dashboard metrics API called');
    
    // Supabase 클라이언트 생성
    const supabase = await createClient();

    console.log('✅ Supabase client created');

    // 사용자 인증
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // 업체 프로필 조회
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (contractorError || !contractor) {
      console.error('❌ Contractor profile error:', contractorError);
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      );
    }

    console.log('✅ Contractor profile found:', contractor.id);

    // 1. 이번 주 새로운 요청 수 (OPEN, INSPECTION_PENDING 상태)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // 이번 주 일요일
    startOfWeek.setHours(0, 0, 0, 0);

    console.log('📅 Start of week:', startOfWeek.toISOString());

    const { count: newRequestsThisWeek, error: requestsError } = await supabase
      .from('renovation_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['OPEN', 'INSPECTION_PENDING'])
      .gte('created_at', startOfWeek.toISOString());

    if (requestsError) {
      console.error('❌ Error counting new requests:', requestsError);
      throw new Error(`Failed to count new requests: ${requestsError.message}`);
    }

    console.log('✅ New requests this week:', newRequestsThisWeek);

    // 2. 현재 업체의 활성 입찰 수 (PENDING 상태)
    const { count: activeBids, error: bidsError } = await supabase
      .from('bids')
      .select('*', { count: 'exact', head: true })
      .eq('contractor_id', contractor.id)
      .eq('status', 'PENDING');

    if (bidsError) {
      console.error('❌ Error counting active bids:', bidsError);
      throw new Error(`Failed to count active bids: ${bidsError.message}`);
    }

    console.log('✅ Active bids:', activeBids);

    // 3. 예상 수익 (현재 업체의 모든 입찰 합계)
    const { data: bids, error: bidsDataError } = await supabase
      .from('bids')
      .select('total_amount')
      .eq('contractor_id', contractor.id)
      .eq('status', 'PENDING');

    if (bidsDataError) {
      console.error('❌ Error fetching bids data:', bidsDataError);
      throw new Error(`Failed to fetch bids data: ${bidsDataError.message}`);
    }

    const estimatedRevenue = (bids || []).reduce((sum, bid) => {
      return sum + Number(bid.total_amount || 0);
    }, 0);

    console.log('✅ Estimated revenue:', estimatedRevenue);

    const result = {
      success: true,
      data: {
        newRequestsThisWeek: newRequestsThisWeek || 0,
        activeBids: activeBids || 0,
        estimatedRevenue,
      }
    };

    console.log('🎉 Dashboard metrics result:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 Dashboard API Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: error?.constructor?.name || 'Unknown type'
    });
    
    return NextResponse.json(
      { 
        error: 'Server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }, 
      { status: 500 }
    );
  }
}
