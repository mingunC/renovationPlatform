import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET: 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return Response.json({ 
        error: 'ID or email is required' 
      }, { status: 400 });
    }

    // Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    let user;
    
    if (id) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      user = data;
    } else if (email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      user = data;
    }

    if (!user) {
      return Response.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    return Response.json({ user }, { status: 200 });

  } catch (error) {
    console.error('❌ Get user profile error:', error);
    
    return Response.json({ 
      error: 'Failed to get user profile' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, email, name, type = 'CUSTOMER' } = await request.json();

    if (!id || !email) {
      return Response.json({ 
        error: 'ID and email are required' 
      }, { status: 400 });
    }

    // Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // 안전한 upsert: 이메일로 기존 사용자 확인 후 ID 업데이트
    const { data: existingUserByEmail, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let user;

    if (existingUserByEmail) {
      // 기존 사용자가 있으면 ID 업데이트 (Supabase ID 변경 대응)
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          id: id, // 새로운 Supabase ID로 업데이트
          name: name || existingUserByEmail.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUserByEmail.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      user = updatedUser;
      
      console.log(`✅ Updated existing user: ${email} with new ID: ${id}`);
    } else {
      // 새 사용자 생성
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id,
          email,
          name: name || 'Unknown',
          type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        // 생성 중 충돌 시 (race condition) 기존 사용자 반환
        if (createError.code === '23505') { // PostgreSQL unique constraint violation
          const { data: existingUser, error: existingError } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
          
          if (existingError) throw existingError;
          
          if (existingUser) {
            console.log(`✅ User already exists: ${email}`);
            return Response.json({
              success: true,
              user: existingUser,
              message: 'User already exists'
            }, { status: 200 });
          }
        }
        throw createError;
      }
      
      user = newUser;
      console.log(`✅ Created new user: ${email} with ID: ${id}`);
    }

    return Response.json({
      success: true,
      user
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ User profile error:', error);

    return Response.json({
      error: 'Failed to handle user profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== PUT /api/auth/profile (Upsert) ===')
    
    // Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    
    const body = await request.json()
    console.log('Upsert request body:', body)
    
    const { id, email, name, phone, type } = body

    // Validate required fields
    if (!id || !email) {
      console.error('Missing required fields:', { id, email })
      return NextResponse.json(
        { error: 'Missing required fields: id, email' },
        { status: 400 }
      )
    }

    // Validate UUID format for ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      console.error('Invalid UUID format for ID:', id)
      return NextResponse.json(
        { error: 'Invalid UUID format for ID' },
        { status: 400 }
      )
    }

    console.log('Performing upsert operation:', { id, email, name, phone, type })

    try {
      // First, check if user exists by either id or email
      console.log('🔍 Checking for existing user by ID or email (PUT)...')
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .or(`id.eq.${id},email.eq.${email}`)
        .single();
      
      if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw findError;
      }
      
      if (existingUser) {
        console.log('✅ Existing user found (PUT):', { 
          id: existingUser.id, 
          email: existingUser.email, 
          type: existingUser.type 
        });
        
        // Update existing user
        const { data: user, error: updateError } = await supabase
          .from('users')
          .update({
            id, // Update to new id if different
            email, // Update email if different
            ...(name && { name }),
            ...(phone !== undefined && { phone }),
            ...(type && { type }),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        console.log('✅ User updated successfully (PUT):', { 
          id: user.id, 
          email: user.email, 
          type: user.type 
        });
        
        return NextResponse.json({ 
          success: true, 
          user,
          message: 'User profile updated successfully',
          action: 'updated'
        }, { status: 200 });
        
      } else {
        console.log('🆕 No existing user found, creating new user (PUT)...');
        
        // Create new user
        const { data: user, error: createError } = await supabase
          .from('users')
          .insert({
            id,
            email,
            name: name || email?.split('@')[0] || 'Unknown',
            phone: phone || '',
            type: type || 'CUSTOMER',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) throw createError;
        
        console.log('✅ New user created successfully (PUT):', { 
          id: user.id, 
          email: user.email, 
          type: user.type 
        });
        
        return NextResponse.json({ 
          success: true, 
          user,
          message: 'User profile created successfully',
          action: 'created'
        }, { status: 201 });
      }
      
    } catch (error) {
      console.error('❌ Upsert operation failed (PUT):', error);
      
      // Handle specific error cases
      if ((error as any).code === '23505') { // Unique constraint violation
        console.log('🔄 Handling unique constraint violation...');
        
        // Try to find the conflicting user
        const { data: conflictingUser, error: findError } = await supabase
          .from('users')
          .select('*')
          .or(`id.eq.${id},email.eq.${email}`)
          .single();
        
        if (findError) throw findError;
        
        if (conflictingUser) {
          console.log('✅ Found conflicting user, returning existing profile');
          return NextResponse.json({ 
            success: true, 
            user: conflictingUser,
            message: 'User profile already exists',
            action: 'existing'
          }, { status: 200 });
        }
      }
      
      throw error;
    }
    
  } catch (error: any) {
    console.error('❌ PUT /api/auth/profile error:', error);
    
    return NextResponse.json({
      error: 'Failed to upsert user profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
