'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface InspectionRequest {
  id: string
  category: string
  budget_range: string
  postal_code: string
  address: string
  description: string
  inspection_date: string
  created_at: string
  customer: {
    name: string
  }
  inspection_interest?: {
    will_participate: boolean
    created_at: string
  }
}

export function InspectionScheduledList() {
  const [requests, setRequests] = useState<InspectionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingInterest, setSubmittingInterest] = useState<string | null>(null)

  useEffect(() => {
    fetchInspectionRequests()
  }, [])

  const fetchInspectionRequests = async () => {
    try {
      const response = await fetch('/api/requests?status=INSPECTION_SCHEDULED')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching inspection requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInspectionInterest = async (requestId: string, willParticipate: boolean) => {
    setSubmittingInterest(requestId)
    try {
      const response = await fetch('/api/contractor/inspection-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          will_participate: willParticipate,
        }),
      })

      if (response.ok) {
        // 성공적으로 제출된 경우 목록 새로고침
        await fetchInspectionRequests()
      } else {
        const errorData = await response.json()
        console.error('Error submitting inspection interest:', errorData)
        // TODO: 에러 토스트 표시
      }
    } catch (error) {
      console.error('Error submitting inspection interest:', error)
      // TODO: 네트워크 에러 토스트 표시
    } finally {
      setSubmittingInterest(null)
    }
  }

  const formatCategory = (category: string): string => {
    return category.charAt(0) + category.slice(1).toLowerCase()
  }

  const formatBudgetRange = (range: string): string => {
    switch (range) {
      case 'UNDER_50K': return 'Under $50K'
      case 'RANGE_50_100K': return '$50K - $100K'
      case 'OVER_100K': return 'Over $100K'
      default: return range
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-CA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'KITCHEN': return '🍳'
      case 'BATHROOM': return '🚿'
      case 'BASEMENT': return '🏠'
      case 'FLOORING': return '🏗️'
      case 'PAINTING': return '🎨'
      case 'OTHER': return '🔧'
      default: return '📋'
    }
  }

  const getInspectionStatus = (inspectionDate: string, interest?: { will_participate: boolean }) => {
    const date = new Date(inspectionDate)
    const now = new Date()
    const isUpcoming = date > now

    if (interest) {
      return {
        text: interest.will_participate ? '참여 확정' : '참여 안함',
        color: interest.will_participate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
        icon: interest.will_participate ? '✅' : '❌'
      }
    }

    if (!isUpcoming) {
      return {
        text: '마감됨',
        color: 'bg-gray-100 text-gray-800',
        icon: '⏰'
      }
    }

    return {
      text: '응답 대기',
      color: 'bg-amber-100 text-amber-800',
      icon: '⏳'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">현장 방문 대기 중인 요청이 없습니다</h3>
          <p className="text-gray-600">새로운 현장 방문 일정이 설정되면 여기에 표시됩니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 안내 메시지 */}
      <Alert>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <AlertDescription>
          현장 방문 일정이 설정된 프로젝트들입니다. 참여 의사를 빠르게 표시하여 입찰 기회를 확보하세요.
        </AlertDescription>
      </Alert>

      {/* 요청 목록 */}
      {requests.map((request) => {
        const status = getInspectionStatus(request.inspection_date, request.inspection_interest)
        const canRespond = !request.inspection_interest && new Date(request.inspection_date) > new Date()

        return (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 프로젝트 헤더 */}
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getCategoryIcon(request.category)}</span>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {formatCategory(request.category)} 리노베이션
                      </h3>
                      <p className="text-sm text-gray-600">by {request.customer.name}</p>
                    </div>
                    <Badge variant="secondary" className={status.color}>
                      {status.icon} {status.text}
                    </Badge>
                  </div>

                  {/* 현장 방문 일정 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-blue-900">현장 방문 일정</span>
                    </div>
                    <p className="text-blue-800 font-bold text-lg">
                      {formatDate(request.inspection_date)}
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      📍 {request.address}
                    </p>
                  </div>

                  {/* 프로젝트 정보 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">예산</p>
                      <Badge variant="secondary" className="mt-1">
                        {formatBudgetRange(request.budget_range)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">위치</p>
                      <p className="text-sm font-medium text-gray-900">{request.postal_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">등록일</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                    {request.description}
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="ml-4 flex flex-col space-y-2">
                  {canRespond ? (
                    <>
                      <Button 
                        onClick={() => handleInspectionInterest(request.id, true)}
                        disabled={submittingInterest === request.id}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        {submittingInterest === request.id ? '처리중...' : '✅ 참여하기'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleInspectionInterest(request.id, false)}
                        disabled={submittingInterest === request.id}
                        size="sm"
                      >
                        ❌ 불참
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      {request.inspection_interest ? '응답 완료' : '마감됨'}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    상세보기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
