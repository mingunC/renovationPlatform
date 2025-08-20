// app/api/contractor/test-inspection/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  console.log('🧪 Test inspection API called');
  
  try {
    // 직접 Supabase 클라이언트 생성 (서비스 롤 키 사용)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('✅ Supabase client created with service role');

    // 1. inspection_interests 테이블 확인
    const { data: interests, error: interestsError } = await supabase
      .from('inspection_interests')
      .select('*')
      .limit(5);

    if (interestsError) {
      console.error('❌ Error fetching interests:', interestsError);
      return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
    }

    console.log('✅ Interests fetched:', interests?.length || 0);

    // 2. renovation_requests 테이블 확인
    const { data: requests, error: requestsError } = await supabase
      .from('renovation_requests')
      .select('id, status, category, address')
      .limit(5);

    if (requestsError) {
      console.error('❌ Error fetching requests:', requestsError);
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }

    console.log('✅ Requests fetched:', requests?.length || 0);

    // 3. cont1@gmail.com 사용자 확인
    const { data: cont1User, error: userError } = await supabase
      .from('users')
      .select('id, email, name, type')
      .eq('email', 'cont1@gmail.com')
      .single();

    if (userError) {
      console.error('❌ Error fetching cont1 user:', userError);
      return NextResponse.json({ error: 'Failed to fetch cont1 user' }, { status: 500 });
    }

    console.log('✅ cont1 user found:', cont1User);

    // 4. cont1 contractor 확인
    const { data: cont1Contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('id, business_name')
      .eq('user_id', cont1User.id)
      .single();

    if (contractorError) {
      console.error('❌ Error fetching cont1 contractor:', contractorError);
      return NextResponse.json({ error: 'Failed to fetch cont1 contractor' }, { status: 500 });
    }

    console.log('✅ cont1 contractor found:', cont1Contractor);

    // 5. cont1의 inspection interests 확인
    const { data: cont1Interests, error: interestsError2 } = await supabase
      .from('inspection_interests')
      .select(`
        id,
        will_participate,
        created_at,
        request:renovation_requests(
          id,
          status,
          category,
          address
        )
      `)
      .eq('contractor_id', cont1Contractor.id);

    if (interestsError2) {
      console.error('❌ Error fetching cont1 interests:', interestsError2);
      return NextResponse.json({ error: 'Failed to fetch cont1 interests' }, { status: 500 });
    }

    console.log('✅ cont1 interests fetched:', cont1Interests?.length || 0);

    return NextResponse.json({
      success: true,
      message: 'Test completed successfully',
      data: {
        totalInterests: interests?.length || 0,
        totalRequests: requests?.length || 0,
        cont1User,
        cont1Contractor,
        cont1Interests
      }
    });

  } catch (error: any) {
    console.error('💥 Test API error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error.message,
      type: error.constructor.name
    }, { status: 500 });
  }
}
