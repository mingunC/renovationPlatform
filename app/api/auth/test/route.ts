// app/api/auth/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log('🧪 GET /api/auth/test called');
  
  try {
    console.log('📝 Environment check:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    
    // Supabase 클라이언트 생성
    const cookieStore = await cookies();
    console.log('🍪 Cookie store created');
    
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
              // Server Component에서 호출된 경우 무시
            }
          },
        },
      }
    );
    
    console.log('✅ Supabase client created successfully');
    
    // 간단한 쿼리 테스트
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Supabase query failed',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('✅ Supabase query successful');
    
    return NextResponse.json({
      success: true,
      message: 'API test successful',
      supabase_connected: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Test API error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: 'Test API failed',
      errorType: error.constructor.name,
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('🧪 POST /api/auth/test called');
  
  try {
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'POST test successful',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ POST test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'POST test failed',
      details: error.message
    }, { status: 500 });
  }
}
