'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { FcGoogle } from 'react-icons/fc'

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  children?: React.ReactNode
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  variant = 'outline',
  size = 'default',
  className = '',
  children
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google login error:', error)
        onError?.(error.message)
      } else {
        console.log('Google login initiated:', data)
        onSuccess?.(data)
      }
    } catch (error) {
      console.error('Google login error:', error)
      onError?.(error instanceof Error ? error.message : 'Google 로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGoogleLogin}
      disabled={loading}
      className={`w-full ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      ) : (
        <FcGoogle className="w-4 h-4 mr-2" />
      )}
      {children || 'Google로 계속하기'}
    </Button>
  )
}
