import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/auth/check-admin-session called ===');
    
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

    // 사용자 정보 가져오기
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      console.log('Failed to get user data');
      return NextResponse.json(
        { error: 'Failed to get user data' },
        { status: 500 }
      );
    }

    const responseData = {
      success: true,
      user: {
        id: user.user.id,
        email: user.user.email,
        name: user.user.user_metadata?.name || user.user.email,
        type: 'ADMIN'
      }
    };

    console.log('Returning success response:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Check admin session error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin session' },
      { status: 500 }
    );
  }
}
