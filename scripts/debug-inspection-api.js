// scripts/debug-inspection-api.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugInspectionAPI() {
  try {
    console.log('🔍 Debugging inspection-interest API...');
    
    // 1. 모든 inspection_interests 데이터 확인
    console.log('\n📋 All inspection_interests:');
    const { data: allInterests, error: interestsError } = await supabase
      .from('inspection_interests')
      .select('*');
    
    if (interestsError) {
      console.error('❌ Error fetching all interests:', interestsError);
    } else {
      console.log('✅ Total interests:', allInterests?.length || 0);
      console.log('📋 Sample:', allInterests?.slice(0, 2));
    }
    
    // 2. 모든 renovation_requests 데이터 확인
    console.log('\n📋 All renovation_requests:');
    const { data: allRequests, error: requestsError } = await supabase
      .from('renovation_requests')
      .select('*');
    
    if (requestsError) {
      console.error('❌ Error fetching all requests:', requestsError);
    } else {
      console.log('✅ Total requests:', allRequests?.length || 0);
      console.log('📋 Sample:', allRequests?.slice(0, 2));
    }
    
    // 3. cont1@gmail.com 사용자 확인
    console.log('\n🔍 Checking cont1@gmail.com...');
    const { data: cont1User, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'cont1@gmail.com')
      .single();
    
    if (userError) {
      console.error('❌ Error fetching cont1 user:', userError);
    } else {
      console.log('✅ cont1 user:', cont1User);
    }
    
    // 4. cont1 contractor 확인
    if (cont1User) {
      console.log('\n🔍 Checking cont1 contractor...');
      const { data: cont1Contractor, error: contractorError } = await supabase
        .from('contractors')
        .select('*')
        .eq('user_id', cont1User.id)
        .single();
      
      if (contractorError) {
        console.error('❌ Error fetching cont1 contractor:', contractorError);
      } else {
        console.log('✅ cont1 contractor:', cont1Contractor);
        
        // 5. cont1의 inspection interests 확인
        console.log('\n🔍 Checking cont1 inspection interests...');
        const { data: cont1Interests, error: interestsError } = await supabase
          .from('inspection_interests')
          .select('*')
          .eq('contractor_id', cont1Contractor.id);
        
        if (interestsError) {
          console.error('❌ Error fetching cont1 interests:', interestsError);
        } else {
          console.log('✅ cont1 interests:', cont1Interests);
        }
      }
    }
    
    // 6. 테이블 스키마 확인 (샘플 데이터로)
    console.log('\n🔍 Checking table relationships...');
    if (allInterests && allInterests.length > 0) {
      const sampleInterest = allInterests[0];
      console.log('📋 Sample interest:', sampleInterest);
      
      // 해당 request_id로 renovation_request 조회
      if (sampleInterest.request_id) {
        const { data: sampleRequest, error: requestError } = await supabase
          .from('renovation_requests')
          .select('*')
          .eq('id', sampleInterest.request_id)
          .single();
        
        if (requestError) {
          console.error('❌ Error fetching sample request:', requestError);
        } else {
          console.log('✅ Sample request:', sampleRequest);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Debug error:', error);
  }
}

debugInspectionAPI();
