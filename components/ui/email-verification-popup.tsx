'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Mail, CheckCircle } from 'lucide-react'

interface EmailVerificationPopupProps {
  isOpen: boolean
  onClose: () => void
  email: string
  userType: 'CUSTOMER' | 'CONTRACTOR'
}

export function EmailVerificationPopup({ isOpen, onClose, email, userType }: EmailVerificationPopupProps) {
  const [isResent, setIsResent] = useState(false)

  if (!isOpen) return null

  const handleResendEmail = async () => {
    try {
      // 이메일 재전송 로직 (필요시 구현)
      setIsResent(true)
      setTimeout(() => setIsResent(false), 3000)
    } catch (error) {
      console.error('Failed to resend email:', error)
    }
  }

  const handleClose = () => {
    onClose()
    // 팝업 닫기 후 사용자 유형에 따라 리다이렉션
    if (userType === 'CUSTOMER') {
      window.location.href = '/request'
    } else {
      window.location.href = '/contractor-onboarding'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            이메일을 확인해주세요
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <p className="text-gray-600">
              <span className="font-medium text-gray-900">{email}</span>로<br/>
              확인 이메일을 전송했습니다.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">다음 단계:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1 text-left">
                    <li>이메일함을 확인하세요</li>
                    <li>확인 링크를 클릭하세요</li>
                    <li>계정 활성화가 완료됩니다</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleResendEmail} 
              variant="outline" 
              className="w-full"
              disabled={isResent}
            >
              {isResent ? '이메일 재전송됨' : '이메일 재전송'}
            </Button>
            
            <Button onClick={handleClose} className="w-full">
              {userType === 'CUSTOMER' ? '견적 요청하기' : '업체 등록 계속하기'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              이메일을 받지 못하셨나요? 스팸함을 확인해보세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
