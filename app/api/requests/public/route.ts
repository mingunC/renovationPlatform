// app/api/requests/public/route.ts
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

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 기본 쿼리 구성 - OPEN과 INSPECTION_PENDING 상태만
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
          email
        ),
        inspection_interests(
          contractor_id,
          will_participate
        )
      `)
      .in('status', ['OPEN', 'INSPECTION_PENDING']);

    // 카테고리 필터 적용
    if (category) {
      query = query.eq('category', category);
    }

    // 프로젝트 요청 조회
    const { data: requests, error: requestsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (requestsError) {
      console.error('Error fetching public requests:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    // 전체 개수 조회 (OPEN과 INSPECTION_PENDING 상태만)
    const { count: totalCount, error: countError } = await supabase
      .from('renovation_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['OPEN', 'INSPECTION_PENDING']);

    if (countError) {
      console.error('Error counting requests:', countError);
      return NextResponse.json(
        { error: 'Failed to count requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: requests || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount || 0)
      }
    });

  } catch (error) {
    console.error('Public requests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
