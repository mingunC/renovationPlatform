'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase' // 1. 올바른 import만 남깁니다.
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmailVerificationPopup } from '@/components/ui/email-verification-popup'
import { GoogleLoginButton } from '@/components/auth/google-login-button'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/^(?=.*\d)/, 'Password must contain at least one number')
    .regex(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  userType: 'CUSTOMER'
}

export function RegisterForm({ userType }: RegisterFormProps) {
  const supabase = createClient() // 2. 컴포넌트 안에서 supabase 클라이언트를 생성합니다.
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const router = useRouter()
  
  // 비밀번호 강도 계산 함수
  const getPasswordStrength = (password: string) => {
    let score = 0
    const feedback = []
    
    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[@$!%*?&]/.test(password)) score += 1
    
    if (score < 2) return { strength: 'weak', color: 'text-red-500', bgColor: 'bg-red-100' }
    if (score < 4) return { strength: 'medium', color: 'text-yellow-500', bgColor: 'bg-yellow-100' }
    return { strength: 'strong', color: 'text-green-500', bgColor: 'bg-green-100' }
  }
  
  const passwordStrength = getPasswordStrength(password)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 3. 이제 생성된 supabase 클라이언트를 사용합니다.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            user_type: userType,
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false) // 에러 발생 시 로딩 상태 해제
        return
      }

      if (authData.user) {
        // 데이터베이스에 사용자 프로필 생성
        const response = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            type: userType,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Profile creation failed:', response.status, errorData)
          throw new Error(`Failed to create user profile: ${response.status} - ${errorData.error || 'Unknown error'}`)
        }

        const profileData = await response.json()
        console.log('User profile created successfully:', profileData)

        // 이메일 확인 팝업 표시
        setRegisteredEmail(data.email)
        setShowEmailVerification(true)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Google 로그인 버튼을 맨 위에 배치 */}
      <GoogleLoginButton
        onSuccess={(data) => {
          // Google 로그인 성공 시 대시보드로 이동
          router.push('/dashboard')
        }}
        onError={(error) => {
          setError(`Google 로그인 실패: ${error}`)
        }}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">또는</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('password')}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* 비밀번호 강도 표시기 */}
        {password && (
          <div className={`p-2 rounded text-sm ${passwordStrength.bgColor}`}>
            <span className={`font-medium ${passwordStrength.color}`}>
              Password Strength: {passwordStrength.strength.toUpperCase()}
            </span>
            <div className="mt-1 text-xs text-gray-600">
              Requirements: 8+ characters, uppercase, lowercase, number, special character
            </div>
          </div>
        )}
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : `Create ${userType === 'CUSTOMER' ? 'Homeowner' : 'Contractor'} Account`}
      </Button>
          </form>

      {/* 이메일 확인 팝업 */}
      <EmailVerificationPopup
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        email={registeredEmail}
        userType={userType}
      />
    </>
  )
}