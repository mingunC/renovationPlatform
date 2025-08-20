// scripts/check-inspection-interests.js
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

async function checkInspectionInterests() {
  try {
    console.log('🔍 Checking inspection_interests table...');
    
    // 1. inspection_interests 테이블 전체 데이터 확인
    const { data: allInterests, error: interestsError } = await supabase
      .from('inspection_interests')
      .select('*');
    
    if (interestsError) {
      console.error('❌ Error fetching inspection_interests:', interestsError);
      return;
    }
    
    console.log('📋 Total inspection_interests:', allInterests?.length || 0);
    console.log('📋 Sample inspection_interests:', allInterests?.slice(0, 3));
    
    // 2. renovation_requests 테이블 확인
    const { data: allRequests, error: requestsError } = await supabase
      .from('renovation_requests')
      .select('id, status, category, address');
    
    if (requestsError) {
      console.error('❌ Error fetching renovation_requests:', requestsError);
      return;
    }
    
    console.log('📋 Total renovation_requests:', allRequests?.length || 0);
    console.log('📋 Sample renovation_requests:', allRequests?.slice(0, 3));
    
    // 3. inspection_interests와 renovation_requests 관계 확인
    if (allInterests && allInterests.length > 0) {
      console.log('\n🔗 Checking relationships...');
      
      for (const interest of allInterests.slice(0, 5)) { // 처음 5개만 확인
        console.log(`\n📋 Interest ID: ${interest.id}`);
        console.log(`   Request ID: ${interest.request_id}`);
        console.log(`   Contractor ID: ${interest.contractor_id}`);
        console.log(`   Will Participate: ${interest.will_participate}`);
        
        // 해당 request_id가 renovation_requests에 존재하는지 확인
        const matchingRequest = allRequests?.find(req => req.id === interest.request_id);
        if (matchingRequest) {
          console.log(`   ✅ Request found: ${matchingRequest.status} - ${matchingRequest.category} - ${matchingRequest.address}`);
        } else {
          console.log(`   ❌ Request NOT found for ID: ${interest.request_id}`);
        }
      }
    }
    
    // 4. cont1@gmail.com 관련 데이터 확인
    console.log('\n🔍 Checking cont1@gmail.com data...');
    
    const { data: cont1User, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', 'cont1@gmail.com')
      .single();
    
    if (userError) {
      console.error('❌ Error fetching cont1 user:', userError);
    } else if (cont1User) {
      console.log('✅ cont1@gmail.com user found:', cont1User);
      
      const { data: cont1Contractor, error: contractorError } = await supabase
        .from('contractors')
        .select('id, business_name')
        .eq('user_id', cont1User.id)
        .single();
      
      if (contractorError) {
        console.error('❌ Error fetching cont1 contractor:', contractorError);
      } else if (cont1Contractor) {
        console.log('✅ cont1 contractor found:', cont1Contractor);
        
        const { data: cont1Interests, error: interestsError } = await supabase
          .from('inspection_interests')
          .select('*')
          .eq('contractor_id', cont1Contractor.id);
        
        if (interestsError) {
          console.error('❌ Error fetching cont1 interests:', interestsError);
        } else {
          console.log('✅ cont1 inspection interests:', cont1Interests);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Script error:', error);
  }
}

checkInspectionInterests();
