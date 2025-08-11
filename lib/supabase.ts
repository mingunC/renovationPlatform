import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client for middleware
export const createSupabaseReqResClient = (req: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key',
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
}

// Server-side Supabase client for server components and route handlers
export const createSupabaseServerClient = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Auth helper functions
export const authHelpers = {
  // Sign up a new user
  async signUp(email: string, password: string, userData: Record<string, unknown> = {}) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
  },

  // Sign in an existing user
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  // Sign out the current user
  async signOut() {
    return await supabase.auth.signOut()
  },

  // Get the current session
  async getSession() {
    return await supabase.auth.getSession()
  },

  // Get the current user
  async getUser() {
    return await supabase.auth.getUser()
  },

  // Reset password
  async resetPassword(email: string, redirectTo?: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`,
    })
  },

  // Update password
  async updatePassword(password: string) {
    return await supabase.auth.updateUser({ password })
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Get user profile from database
  async getUserProfile(userId: string) {
    try {
      const response = await fetch(`/api/auth/profile?id=${userId}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Create user profile in database
  async createUserProfile(userData: {
    id: string
    email: string
    name: string
    phone?: string
    type: 'CUSTOMER' | 'CONTRACTOR'
  }) {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to create user profile')
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  },

  // Update user profile
  async updateUserProfile(userData: {
    name?: string
    phone?: string
  }) {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to update user profile')
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },
}