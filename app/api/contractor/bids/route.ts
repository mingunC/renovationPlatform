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

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 업체 프로필 확인
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (contractorError || !contractor) {
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      );
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // 기본 쿼리 구성
    let query = supabase
      .from('bids')
      .select(`
        id,
        total_amount,
        description,
        breakdown,
        estimated_days,
        status,
        created_at,
        updated_at,
        request:renovation_requests(
          id,
          category,
          budget_range,
          address,
          description,
          status,
          bidding_end_date,
          customer:users!renovation_requests_customer_id_fkey(
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq('contractor_id', contractor.id);

    // 상태 필터 적용
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 입찰 조회
    const { data: bids, error: bidsError } = await query
      .order('created_at', { ascending: false });

    if (bidsError) {
      console.error('Error fetching contractor bids:', bidsError);
      return NextResponse.json(
        { error: 'Failed to fetch bids' },
        { status: 500 }
      );
    }

    // 각 입찰에 대한 추가 정보 계산
    const bidsWithDetails = await Promise.all(
      (bids || []).map(async (bid) => {
        // 해당 프로젝트의 전체 입찰 수 조회
        const { count: totalBids } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', bid.request.id);

        return {
          ...bid,
          _count: {
            total_bids: totalBids || 0
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      bids: bidsWithDetails
    });

  } catch (error) {
    console.error('Contractor bids fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}