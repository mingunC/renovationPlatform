import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkCont1Participation() {
  console.log('🔍 Checking cont1@gmail.com participation status...\n');

  try {
    // Step 1: cont1@gmail.com 사용자 찾기
    console.log('📋 Step 1: Finding cont1@gmail.com user...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, type')
      .eq('email', 'cont1@gmail.com')
      .single();

    if (userError || !user) {
      console.error('❌ User not found:', userError);
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type
    });

    // Step 2: 해당 사용자의 contractor 프로필 찾기
    console.log('\n📋 Step 2: Finding contractor profile...');
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (contractorError || !contractor) {
      console.error('❌ Contractor profile not found:', contractorError);
      return;
    }

    console.log('✅ Contractor profile found:', {
      id: contractor.id,
      business_name: contractor.business_name,
      user_id: contractor.user_id
    });

    // Step 3: 해당 업체의 inspection_interests 찾기
    console.log('\n📋 Step 3: Finding inspection interests...');
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
          status,
          category,
          address,
          inspection_date,
          customer:users!renovation_requests_customer_id_fkey(
            id,
            name,
            email
          )
        )
      `)
      .eq('contractor_id', contractor.id);

    if (interestsError) {
      console.error('❌ Error fetching inspection interests:', interestsError);
      return;
    }

    console.log(`✅ Found ${inspectionInterests?.length || 0} inspection interests`);

    if (inspectionInterests && inspectionInterests.length > 0) {
      inspectionInterests.forEach((interest, index) => {
        console.log(`\n📝 Interest ${index + 1}:`);
        console.log(`  - ID: ${interest.id}`);
        console.log(`  - Request ID: ${interest.request_id}`);
        console.log(`  - Will Participate: ${interest.will_participate}`);
        console.log(`  - Created: ${interest.created_at}`);
        
        if (interest.renovation_request) {
          const request = interest.renovation_request;
          console.log(`  - Project Status: ${request.status}`);
          console.log(`  - Category: ${request.category}`);
          console.log(`  - Address: ${request.address}`);
          console.log(`  - Inspection Date: ${request.inspection_date || 'Not set'}`);
          console.log(`  - Customer: ${request.customer?.name} (${request.customer?.email})`);
        }
      });
    } else {
      console.log('❌ No inspection interests found for this contractor');
    }

    // Step 4: 현장방문 예정 상태의 프로젝트들 확인
    console.log('\n📋 Step 4: Checking projects with INSPECTION_SCHEDULED status...');
    const { data: scheduledProjects, error: scheduledError } = await supabase
      .from('renovation_requests')
      .select(`
        id,
        status,
        category,
        address,
        inspection_date,
        inspection_time,
        customer:users!renovation_requests_customer_id_fkey(
          id,
          name,
          email
        ),
        inspection_interests(
          id,
          contractor_id,
          will_participate,
          contractor:contractors(
            id,
            business_name,
            user:users!contractors_user_id_fkey(
              id,
              email,
              name
            )
          )
        )
      `)
      .eq('status', 'INSPECTION_SCHEDULED')
      .order('inspection_date', { ascending: true });

    if (scheduledError) {
      console.error('❌ Error fetching scheduled projects:', scheduledError);
      return;
    }

    console.log(`✅ Found ${scheduledProjects?.length || 0} scheduled inspection projects`);

    if (scheduledProjects && scheduledProjects.length > 0) {
      scheduledProjects.forEach((project, index) => {
        console.log(`\n🏗️ Project ${index + 1}:`);
        console.log(`  - ID: ${project.id}`);
        console.log(`  - Status: ${project.status}`);
        console.log(`  - Category: ${project.category}`);
        console.log(`  - Address: ${project.address}`);
        console.log(`  - Inspection Date: ${project.inspection_date}`);
        console.log(`  - Inspection Time: ${project.inspection_time || 'Not set'}`);
        console.log(`  - Customer: ${project.customer?.name} (${project.customer?.email})`);
        
        if (project.inspection_interests && project.inspection_interests.length > 0) {
          console.log(`  - Participants: ${project.inspection_interests.length}`);
          project.inspection_interests.forEach((interest, i) => {
            console.log(`    ${i + 1}. ${interest.contractor?.business_name} (${interest.contractor?.user?.email}) - ${interest.will_participate ? '참여' : '미참여'}`);
          });
        } else {
          console.log('  - No participants');
        }
      });
    } else {
      console.log('❌ No scheduled inspection projects found');
    }

    // Step 5: 전체 inspection_interests 테이블 상태 확인
    console.log('\n📋 Step 5: Checking all inspection_interests table...');
    const { data: allInterests, error: allInterestsError } = await supabase
      .from('inspection_interests')
      .select(`
        id,
        request_id,
        contractor_id,
        will_participate,
        created_at,
        contractor:contractors(
          id,
          business_name,
          user:users!contractors_user_id_fkey(
            id,
            email,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (allInterestsError) {
      console.error('❌ Error fetching all inspection interests:', allInterestsError);
      return;
    }

    console.log(`✅ Found ${allInterests?.length || 0} total inspection interests (showing last 10)`);

    if (allInterests && allInterests.length > 0) {
      allInterests.forEach((interest, index) => {
        console.log(`\n📝 Interest ${index + 1}:`);
        console.log(`  - ID: ${interest.id}`);
        console.log(`  - Request ID: ${interest.request_id}`);
        console.log(`  - Contractor: ${interest.contractor?.business_name} (${interest.contractor?.user?.email})`);
        console.log(`  - Will Participate: ${interest.will_participate}`);
        console.log(`  - Created: ${interest.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkCont1Participation()
  .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
