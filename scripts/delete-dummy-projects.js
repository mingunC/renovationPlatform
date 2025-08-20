// scripts/delete-dummy-projects.js
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

async function deleteDummyProjects() {
  console.log('🗑️ Deleting dummy projects...');
  
  try {
    // 1. 현재 프로젝트 상태 확인
    console.log('\n📋 Current renovation requests:');
    const { data: requests, error: requestsError } = await supabase
      .from('renovation_requests')
      .select('id, category, address, status, created_at')
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('❌ Error fetching requests:', requestsError);
      return;
    }

    requests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.category} - ${req.address} (${req.status}) - ${req.created_at}`);
    });

    // 2. 더미 프로젝트 식별 및 삭제
    console.log('\n🗑️ Identifying and deleting dummy projects...');
    
    const dummyAddresses = [
      '123 King Street West, Toronto, ON',
      '456 Queen Street West, Toronto, ON', 
      '789 Spadina Avenue, Toronto, ON'
    ];

    let deletedCount = 0;
    
    for (const address of dummyAddresses) {
      console.log(`\n🔍 Looking for: ${address}`);
      
      const { data: project, error: findError } = await supabase
        .from('renovation_requests')
        .select('id, category, address')
        .eq('address', address)
        .single();

      if (findError) {
        if (findError.code === 'PGRST116') {
          console.log(`  ❌ Project not found: ${address}`);
        } else {
          console.error(`  ❌ Error finding project:`, findError);
        }
        continue;
      }

      if (project) {
        console.log(`  📝 Found project: ${project.category} - ${project.address}`);
        
        // 프로젝트 삭제
        const { error: deleteError } = await supabase
          .from('renovation_requests')
          .delete()
          .eq('id', project.id);

        if (deleteError) {
          console.error(`  ❌ Error deleting project:`, deleteError);
        } else {
          console.log(`  ✅ Successfully deleted: ${project.category} - ${project.address}`);
          deletedCount++;
        }
      }
    }

    // 3. 최종 상태 확인
    console.log('\n📋 Final renovation requests:');
    const { data: finalRequests, error: finalError } = await supabase
      .from('renovation_requests')
      .select('id, category, address, status, created_at')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Error fetching final requests:', finalError);
      return;
    }

    finalRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.category} - ${req.address} (${req.status}) - ${req.created_at}`);
    });

    console.log(`\n🎉 Dummy projects deletion completed!`);
    console.log(`📊 Deleted ${deletedCount} dummy projects`);
    console.log(`📊 Remaining projects: ${finalRequests.length}`);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

deleteDummyProjects();
