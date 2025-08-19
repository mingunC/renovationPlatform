import { createServerActionClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, type } = await request.json()
    
    const supabase = await createServerActionClient()
    
    // Handle sign up
    if (type === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      return NextResponse.json({ data })
    }
    
    // Handle sign in
    if (type === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      return NextResponse.json({ data })
    }
    
    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const supabase = await createServerActionClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ message: 'Signed out successfully' })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
