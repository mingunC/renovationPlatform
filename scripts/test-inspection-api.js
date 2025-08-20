// scripts/test-inspection-api.js
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

async function testInspectionAPI() {
  try {
    console.log('🧪 Testing inspection-interest API logic...');
    
    // 1. cont1@gmail.com 사용자로 로그인 시뮬레이션
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'cont1@gmail.com',
      password: 'password123' // 실제 비밀번호로 변경 필요
    });
    
    if (authError) {
      console.log('⚠️ Auth simulation failed, using service role instead');
      // 서비스 롤로 직접 테스트
    } else {
      console.log('✅ Auth simulation successful:', user.id);
    }
    
    // 2. cont1 contractor ID 찾기
    const { data: cont1User, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'cont1@gmail.com')
      .single();
    
    if (userError) {
      console.error('❌ Error fetching cont1 user:', userError);
      return;
    }
    
    const { data: cont1Contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('id')
      .eq('user_id', cont1User.id)
      .single();
    
    if (contractorError) {
      console.error('❌ Error fetching cont1 contractor:', contractorError);
      return;
    }
    
    console.log('✅ cont1 contractor ID:', cont1Contractor.id);
    
    // 3. API 로직과 동일한 쿼리 실행
    console.log('🔍 Executing API query...');
    
    const { data: interests, error: interestsError } = await supabase
      .from('inspection_interests')
      .select(`
        id,
        will_participate,
        created_at,
        updated_at,
        request:renovation_requests(
          id,
          category,
          budget_range,
          address,
          description,
          status
        )
      `)
      .eq('contractor_id', cont1Contractor.id)
      .order('created_at', { ascending: false });
    
    if (interestsError) {
      console.error('❌ Query error:', interestsError);
      return;
    }
    
    console.log('✅ Query successful!');
    console.log('📋 Raw data:', interests);
    
    // 4. 필터링 로직 테스트
    if (interests && interests.length > 0) {
      console.log('\n🔍 Testing filtering logic...');
      
      const participatingRequests = interests
        .filter((interest) => {
          const hasParticipation = interest.will_participate === true;
          const isInspectionPhase = interest.request.status === 'INSPECTION_PENDING' || 
                                   interest.request.status === 'INSPECTION_SCHEDULED';
          
          console.log(`🔍 Interest ${interest.id}: will_participate=${interest.will_participate}, status=${interest.request.status}, isInspectionPhase=${isInspectionPhase}`);
          
          return hasParticipation && isInspectionPhase;
        })
        .map((interest) => ({
          ...interest.request,
          inspection_interest: {
            will_participate: interest.will_participate,
            created_at: interest.created_at
          }
        }));
      
      console.log('✅ Filtered requests:', participatingRequests);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testInspectionAPI();
