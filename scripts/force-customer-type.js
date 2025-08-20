// scripts/force-customer-type.js
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

async function forceCustomerType() {
  console.log('🔧 Force changing mingun.ryan.choi@gmail.com to CUSTOMER...');
  
  try {
    // 1. 현재 상태 확인
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, type')
      .eq('email', 'mingun.ryan.choi@gmail.com')
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

    if (user.type === 'CUSTOMER') {
      console.log('✅ Already CUSTOMER type');
      return;
    }

    // 2. 강제로 CUSTOMER로 변경
    console.log('🔄 Force updating to CUSTOMER...');
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        type: 'CUSTOMER',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return;
    }

    console.log('✅ Successfully force updated to CUSTOMER!');
    console.log('📋 Final status:', updatedUser);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

forceCustomerType();
