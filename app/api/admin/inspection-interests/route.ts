import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/admin/inspection-interests called');
    
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

    // inspection interests 조회
    const { data: inspectionInterests, error: interestsError } = await supabase
      .from('inspection_interests')
      .select(`
        id,
        request_id,
        contractor_id,
        will_participate,
        created_at,
        renovation_request:renovation_requests(
          id,
          property_type,
          category,
          address,
          customer:users!renovation_requests_customer_id_fkey(
            id,
            name
          )
        ),
        contractor:contractors(
          id,
          business_name,
          user:users!contractors_user_id_fkey(
            id,
            name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (interestsError) {
      console.error('❌ Error fetching inspection interests:', interestsError);
      return NextResponse.json(
        { error: 'Failed to fetch inspection interests' },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${inspectionInterests?.length || 0} inspection interests`);

    return NextResponse.json({
      success: true,
      interests: inspectionInterests || []
    });

  } catch (error: any) {
    console.error('❌ Inspection interests API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch inspection interests', details: error.message },
      { status: 500 }
    );
  }
}
