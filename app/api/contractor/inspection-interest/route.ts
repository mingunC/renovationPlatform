// app/api/contractor/inspection-interest/route.ts
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

    // 요청 본문 파싱
    const body = await request.json();
    const { request_id, will_participate, notes } = body;

    // 필수 필드 검증
    if (!request_id || typeof will_participate !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // 현장방문 참여 가능한 상태인지 확인
    const allowedStatuses = ['OPEN', 'INSPECTION_PENDING'];
    if (!allowedStatuses.includes(renovationRequest.status)) {
      return NextResponse.json(
        { error: 'Cannot participate in inspection for this project status' },
        { status: 400 }
      );
    }

    // 기존 참여 상태 확인
    const { data: existingInterest, error: existingError } = await supabase
      .from('inspection_interests')
      .select('id')
      .eq('request_id', request_id)
      .eq('contractor_id', contractor.id)
      .single();

    let result;
    if (existingInterest && !existingError) {
      // 기존 참여 상태 업데이트
      const { data: updatedInterest, error: updateError } = await supabase
        .from('inspection_interests')
        .update({
          will_participate,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingInterest.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating inspection interest:', updateError);
        return NextResponse.json(
          { error: 'Failed to update inspection interest' },
          { status: 500 }
        );
      }
      result = updatedInterest;
    } else {
      // 새 참여 상태 생성
      const { data: newInterest, error: createError } = await supabase
        .from('inspection_interests')
        .insert({
          request_id,
          contractor_id: contractor.id,
          will_participate,
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating inspection interest:', createError);
        return NextResponse.json(
          { error: 'Failed to create inspection interest' },
          { status: 500 }
        );
      }
      result = newInterest;
    }

    return NextResponse.json({
      success: true,
      inspection_interest: result
    });

  } catch (error) {
    console.error('Inspection interest error:', error);
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
    const request_id = searchParams.get('request_id');

    // 기본 쿼리 구성
    let query = supabase
      .from('inspection_interests')
      .select(`
        id,
        will_participate,
        notes,
        created_at,
        updated_at,
        request:renovation_requests(
          id,
          category,
          budget_range,
          address,
          description,
          status
        )
      `)
      .eq('contractor_id', contractor.id);

    // 특정 요청에 대한 참여 상태만 조회
    if (request_id) {
      query = query.eq('request_id', request_id);
    }

    // 참여 상태 조회
    const { data: interests, error: interestsError } = await query
      .order('created_at', { ascending: false });

    if (interestsError) {
      console.error('Error fetching inspection interests:', interestsError);
      return NextResponse.json(
        { error: 'Failed to fetch inspection interests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inspection_interests: interests || []
    });

  } catch (error) {
    console.error('Inspection interests fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}