// app/api/contractor/inspection-interest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient, getAuthenticatedUser, createAuthErrorResponse, createNotFoundResponse } from '@/utils/supabase/api';

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/contractor/inspection-interest called');
  
  try {
    // Supabase 클라이언트 생성
    const supabase = await createSupabaseClient();
    console.log('✅ Supabase client created');

    // 사용자 인증 확인
    const user = await getAuthenticatedUser(supabase);
    if (!user) {
      console.error('❌ Authentication failed');
      return createAuthErrorResponse();
    }

    console.log('✅ User authenticated:', user.id);

    // 업체 프로필 확인
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (contractorError || !contractor) {
      console.error('❌ Contractor profile error:', contractorError);
      return createNotFoundResponse('Contractor profile not found');
    }

    console.log('✅ Contractor profile found:', contractor.id);

    // 요청 본문 파싱
    const body = await request.json();
    const { request_id, will_participate, notes } = body;

    console.log('📝 Request body:', { request_id, will_participate, notes });

    // 필수 필드 검증
    if (!request_id || typeof will_participate !== 'boolean') {
      console.error('❌ Missing required fields');
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
      console.error('❌ Project request error:', requestError);
      return createNotFoundResponse('Project request not found');
    }

    console.log('✅ Project request found, status:', renovationRequest.status);

    // 현장방문 참여 가능한 상태인지 확인
    const allowedStatuses = ['OPEN', 'INSPECTION_PENDING'];
    if (!allowedStatuses.includes(renovationRequest.status)) {
      console.error('❌ Invalid project status for inspection:', renovationRequest.status);
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

    console.log('🔍 Existing interest check:', { existingInterest, existingError });

    let result;
    if (existingInterest && !existingError) {
      console.log('📝 Updating existing interest');
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
        console.error('❌ Error updating inspection interest:', updateError);
        return NextResponse.json(
          { error: 'Failed to update inspection interest' },
          { status: 500 }
        );
      }
      result = updatedInterest;
      console.log('✅ Interest updated successfully');
    } else {
      console.log('🆕 Creating new interest');
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
        console.error('❌ Error creating inspection interest:', createError);
        return NextResponse.json(
          { error: 'Failed to create inspection interest' },
          { status: 500 }
        );
      }
      result = newInterest;
      console.log('✅ Interest created successfully');
    }

    console.log('🎉 Operation completed successfully');
    return NextResponse.json({
      success: true,
      message: will_participate ? '참여가 확정되었습니다.' : '참여가 취소되었습니다.',
      inspection_interest: result
    });

  } catch (error: any) {
    console.error('💥 Inspection interest error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/contractor/inspection-interest called');
  
  try {
    // Supabase 클라이언트 생성
    const supabase = await createSupabaseClient();
    console.log('✅ Supabase client created');

    // 사용자 인증 확인
    let user: any = null;
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Auth result:', { user: authUser?.id, error: authError?.message });
    
    if (authError || !authUser) {
      console.error('❌ Authentication error:', authError);
      console.log('🔍 Trying to get session instead...');
      
      // 세션으로 재시도
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Session result:', { session: session?.user?.id, error: sessionError?.message });
      
      if (sessionError || !session?.user) {
        console.error('❌ Session also failed:', sessionError);
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      console.log('✅ User authenticated via session:', session.user.id);
      user = session.user;
    } else {
      user = authUser;
    }

    console.log('✅ User authenticated:', user.id);

    // 업체 프로필 확인
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (contractorError || !contractor) {
      console.error('❌ Contractor profile error:', contractorError);
      return createNotFoundResponse('Contractor profile not found');
    }

    console.log('✅ Contractor profile found:', contractor.id);

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const request_id = searchParams.get('request_id');

    // 기본 쿼리 구성
    let query = supabase
      .from('inspection_interests')
      .select(`
        id,
        will_participate,
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
      console.error('❌ Error fetching inspection interests:', interestsError);
      console.error('❌ Error details:', {
        message: interestsError.message,
        code: interestsError.code,
        details: interestsError.details,
        hint: interestsError.hint
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch inspection interests',
          details: interestsError.message,
          code: interestsError.code
        },
        { status: 500 }
      );
    }

    console.log('✅ Successfully fetched inspection interests:', interests?.length || 0);

    return NextResponse.json({
      success: true,
      data: interests || []
    });

  } catch (error: any) {
    console.error('💥 Inspection interests fetch error:', error);
    console.error('💥 Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}