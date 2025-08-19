'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!email) {
      setMessage({
        type: 'error',
        text: '이메일 주소를 입력해주세요.'
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || '비밀번호 재설정 링크가 발송되었습니다. 이메일을 확인해주세요.'
        })
        setEmail('')
      } else {
        // Rate limit 에러 특별 처리
        if (response.status === 429 && data.code === 'RATE_LIMIT') {
          setMessage({
            type: 'error',
            text: data.error || '보안을 위해 잠시 후 다시 시도해주세요. (약 30초 대기 필요)'
          })
        } else {
          setMessage({
            type: 'error',
            text: data.error || '비밀번호 재설정 링크 발송에 실패했습니다.'
          })
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setMessage({
        type: 'error',
        text: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            🔐 비밀번호 찾기
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-gray-600">
              가입한 이메일 주소를 입력하시면<br/>
              비밀번호 재설정 링크를 발송해드립니다.
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
                placeholder="example@email.com"
                required
              />
            </div>

            {message && (
              <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? '발송 중...' : '재설정 링크 발송'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <div>
              <Link 
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← 로그인 페이지로 돌아가기
              </Link>
            </div>
            
            <div>
              <Link 
                href="/auth/register"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                계정이 없으신가요? 회원가입하기
              </Link>
            </div>
          </div>

          {message?.type === 'success' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📧 다음 단계</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>이메일을 확인해주세요</li>
                <li>비밀번호 재설정 링크를 클릭하세요</li>
                <li>새로운 비밀번호를 입력하세요</li>
                <li>새 비밀번호로 로그인하세요</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
