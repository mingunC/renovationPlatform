// /lib/supabase-browser.ts
import { createBrowserClient } from '@supabase/ssr'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowser() {
  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return browserClient
}

// authHelpers를 여기로 이동
export const authHelpers = {
  // Sign up a new user
  async signUp(email: string, password: string, userData: Record<string, unknown> = {}) {
    const supabase = getSupabaseBrowser()
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
    const supabase = getSupabaseBrowser()
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  // Sign out the current user
  async signOut() {
    const supabase = getSupabaseBrowser()
    return await supabase.auth.signOut()
  },

  // Get the current session
  async getSession() {
    const supabase = getSupabaseBrowser()
    return await supabase.auth.getSession()
  },

  // Get the current user
  async getUser() {
    const supabase = getSupabaseBrowser()
    return await supabase.auth.getUser()
  },

  // Reset password
  async resetPassword(email: string, redirectTo?: string) {
    const supabase = getSupabaseBrowser()
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`,
    })
  },

  // Update password
  async updatePassword(password: string) {
    const supabase = getSupabaseBrowser()
    return await supabase.auth.updateUser({ password })
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const supabase = getSupabaseBrowser()
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