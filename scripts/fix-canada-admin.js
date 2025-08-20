// scripts/fix-canada-admin.js
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

async function fixCanadaAdmin() {
  console.log('🔧 Fixing canadabeavers8@gmail.com to ADMIN...');
  
  try {
    // 1. 현재 상태 확인
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, type')
      .eq('email', 'canadabeavers8@gmail.com')
      .single();

    if (findError) {
      console.error('❌ Error finding user:', findError);
      return;
    }

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log(`📝 Current status: ${user.email} - ${user.type}`);

    if (user.type === 'ADMIN') {
      console.log('✅ Already ADMIN type');
      return;
    }

    // 2. ADMIN으로 업데이트
    console.log('🔄 Updating to ADMIN...');
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        type: 'ADMIN',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return;
    }

    console.log('✅ Successfully updated to ADMIN!');
    console.log('📋 Final status:', updatedUser);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixCanadaAdmin();
