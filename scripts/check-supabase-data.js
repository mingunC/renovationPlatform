// scripts/check-supabase-data.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseData() {
  console.log('🔍 Checking Supabase database state...');
  
  try {
    // 1. 모든 renovation_requests 조회
    console.log('\n📋 Checking renovation_requests...');
    const { data: requests, error: requestsError } = await supabase
      .from('renovation_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('❌ Error fetching requests:', requestsError);
    } else {
      console.log(`✅ Found ${requests.length} renovation requests:`);
      requests.forEach((req, index) => {
        console.log(`  ${index + 1}. ID: ${req.id}, Status: ${req.status}, Category: ${req.category}, Created: ${req.created_at}`);
      });
    }

    // 2. OPEN 상태의 요청들
    console.log('\n🆕 Checking OPEN status requests...');
    const { data: openRequests, error: openError } = await supabase
      .from('renovation_requests')
      .select('*')
      .eq('status', 'OPEN');

    if (openError) {
      console.error('❌ Error fetching OPEN requests:', openError);
    } else {
      console.log(`✅ Found ${openRequests.length} OPEN requests`);
    }

    // 3. INSPECTION_PENDING 상태의 요청들
    console.log('\n👥 Checking INSPECTION_PENDING status requests...');
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('renovation_requests')
      .select('*')
      .eq('status', 'INSPECTION_PENDING');

    if (pendingError) {
      console.error('❌ Error fetching INSPECTION_PENDING requests:', pendingError);
    } else {
      console.log(`✅ Found ${pendingRequests.length} INSPECTION_PENDING requests`);
    }

    // 4. users 테이블 확인
    console.log('\n👤 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, type, created_at')
      .limit(10);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log(`✅ Found ${users.length} users (showing first 10):`);
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}, Type: ${user.type}`);
      });
    }

    // 5. contractors 테이블 확인
    console.log('\n🏗️ Checking contractors table...');
    const { data: contractors, error: contractorsError } = await supabase
      .from('contractors')
      .select('id, user_id, business_name, created_at')
      .limit(10);

    if (contractorsError) {
      console.error('❌ Error fetching contractors:', contractorsError);
    } else {
      console.log(`✅ Found ${contractors.length} contractors (showing first 10):`);
      contractors.forEach((contractor, index) => {
        console.log(`  ${index + 1}. ID: ${contractor.id}, User ID: ${contractor.user_id}, Business: ${contractor.business_name}`);
      });
    }

    // 6. inspection_interests 테이블 확인
    console.log('\n🔍 Checking inspection_interests table...');
    const { data: interests, error: interestsError } = await supabase
      .from('inspection_interests')
      .select('*')
      .limit(10);

    if (interestsError) {
      console.error('❌ Error fetching inspection_interests:', interestsError);
    } else {
      console.log(`✅ Found ${interests.length} inspection interests (showing first 10):`);
      interests.forEach((interest, index) => {
        console.log(`  ${index + 1}. Request ID: ${interest.request_id}, Contractor ID: ${interest.contractor_id}, Will Participate: ${interest.will_participate}`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkSupabaseData();
