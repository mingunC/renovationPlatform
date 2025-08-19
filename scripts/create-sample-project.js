// scripts/create-sample-project.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleProject() {
  console.log('🔨 Creating sample renovation project...');
  
  try {
    // 1. CUSTOMER 타입의 사용자 찾기
    const { data: customers, error: customersError } = await supabase
      .from('users')
      .select('id, email')
      .eq('type', 'CUSTOMER')
      .limit(1);

    if (customersError || !customers || customers.length === 0) {
      console.error('❌ No CUSTOMER users found');
      return;
    }

    const customer = customers[0];
    console.log(`✅ Found customer: ${customer.email}`);

    // 2. 샘플 프로젝트 생성
    const sampleProject = {
      id: randomUUID(),
      customer_id: customer.id,
      property_type: 'DETACHED_HOUSE',
      category: 'KITCHEN',
      budget_range: 'RANGE_50_100K',
      postal_code: 'M5V 3A8',
      address: '123 King Street West, Toronto, ON',
      description: '주방 리노베이션 프로젝트입니다. 현대적인 디자인과 기능성을 중시하며, 고품질 재료를 사용하여 완성도 높은 결과물을 만들어주세요.',
      status: 'OPEN',
      timeline: 'WITHIN_3MONTHS',
      created_at: new Date().toISOString()
    };

    const { data: newProject, error: projectError } = await supabase
      .from('renovation_requests')
      .insert(sampleProject)
      .select()
      .single();

    if (projectError) {
      console.error('❌ Error creating project:', projectError);
      return;
    }

    console.log('✅ Sample project created successfully!');
    console.log('📋 Project details:');
    console.log(`  ID: ${newProject.id}`);
    console.log(`  Category: ${newProject.category}`);
    console.log(`  Status: ${newProject.status}`);
    console.log(`  Address: ${newProject.address}`);
    console.log(`  Created: ${newProject.created_at}`);

    // 3. 추가 샘플 프로젝트들 생성
    const additionalProjects = [
      {
        id: randomUUID(),
        customer_id: customer.id,
        property_type: 'CONDO',
        category: 'BATHROOM',
        budget_range: 'UNDER_50K',
        postal_code: 'M5V 3A8',
        address: '456 Queen Street West, Toronto, ON',
        description: '욕실 리노베이션입니다. 깔끔하고 모던한 디자인으로 업그레이드하고 싶습니다.',
        status: 'OPEN',
        timeline: 'WITHIN_1MONTH',
        created_at: new Date().toISOString()
      },
      {
        id: randomUUID(),
        customer_id: customer.id,
        property_type: 'TOWNHOUSE',
        category: 'FLOORING',
        budget_range: 'OVER_100K',
        postal_code: 'M5V 3A8',
        address: '789 Spadina Avenue, Toronto, ON',
        description: '전체 바닥 교체 프로젝트입니다. 고급 목재 바닥재를 사용하여 따뜻하고 세련된 분위기를 연출하고 싶습니다.',
        status: 'OPEN',
        timeline: 'WITHIN_3MONTHS',
        created_at: new Date().toISOString()
      }
    ];

    for (const project of additionalProjects) {
      const { data: additionalProject, error: addError } = await supabase
        .from('renovation_requests')
        .insert(project)
        .select()
        .single();

      if (addError) {
        console.error(`❌ Error creating additional project:`, addError);
      } else {
        console.log(`✅ Additional project created: ${additionalProject.category} - ${additionalProject.address}`);
      }
    }

    console.log('\n🎉 Sample projects creation completed!');
    console.log('💡 Now check the contractor dashboard to see the new requests.');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

createSampleProject();
