// scripts/fix-admin-accounts.js
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

async function fixAdminAccounts() {
  console.log('🔧 Fixing admin accounts...');
  
  try {
    // 1. 현재 사용자 상태 확인
    console.log('\n📋 Current user status:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, type, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} - ${user.type}`);
    });

    // 2. Admin 계정 복구
    const adminAccounts = [
      { email: 'canadabeavers8@gmail.com', type: 'ADMIN' },
      { email: 'cont1@gmail.com', type: 'CONTRACTOR' }
    ];

    console.log('\n🔧 Fixing account types:');
    
    for (const account of adminAccounts) {
      console.log(`\n📝 Processing: ${account.email} -> ${account.type}`);
      
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('id, email, type')
        .eq('email', account.email)
        .single();

      if (findError) {
        console.error(`❌ Error finding user ${account.email}:`, findError);
        continue;
      }

      if (!user) {
        console.error(`❌ User not found: ${account.email}`);
        continue;
      }

      console.log(`  Current type: ${user.type}`);
      
      if (user.type === account.type) {
        console.log(`  ✅ Already correct type: ${user.type}`);
        continue;
      }

      // 타입 업데이트
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          type: account.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ Error updating ${account.email}:`, updateError);
      } else {
        console.log(`  ✅ Successfully updated ${account.email} to ${account.type}`);
      }
    }

    // 3. 최종 상태 확인
    console.log('\n📋 Final user status:');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('id, email, type')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Error fetching final users:', finalError);
      return;
    }

    finalUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} - ${user.type}`);
    });

    console.log('\n🎉 Admin account fix completed!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixAdminAccounts();
