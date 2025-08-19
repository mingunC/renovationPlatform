'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RequestData {
  category: string
  budget_range: string
  timeline: string
  postal_code: string
  description: string
  photos?: string[]
}

function SuccessContent() {
  const [requestData, setRequestData] = useState<RequestData | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('id')

  useEffect(() => {
    const fetchRequestData = async () => {
      if (!requestId) {
        router.push('/request')
        return
      }

      // Fetch request data from API
      try {
        const response = await fetch(`/api/requests/${requestId}`)
        if (response.ok) {
          const data = await response.json()
          setRequestData(data.request)
        } else {
          console.error('Failed to fetch request:', response.status)
        }
      } catch (error) {
        console.error('Error fetching request:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequestData()
  }, [requestId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">요청 세부사항을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!requestData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">요청을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6">리노베이션 요청을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/request')}>
            새 요청 제출하기
          </Button>
        </div>
      </div>
    )
  }

  const formatCategoryName = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase()
  }

  const formatBudgetRange = (range: string) => {
    switch (range) {
      case 'UNDER_50K':
        return '50만원 미만'
      case 'RANGE_50_100K':
        return '50만원 - 100만원'
      case 'OVER_100K':
        return '100만원 이상'
      default:
        return range
    }
  }

  const formatTimeline = (timeline: string) => {
    switch (timeline) {
      case 'ASAP':
        return '가능한 빨리'
      case 'WITHIN_1MONTH':
        return '1개월 이내'
      case 'WITHIN_3MONTHS':
        return '3개월 이내'
      case 'PLANNING':
        return '계획 단계'
      default:
        return timeline
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            견적 요청이 성공적으로 제출되었습니다!
          </h1>

        </div>

        {/* Request Details Card */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="flex items-center justify-between text-xl">
              <span className="text-gray-800">요청 세부사항</span>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-4 py-2 text-sm font-semibold">
                요청 #{requestId?.slice(-8).toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              리노베이션 요청 요약입니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  프로젝트 유형
                </h3>
                <p className="text-gray-700 font-medium">{formatCategoryName(requestData.category)} 리노베이션</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  예산 범위
                </h3>
                <p className="text-gray-700 font-medium">{formatBudgetRange(requestData.budget_range)}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  공사 기간
                </h3>
                <p className="text-gray-700 font-medium">{formatTimeline(requestData.timeline)}</p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  위치
                </h3>
                <p className="text-gray-700 font-medium">{requestData.postal_code}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                프로젝트 설명
              </h3>
              <p className="text-gray-700 leading-relaxed">{requestData.description}</p>
            </div>

            {requestData.photos && requestData.photos.length > 0 && (
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                  사진 ({requestData.photos.length}장)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {requestData.photos.map((photo: string, index: number) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                      <img
                        src={photo}
                        alt={`프로젝트 사진 ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <CardTitle className="text-xl text-gray-800">다음 단계는 무엇인가요?</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              앞으로 며칠 동안 기대할 수 있는 내용입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">현장 방문</h4>
                  <p className="text-gray-600 leading-relaxed">
                    귀하의 프로젝트에 관심이 있는 업체들이 현장 방문을 할 예정입니다.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">견적서 수신</h4>
                  <p className="text-gray-600 leading-relaxed">
                    현장 방문 다음 날 부터 7일 간 현장 방문을 한 업체들로부터 상세한 견적서를 받을 수 있습니다.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">비교 및 선택</h4>
                  <p className="text-gray-600 leading-relaxed">
                    제안서를 검토하고, 평점을 확인하여 귀하의 요구사항에 가장 적합한 업체를 선택하세요.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            onClick={() => router.push('/my-projects')}
            className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>내 프로젝트 보기</span>
          </Button>
          

        </div>

        {/* Contact Information */}
        <div className="mt-16 text-center">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">도움이 필요하신가요?</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                저희 팀이 리노베이션 과정 전반에 걸쳐 도움을 드립니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a href="mailto:support@renovateplatform.com" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    📧
                  </span>
                  <span>support@renovateplatform.com</span>
                </a>
                <a href="tel:+15551234567" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    📞
                  </span>
                  <span>(555) 123-4567</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
