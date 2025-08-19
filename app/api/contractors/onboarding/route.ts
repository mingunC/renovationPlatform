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
    const {
      business_name,
      phone,
      business_number,
      business_license_number,
      service_areas,
      categories,
      years_experience,
      description,
      profile_image_url
    } = body;

    // 필수 필드 검증
    if (!business_name || !phone || !service_areas || !categories) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 기존 업체 프로필 확인
    const { data: existingContractor, error: existingError } = await supabase
      .from('contractors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingContractor && !existingError) {
      return NextResponse.json(
        { error: 'Contractor profile already exists' },
        { status: 409 }
      );
    }

    // 새 업체 프로필 생성
    const { data: newContractor, error: createError } = await supabase
      .from('contractors')
      .insert({
        user_id: user.id,
        business_name,
        phone,
        business_number: business_number || null,
        business_license_number: business_license_number || null,
        service_areas,
        categories,
        years_experience: years_experience || 0,
        description: description || null,
        profile_image_url: profile_image_url || null,
        profile_completed: true,
        completion_percentage: 100,
        verified: false,
        onboarding_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating contractor profile:', createError);
      return NextResponse.json(
        { error: 'Failed to create contractor profile' },
        { status: 500 }
      );
    }

    // 사용자 타입을 CONTRACTOR로 업데이트
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ type: 'CONTRACTOR' })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error('Error updating user type:', userUpdateError);
      // 사용자 타입 업데이트 실패는 치명적이지 않음
    }

    return NextResponse.json({
      success: true,
      contractor: newContractor
    });

  } catch (error) {
    console.error('Contractor onboarding error:', error);
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

    // 업체 프로필 조회
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (contractorError && contractorError.code !== 'PGRST116') {
      console.error('Error fetching contractor profile:', contractorError);
      return NextResponse.json(
        { error: 'Failed to fetch contractor profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contractor: contractor || null,
      exists: !!contractor
    });

  } catch (error) {
    console.error('Contractor profile fetch error:', error);
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
