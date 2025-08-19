import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/admin/requests called ===');
    
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

    console.log('Admin user authenticated successfully');

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 필터 조건 구성
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
        customer:users!renovation_requests_customer_id_fkey(
          id,
          name,
          email,
          phone
        )
      `);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (category) {
      query = query.eq('category', category);
    }

    // 프로젝트 요청 조회
    const { data: requests, error: requestsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (requestsError) {
      console.error('Error fetching requests:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    // 전체 개수 조회
    const { count: totalCount, error: countError } = await supabase
      .from('renovation_requests')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting requests:', countError);
      return NextResponse.json(
        { error: 'Failed to count requests' },
        { status: 500 }
      );
    }

    console.log(`Returning ${requests?.length || 0} projects out of ${totalCount || 0} total`);

    return NextResponse.json({
      success: true,
      requests: requests || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount || 0)
      }
    });

  } catch (error) {
    console.error('Admin requests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
