// scripts/fix-account-types.js
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

async function fixAccountTypes() {
  console.log('🔧 Fixing account types to correct state...');
  
  try {
    // 1. 현재 상태 확인
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

    // 2. 계정 타입 수정
    console.log('\n🔧 Fixing account types:');
    
    // mingun.ryan.choi@gmail.com을 CUSTOMER로 변경
    console.log('\n📝 Processing: mingun.ryan.choi@gmail.com -> CUSTOMER');
    const { data: mingunUser, error: mingunFindError } = await supabase
      .from('users')
      .select('id, email, type')
      .eq('email', 'mingun.ryan.choi@gmail.com')
      .single();

    if (mingunFindError) {
      console.error('❌ Error finding mingun.ryan.choi@gmail.com:', mingunFindError);
    } else if (mingunUser.type !== 'CUSTOMER') {
      const { data: updatedMingun, error: mingunUpdateError } = await supabase
        .from('users')
        .update({
          type: 'CUSTOMER',
          updated_at: new Date().toISOString()
        })
        .eq('id', mingunUser.id)
        .select()
        .single();

      if (mingunUpdateError) {
        console.error('❌ Error updating mingun.ryan.choi@gmail.com:', mingunUpdateError);
      } else {
        console.log('✅ Successfully updated mingun.ryan.choi@gmail.com to CUSTOMER');
      }
    } else {
      console.log('✅ mingun.ryan.choi@gmail.com already CUSTOMER');
    }

    // 3. admin@renovate.com 삭제
    console.log('\n🗑️ Deleting: admin@renovate.com');
    const { data: adminUser, error: adminFindError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'admin@renovate.com')
      .single();

    if (adminFindError) {
      console.error('❌ Error finding admin@renovate.com:', adminFindError);
    } else {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', adminUser.id);

      if (deleteError) {
        console.error('❌ Error deleting admin@renovate.com:', deleteError);
      } else {
        console.log('✅ Successfully deleted admin@renovate.com');
      }
    }

    // 4. 최종 상태 확인
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

    console.log('\n🎉 Account type fix completed!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixAccountTypes();
