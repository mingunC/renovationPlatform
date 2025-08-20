import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createSupabaseClient } from '@/utils/supabase/api';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Contractor API 호출 시작 ===')
    
    // 🔍 디버깅 정보 출력
    console.log('🔍 Environment Variables:')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length)
    console.log('SUPABASE_SERVICE_ROLE_KEY preview:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...')
    
    // Supabase 클라이언트 생성
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch (error: any) {
      console.error('❌ Cookie initialization error:', error);
      return NextResponse.json(
        { error: 'Cookie initialization failed' },
        { status: 500 }
      );
    }
    
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

    const requestBody = await request.json()
    console.log('Request body:', requestBody)
    
    const {
      email,
      name,
      phone,
      business_name,
      business_number,
      business_license_number,
      service_areas,
      categories,
      notes
    } = requestBody

    console.log('Extracted data:', { email, name, phone, service_areas, categories })

    // 필수 필드 검증
    if (!email || !name || !phone) {
      return NextResponse.json(
        { error: 'Email, name, and phone are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(service_areas) || service_areas.length === 0) {
      return NextResponse.json(
        { error: 'At least one service area is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category is required' },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await supabase.from('users').select('*').eq('email', email).single();

    if (existingUser.data) {
      return NextResponse.json(
        { 
          error: `이미 등록된 이메일입니다: ${email}`,
          details: '이 이메일로 가입한 사용자가 이미 존재합니다. 다른 이메일을 사용하거나 기존 사용자 정보를 확인해주세요.',
          existingUserType: existingUser.data.type
        },
        { status: 409 }
      )
    }

    // 비밀번호 설정 (요청에서 받거나 기본값 사용)
    const tempPassword = requestBody.password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    
    console.log('Creating Supabase user with password:', tempPassword)
    
    // 🔍 직접 Supabase Admin 클라이언트 생성
    console.log('🔍 Creating Supabase Admin Client directly...')
    let supabaseAdmin
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      
      if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
      }
      
      console.log('🔍 Supabase URL:', supabaseUrl)
      console.log('🔍 Service Role Key exists:', !!serviceRoleKey)
      console.log('🔍 Service Role Key length:', serviceRoleKey.length)
      console.log('🔍 Service Role Key preview:', serviceRoleKey.substring(0, 20) + '...')
      
      supabaseAdmin = createServerClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      console.log('✅ Supabase Admin Client created successfully')
      console.log('🔍 Client auth object exists:', !!supabaseAdmin.auth)
      console.log('🔍 Client auth.admin object exists:', !!supabaseAdmin.auth.admin)
    } catch (error) {
      console.error('❌ Error creating Supabase Admin Client:', error)
      return NextResponse.json(
        { error: 'Failed to create Supabase client' },
        { status: 500 }
      )
    }
    
    console.log('🔍 Attempting to create user with Supabase Admin API...')
    const { data: supabaseUser, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // 이메일 확인 자동 완료
      user_metadata: {
        name,
        phone,
        user_type: 'CONTRACTOR'
      }
    })

    if (supabaseError) {
      console.error('Supabase user creation error:', supabaseError)
      return NextResponse.json(
        { error: 'Failed to create user account in Supabase' },
        { status: 500 }
      )
    }

    console.log('Supabase user created:', { id: supabaseUser.user.id, email: supabaseUser.user.email })
    
    // Prisma에 사용자 생성 (Supabase ID 사용)
    const newUser = await supabase.from('users').insert({
      id: supabaseUser.user.id, // Supabase에서 생성된 ID 사용
      email,
      name,
      phone,
      type: 'CONTRACTOR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).select().single();
    
    console.log('User created successfully:', { id: newUser.data.id, email: newUser.data.email })

    console.log('Creating contractor profile with data:', { 
      user_id: newUser.data.id, 
      business_name, 
      service_areas, 
      categories 
    })
    
    // 업체 프로필 생성
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .insert({
        user_id: newUser.data.id,
        business_name: business_name || null,
        business_number: business_number || null,
        phone,
        business_license_number: business_license_number || null,
        service_areas,
        categories,
        profile_completed: true,
        completion_percentage: 100,
        onboarding_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (contractorError) {
      console.error('Error creating contractor profile:', contractorError);
      throw contractorError;
    }
    
    console.log('Contractor profile created successfully:', { id: contractor.id, business_name: contractor.business_name })

    // 임시 비밀번호를 관리자에게 전달 (실제로는 이메일로 전송)
    console.log(`Temporary password for ${email}: ${tempPassword}`)

    return NextResponse.json({
      success: true,
      message: 'Contractor added successfully',
      user: {
        id: newUser.data.id,
        email: newUser.data.email,
        name: newUser.data.name,
        type: newUser.data.type
      },
      contractor: {
        id: contractor.id,
        business_name: contractor.business_name,
        service_areas: contractor.service_areas,
        categories: contractor.categories
      },
      tempPassword // 실제 운영에서는 제거하고 이메일로 전송
    })

  } catch (error) {
    console.error('Add contractor error:', error)
    
    // 더 자세한 에러 정보 제공
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: '업체 추가 중 오류가 발생했습니다. 입력 정보를 확인하고 다시 시도해주세요.'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const supabase = await createSupabaseClient();
    
    // 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log('No Supabase session found');
      return NextResponse.json(
        { error: 'No session found' },
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
      console.log('User not admin:', { userId: session.user.id, type: userProfile?.type });
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 모든 업체 목록 조회
    const { data: contractors, error: contractorsError } = await supabase
      .from('contractors')
      .select(`
        id,
        business_name,
        business_number,
        phone,
        service_areas,
        categories,
        rating,
        review_count,
        profile_completed,
        completion_percentage,
        insurance_verified,
        wsib_verified,
        created_at,
        onboarding_completed_at,
        user:users!contractors_user_id_fkey(
          id,
          email,
          name,
          type,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (contractorsError) {
      console.error('❌ Error fetching contractors:', contractorsError);
      return NextResponse.json(
        { error: 'Failed to fetch contractors' },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${contractors?.length || 0} contractors`);

    return NextResponse.json({
      success: true,
      contractors: contractors || []
    })

  } catch (error) {
    console.error('Get contractors error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
