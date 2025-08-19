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
  },
  global: {
    // Add retry logic
    fetch: async (url: any, options: any = {}) => {
      const maxRetries = 3;
      let lastError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          console.log(`🔄 Attempt ${i + 1}/${maxRetries} for request...`);
          const response = await fetch(url, {
            ...options,
            // Add timeout
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
          return response;
        } catch (error) {
          lastError = error;
          console.log(`⚠️ Attempt ${i + 1} failed:`, error.message);
          if (i < maxRetries - 1) {
            // Wait before retry (exponential backoff)
            const delay = Math.pow(2, i) * 1000;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      throw lastError;
    }
  }
});

async function fixUserTypes() {
  console.log('🔧 Starting to fix user types with retry logic...\n');

  try {
    // Step 1: First, let's check current status
    console.log('📊 Checking current user status...');
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, type')
      .in('email', [
        'canadabeavers8@gmail.com',
        'mingun.ryan.choi@gmail.com',
        'admin@renovate.com'
      ]);

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }

    console.log('\n📋 Current status:');
    users?.forEach(user => {
      console.log(`  • ${user.email}: ${user.type}`);
    });

    // Step 2: Fix canadabeavers8@gmail.com → ADMIN
    const canadaUser = users?.find(u => u.email === 'canadabeavers8@gmail.com');
    if (canadaUser && canadaUser.type !== 'ADMIN') {
      console.log('\n🔄 Updating canadabeavers8@gmail.com to ADMIN...');
      
      const { error: updateError1 } = await supabase
        .from('users')
        .update({ type: 'ADMIN' })
        .eq('email', 'canadabeavers8@gmail.com');

      if (updateError1) {
        console.error('❌ Error updating canadabeavers8@gmail.com:', updateError1);
      } else {
        console.log('✅ Successfully updated canadabeavers8@gmail.com to ADMIN');
      }
    } else if (canadaUser?.type === 'ADMIN') {
      console.log('✅ canadabeavers8@gmail.com is already ADMIN');
    }

    // Step 3: Fix mingun.ryan.choi@gmail.com → CUSTOMER
    const mingunUser = users?.find(u => u.email === 'mingun.ryan.choi@gmail.com');
    if (mingunUser && mingunUser.type !== 'CUSTOMER') {
      console.log('\n🔄 Updating mingun.ryan.choi@gmail.com to CUSTOMER...');
      
      const { error: updateError2 } = await supabase
        .from('users')
        .update({ type: 'CUSTOMER' })
        .eq('email', 'mingun.ryan.choi@gmail.com');

      if (updateError2) {
        console.error('❌ Error updating mingun.ryan.choi@gmail.com:', updateError2);
      } else {
        console.log('✅ Successfully updated mingun.ryan.choi@gmail.com to CUSTOMER');
      }
    } else if (mingunUser?.type === 'CUSTOMER') {
      console.log('✅ mingun.ryan.choi@gmail.com is already CUSTOMER');
    }

    // Step 4: Verify final status
    console.log('\n📊 Verifying final status...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('id, email, type')
      .in('email', [
        'canadabeavers8@gmail.com',
        'mingun.ryan.choi@gmail.com'
      ]);

    if (finalError) {
      console.error('❌ Error fetching final status:', finalError);
      return;
    }

    console.log('\n✅ Final status:');
    finalUsers?.forEach(user => {
      const icon = user.type === 'ADMIN' ? '👑' : '👤';
      console.log(`  ${icon} ${user.email}: ${user.type}`);
    });

    // Summary
    console.log('\n📋 Summary:');
    console.log('  • admin@renovate.com: Already deleted ✅');
    
    const canada = finalUsers?.find(u => u.email === 'canadabeavers8@gmail.com');
    const mingun = finalUsers?.find(u => u.email === 'mingun.ryan.choi@gmail.com');
    
    if (canada?.type === 'ADMIN') {
      console.log('  • canadabeavers8@gmail.com: ADMIN ✅');
    } else {
      console.log('  • canadabeavers8@gmail.com: Still needs fixing ❌');
    }
    
    if (mingun?.type === 'CUSTOMER') {
      console.log('  • mingun.ryan.choi@gmail.com: CUSTOMER ✅');
    } else {
      console.log('  • mingun.ryan.choi@gmail.com: Still needs fixing ❌');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run with better error handling
fixUserTypes()
  .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
