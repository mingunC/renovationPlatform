'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase'

export default function ContractorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  
  // 로그인 성공 후 리다이렉션 처리
  useEffect(() => {
    if (loginSuccess) {
      console.log('🔄 Login success detected, redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [loginSuccess, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.id)
        
        // 사용자 프로필 확인
        try {
          console.log('🔍 Fetching user profile...')
          const response = await fetch(`/api/auth/profile?id=${data.user.id}`)
          console.log('📡 Profile response status:', response.status)
          
          if (response.ok) {
            const { user: profile } = await response.json()
            console.log('📋 User profile:', profile)
            
            if (profile.type === 'CONTRACTOR') {
              // 업체인 경우 대시보드로 이동
              console.log('🚀 Login successful for contractor, setting success state...')
              setError('') // 에러 메시지 초기화
              setLoading(false) // 로딩 상태 해제
              setLoginSuccess(true) // 리다이렉션을 위한 상태 설정
            } else {
              // 고객인 경우 에러 메시지
              console.log('❌ User is not a contractor')
              setError('업체 계정으로 로그인해주세요.')
              await supabase.auth.signOut()
            }
          } else if (response.status === 404) {
            // 사용자 프로필이 없는 경우 자동으로 생성
            console.log('⚠️ User profile not found, creating automatically...')
            try {
              const createResponse = await fetch('/api/auth/profile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Unknown',
                  phone: '',
                  type: 'CONTRACTOR'
                })
              })
              
              if (createResponse.ok) {
                console.log('✅ User profile created successfully')
                setError('') // 에러 메시지 초기화
                setLoading(false) // 로딩 상태 해제
                setLoginSuccess(true) // 리다이렉션을 위한 상태 설정
              } else {
                console.log('❌ Failed to create user profile:', createResponse.status)
                setError('사용자 프로필 생성에 실패했습니다.')
                await supabase.auth.signOut()
              }
            } catch (createError) {
              console.error('Profile creation error:', createError)
              setError('사용자 프로필 생성 중 오류가 발생했습니다.')
              await supabase.auth.signOut()
            }
          } else {
            console.log('❌ Profile fetch failed:', response.status)
            setError('사용자 프로필을 확인할 수 없습니다.')
            await supabase.auth.signOut()
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError)
          setError('사용자 프로필 확인에 실패했습니다.')
          await supabase.auth.signOut()
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            🏗️ 업체 로그인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-gray-600">
              업체 계정으로 로그인하여<br/>
              프로젝트 입찰 및 관리가 가능합니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contractor@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || loginSuccess}>
              {loading ? '로그인 중...' : loginSuccess ? '로그인 성공! 대시보드로 이동 중...' : '업체 로그인'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <div>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <div>
              <span className="text-sm text-gray-600">일반 사용자이신가요? </span>
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
                일반 로그인
              </Link>
            </div>
            <div>
              <span className="text-sm text-gray-600">업체 계정이 없으신가요? </span>
              <Link href="/contractor-onboarding" className="text-sm text-blue-600 hover:text-blue-800">
                업체 등록하기
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
