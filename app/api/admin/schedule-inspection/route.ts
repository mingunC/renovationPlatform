import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET: 현장방문 일정 확정이 필요한 요청들 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/admin/schedule-inspection called');
    
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

    // 쿼리 파라미터에서 status 확인
    const { searchParams } = new URL(request.url);
    const requestedStatus = searchParams.get('status');
    
    console.log('📝 Requested status filter:', requestedStatus);

    // 기본 쿼리 구성
    let query = supabase
      .from('renovation_requests')
      .select(`
        id,
        status,
        category,
        budget_range,
        address,
        description,
        created_at,
        inspection_date,
        inspection_time,
        customer:users!renovation_requests_customer_id_fkey(
          id,
          name,
          email
        ),
        inspection_interests(
          id,
          will_participate,
          contractor:contractors(
            id,
            business_name
          )
        )
      `);

    // status 필터 적용
    if (requestedStatus && requestedStatus !== 'all') {
      query = query.eq('status', requestedStatus);
    } else {
      // 기본값: INSPECTION_PENDING, INSPECTION_SCHEDULED, OPEN 상태
      query = query.in('status', ['INSPECTION_PENDING', 'INSPECTION_SCHEDULED', 'OPEN']);
    }

    // 프로젝트 요청 조회
    const { data: pendingRequests, error: requestsError } = await query
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('❌ Error fetching requests:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${pendingRequests?.length || 0} requests`);

    // 응답 데이터 구조 변환
    const formattedRequests = pendingRequests?.map(request => ({
      id: request.id,
      status: request.status,
      category: request.category,
      budget_range: request.budget_range,
      address: request.address,
      description: request.description,
      created_at: request.created_at,
      inspection_date: request.inspection_date,
      inspection_time: request.inspection_time,
      customer: request.customer,
      inspection_interests: request.inspection_interests || [],
      _count: {
        inspection_interests: request.inspection_interests?.length || 0
      }
    })) || [];

    return NextResponse.json({
      success: true,
      requests: formattedRequests
    });

  } catch (error: any) {
    console.error('❌ Schedule inspection API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch inspection requests', details: error.message },
      { status: 500 }
    );
  }
}

// POST: 현장방문 일정 확정
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
    
    // 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
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
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { request_id, inspection_date, inspection_time, notes, notify_contractors } = body;

    if (!request_id || !inspection_date) {
      return NextResponse.json(
        { error: 'Request ID and inspection date are required' },
        { status: 400 }
      );
    }

    // 요청 상태를 INSPECTION_SCHEDULED로 변경
    const updatedRequest = await supabase
      .from('renovation_requests')
      .update({
        where: { id: request_id },
        data: {
          status: 'INSPECTION_SCHEDULED',
          inspection_date: new Date(inspection_date),
          inspection_time: inspection_time || null,
          inspection_notes: notes || null,
          updated_at: new Date()
        }
      })
      .select()
      .single();

    if (updatedRequest.error) {
      console.error('❌ Error updating request:', updatedRequest.error);
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      );
    }

    const updatedRequestData = updatedRequest.data;

    // TODO: 참여 업체들에게 알림 발송 (이메일, SMS 등)
    if (notify_contractors) {
      console.log(`📧 Notifying ${updatedRequestData.inspection_interests?.length || 0} contractors about scheduled inspection`);
      // 실제 알림 발송 로직 구현 필요
    }

    return NextResponse.json({
      success: true,
      message: '현장방문 일정이 성공적으로 확정되었습니다.',
      data: {
        id: updatedRequestData.id,
        status: updatedRequestData.status,
        inspection_date: updatedRequestData.inspection_date,
        customer_name: updatedRequestData.customer?.name,
        participant_count: updatedRequestData.inspection_interests?.length || 0
      }
    });

  } catch (error: any) {
    console.error('❌ Schedule inspection API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return NextResponse.json(
      { error: 'Failed to schedule inspection', details: error.message },
      { status: 500 }
    );
  }
}
