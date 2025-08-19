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

    // 최근 프로젝트 조회 (Supabase 사용)
    const { data: recentProjects, error: projectsError } = await supabase
      .from('renovation_requests')
      .select(`
        id,
        category,
        budget_range,
        status,
        created_at,
        inspection_date,
        bidding_start_date,
        bidding_end_date,
        customer:users!renovation_requests_customer_id_fkey(
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (projectsError) {
      console.error('Error fetching recent projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch recent projects' },
        { status: 500 }
      );
    }

    // 응답 데이터 포맷팅
    const formattedProjects = (recentProjects || []).map(project => ({
      id: project.id,
      category: project.category,
      budget_range: project.budget_range,
      status: project.status,
      created_at: project.created_at,
      customer_name: project.customer?.name || 'Unknown',
      inspection_date: project.inspection_date,
      bidding_start_date: project.bidding_start_date,
      bidding_end_date: project.bidding_end_date
    }));

    return NextResponse.json({
      success: true,
      projects: formattedProjects
    });

  } catch (error) {
    console.error('Error fetching recent projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent projects' },
      { status: 500 }
    );
  }
}
