'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, Building2, ArrowLeft } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AddContractorPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    business_name: '',
    business_number: '',
    business_license_number: '',
    service_areas: [] as string[],
    categories: [] as string[],
    password: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const serviceAreaOptions = [
    'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton',
    'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'
  ]

  const categoryOptions = [
    'KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING',
    'OTHER', 'OFFICE', 'RETAIL', 'CAFE_RESTAURANT', 'EDUCATION',
    'HOSPITALITY_HEALTHCARE'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/contractors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const responseData = await response.json()
        setMessage({ 
          type: 'success', 
          text: '업체가 성공적으로 추가되었습니다!' 
        })
        
        // 폼 초기화
        setFormData({
          email: '',
          name: '',
          phone: '',
          business_name: '',
          business_number: '',
          business_license_number: '',
          service_areas: [],
          categories: [],
          password: '',
          notes: ''
        })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || '업체 추가에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '업체 추가 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleMultiSelect = (field: 'service_areas' | 'categories', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">업체 추가</h1>
          <p className="text-gray-600 mt-2">새로운 업체를 시스템에 추가합니다.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span>업체 정보 입력</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contractor@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">담당자명 *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="홍길동"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">연락처 *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="010-1234-5678"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_name">업체명</Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    type="text"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    placeholder="(주)리노베이트"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_number">사업자번호</Label>
                  <Input
                    id="business_number"
                    name="business_number"
                    type="text"
                    value={formData.business_number}
                    onChange={handleInputChange}
                    placeholder="123-45-67890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_license_number">사업자등록번호</Label>
                  <Input
                    id="business_license_number"
                    name="business_license_number"
                    type="text"
                    value={formData.business_license_number}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                  />
                </div>
              </div>

              {/* 서비스 지역 */}
              <div className="space-y-3">
                <Label>서비스 지역 *</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {serviceAreaOptions.map((area) => (
                    <label key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.service_areas.includes(area)}
                        onChange={() => handleMultiSelect('service_areas', area)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 전문 분야 */}
              <div className="space-y-3">
                <Label>전문 분야 *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categoryOptions.map((category) => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => handleMultiSelect('categories', category)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="text"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="업체 계정 비밀번호 (비워두면 자동 생성)"
                />
                <p className="text-sm text-gray-500">
                  비밀번호를 입력하지 않으면 자동으로 생성됩니다.
                </p>
              </div>

              {/* 메모 */}
              <div className="space-y-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="업체에 대한 추가 정보나 특이사항을 입력하세요"
                  rows={3}
                />
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

              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={loading}
                >
                  {loading ? '추가 중...' : '업체 추가'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
