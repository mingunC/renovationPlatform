import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    // 요청 본문 파싱
    const body = await request.json();
    const { request_id, total_amount, description, breakdown, estimated_days } = body;

    // 필수 필드 검증
    if (!request_id || !total_amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // 프로젝트 요청 상태 확인
    const { data: renovationRequest, error: requestError } = await supabase
      .from('renovation_requests')
      .select('status')
      .eq('id', request_id)
      .single();

    if (requestError || !renovationRequest) {
      return NextResponse.json(
        { error: 'Project request not found' },
        { status: 404 }
      );
    }

    if (renovationRequest.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Bidding is not open for this project' },
        { status: 400 }
      );
    }

    // 기존 입찰 확인
    const { data: existingBid, error: existingBidError } = await supabase
      .from('bids')
      .select('id')
      .eq('request_id', request_id)
      .eq('contractor_id', contractor.id)
      .single();

    if (existingBid && !existingBidError) {
      return NextResponse.json(
        { error: 'You have already submitted a bid for this project' },
        { status: 409 }
      );
    }

    // 새 입찰 생성
    const { data: newBid, error: createError } = await supabase
      .from('bids')
      .insert({
        request_id,
        contractor_id: contractor.id,
        total_amount: parseFloat(total_amount),
        description,
        breakdown: breakdown || null,
        estimated_days: estimated_days ? parseInt(estimated_days) : null,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating bid:', createError);
      return NextResponse.json(
        { error: 'Failed to create bid' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bid: newBid
    });

  } catch (error) {
    console.error('Bid creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const request_id = searchParams.get('request_id');
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
          description
        ),
        contractor:contractors(
          id,
          business_name,
          user:users(name)
        )
      `);

    // 필터 적용
    if (request_id) {
      query = query.eq('request_id', request_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // 입찰 조회
    const { data: bids, error: bidsError } = await query
      .order('created_at', { ascending: false });

    if (bidsError) {
      console.error('Error fetching bids:', bidsError);
      return NextResponse.json(
        { error: 'Failed to fetch bids' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bids: bids || []
    });

  } catch (error) {
    console.error('Bids fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Options handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}