'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function TestAdminLogin() {
  const [email, setEmail] = useState('admin@renovate.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleAdminLogin = async () => {
    setLoading(true)
    setMessage(null)

    if (!email || !password) {
      setMessage({ type: 'error', text: '이메일과 비밀번호를 모두 입력해주세요.' })
      setLoading(false)
      return
    }

    try {
      // Supabase를 사용한 관리자 로그인
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Supabase login error:', error)
        setMessage({ type: 'error', text: error.message || '로그인에 실패했습니다.' })
        return
      }

      if (data.user) {
        // 사용자 역할 확인 (users 테이블에서 type 필드 사용)
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('type')
          .eq('id', data.user.id)
          .single()

        if (profileError || !userProfile || userProfile.type !== 'ADMIN') {
          // 로그아웃 처리
          await supabase.auth.signOut()
          setMessage({ type: 'error', text: '관리자 권한이 없습니다.' })
          return
        }

        console.log('Admin login successful:', data.user)
        setMessage({ type: 'success', text: '관리자 로그인 성공! 관리자 페이지로 이동합니다.' })
        
        // 즉시 리다이렉트
        try {
          console.log('Redirecting to /admin...')
          await router.push('/admin')
          console.log('Redirect completed')
        } catch (redirectError) {
          console.error('Redirect error:', redirectError)
          // 리다이렉트 실패 시 수동으로 이동
          window.location.href = '/admin'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage({ type: 'error', text: '로그인 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '관리자 계정이 생성되었습니다! 이제 로그인할 수 있습니다.' })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || '관리자 계정 생성에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '관리자 계정 생성 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">관리자 로그인</CardTitle>
          <p className="text-gray-600">관리자 계정으로 로그인하여 관리자 페이지에 접근할 수 있습니다.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@renovate.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleAdminLogin} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? '로그인 중...' : '관리자 로그인'}
            </Button>
            
            <Button 
              onClick={handleCreateAdmin} 
              variant="outline" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? '생성 중...' : '관리자 계정 생성'}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>기본 관리자 계정: admin@renovate.com</p>
            <p>계정이 없다면 "관리자 계정 생성" 버튼을 클릭하세요.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
