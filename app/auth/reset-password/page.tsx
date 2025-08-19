'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidCode, setIsValidCode] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowser()

  // URL에서 Supabase code 확인
  const code = searchParams.get('code')

  useEffect(() => {
    // code가 있으면 유효성 검증
    if (code) {
      validateCode()
    } else {
      setError('유효하지 않은 재설정 링크입니다.')
    }
  }, [code])

  const validateCode = async () => {
    try {
      setIsLoading(true)
      
      // Supabase에서 현재 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session check error:', sessionError)
        setError('세션 확인에 실패했습니다.')
        return
      }

      // code가 있고 세션이 있으면 유효한 것으로 간주
      if (code && session) {
        setIsValidCode(true)
        setError('')
        console.log('✅ Valid reset password session detected')
      } else if (code && !session) {
        // code는 있지만 세션이 없는 경우 - Supabase가 아직 처리하지 않음
        setError('재설정 링크가 유효하지 않거나 만료되었습니다.')
        console.log('❌ Code exists but no session found')
      } else {
        setError('유효하지 않은 코드입니다.')
      }
    } catch (error) {
      console.error('Code validation failed:', error)
      setError('코드 검증 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      // code와 새 비밀번호로 비밀번호 업데이트
      const { data, error } = await supabase.auth.updateUser({ 
        password: password 
      })

      if (error) {
        console.error('Password update error:', error)
        setError(`비밀번호 업데이트 실패: ${error.message}`)
        return
      }

      if (data.user) {
        setSuccess(true)
        setError('')
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (error) {
      console.error('Password update failed:', error)
      setError('비밀번호 업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">처리 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidCode && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">코드 확인 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">비밀번호가 성공적으로 변경되었습니다!</h2>
            <p className="mt-2 text-sm text-gray-600">
              잠시 후 로그인 페이지로 이동합니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            새 비밀번호 설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            안전한 새 비밀번호를 입력해주세요
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">새 비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
                className="mt-1"
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="mt-1"
                minLength={6}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isValidCode}
            >
              {isLoading ? '처리 중...' : '비밀번호 변경'}
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/login')}
              className="text-sm"
            >
              로그인 페이지로 돌아가기
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
