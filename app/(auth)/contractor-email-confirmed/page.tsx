'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, Building2, ArrowRight } from 'lucide-react'

export default function ContractorEmailConfirmedPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // URL에서 이메일 파라미터 확인
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleConfirmEmail = async () => {
    if (!email) {
      setMessage({ type: 'error', text: '이메일 정보를 찾을 수 없습니다.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/contractors/confirm-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const responseData = await response.json()
        setMessage({ 
          type: 'success', 
          text: '이메일이 확인되었습니다! 이제 업체 온보딩을 진행할 수 있습니다.' 
        })
        
        // 3초 후 온보딩 페이지로 이동
        setTimeout(() => {
          router.push('/contractor-onboarding')
        }, 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || '이메일 확인에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '이메일 확인 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoToOnboarding = () => {
    router.push('/contractor-onboarding')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">이메일 확인 완료!</CardTitle>
          <p className="text-gray-600 mt-2">
            업체 계정이 활성화되었습니다
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {email && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">확인된 이메일</p>
              <p className="font-medium text-blue-900">{email}</p>
            </div>
          )}

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

          <div className="space-y-3">
            <Button 
              onClick={handleConfirmEmail}
              className="w-full" 
              disabled={loading}
            >
              {loading ? '확인 중...' : '이메일 확인 완료'}
            </Button>
            
            {message?.type === 'success' && (
              <Button 
                onClick={handleGoToOnboarding}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Building2 className="w-4 h-4 mr-2" />
                업체 온보딩 시작
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>이메일 확인이 완료되면 업체 온보딩을 진행할 수 있습니다.</p>
            <p className="mt-1">온보딩에서는 업체 정보, 서비스 지역, 전문 분야를 설정합니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
