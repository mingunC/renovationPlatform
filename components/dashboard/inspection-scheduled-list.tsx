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
  inspection_time?: string
  notes?: string
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
      console.log('🔍 Fetching inspection requests...')
      // 현장 방문에 참여하기로 한 프로젝트들만 가져오기
      const response = await fetch('/api/contractor/inspection-interest')
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 API Response:', data)
        
        if (data.success && data.data) {
          console.log('📋 Raw inspection interests:', data.data)
          console.log('📋 Data structure check:', {
            success: data.success,
            dataType: typeof data.data,
            isArray: Array.isArray(data.data),
            length: Array.isArray(data.data) ? data.data.length : 'N/A',
            firstItem: Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : 'N/A'
          })
          
          // will_participate가 true이고 현장 방문 단계인 프로젝트들만 필터링
          const participatingRequests = data.data
            .filter((interest: any) => {
              // 현장 방문 참여 의사가 있고
              const hasParticipation = interest.will_participate === true
              // 프로젝트 상태가 현장 방문 단계인 경우만 (BIDDING_OPEN 제외)
              const isInspectionPhase = interest.request.status === 'INSPECTION_PENDING' || 
                                       interest.request.status === 'INSPECTION_SCHEDULED'
              
              console.log(`🔍 Project ${interest.request.id}: status=${interest.request.status}, will_participate=${interest.will_participate}, isInspectionPhase=${isInspectionPhase}`)
              
              return hasParticipation && isInspectionPhase
            })
            .map((interest: any) => ({
              ...interest.request,
              inspection_interest: {
                will_participate: interest.will_participate,
                created_at: interest.created_at
              }
            }))
          
          console.log('🔍 Filtered participating requests:', participatingRequests.map((r: any) => ({
            id: r.id,
            status: r.status,
            inspection_date: r.inspection_date,
            will_participate: r.inspection_interest?.will_participate
          })))
          
          console.log('✅ Filtered participating requests:', participatingRequests)
          setRequests(participatingRequests)
        } else {
          console.log('❌ API response structure invalid:', data)
          setRequests([])
        }
      } else {
        console.error('❌ API response not ok:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error details:', errorData)
      }
    } catch (error) {
      console.error('❌ Error fetching inspection requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelParticipation = async (requestId: string) => {
    setSubmittingInterest(requestId)
    try {
      const response = await fetch('/api/contractor/inspection-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          will_participate: false,
        }),
      })

      if (response.ok) {
        // 성공적으로 취소된 경우
        const successMessage = '❌ 현장 방문 참여가 취소되었습니다. 프로젝트가 새 요청 탭으로 이동됩니다.'
        
        // 성공 알림 표시
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300'
        notification.textContent = successMessage
        document.body.appendChild(notification)
        
        // 3초 후 알림 제거
        setTimeout(() => {
          notification.style.opacity = '0'
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 300)
        }, 3000)
        
        await fetchInspectionRequests() // 목록 새로고침
      } else {
        const errorData = await response.json()
        console.error('Error canceling participation:', errorData)
        
        // 에러 알림 표시
        const errorNotification = document.createElement('div')
        errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300'
        errorNotification.textContent = '참여 취소 중 오류가 발생했습니다.'
        document.body.appendChild(errorNotification)
        
        // 5초 후 알림 제거
        setTimeout(() => {
          errorNotification.style.opacity = '0'
          setTimeout(() => {
            document.body.removeChild(errorNotification)
          }, 300)
        }, 5000)
      }
    } catch (error) {
      console.error('Error canceling participation:', error)
      // 네트워크 에러 알림 표시
      const networkErrorNotification = document.createElement('div')
      networkErrorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300'
      networkErrorNotification.textContent = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.'
      document.body.appendChild(networkErrorNotification)
      
      // 5초 후 알림 제거
      setTimeout(() => {
        networkErrorNotification.style.opacity = '0'
        setTimeout(() => {
          document.body.removeChild(networkErrorNotification)
        }, 300)
      }, 5000)
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">현장 방문 예정인 프로젝트가 없습니다</h3>
          <p className="text-gray-600">새 요청 탭에서 현장 방문에 참여하기로 한 프로젝트가 여기에 표시됩니다.</p>
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
          현장 방문에 참여하기로 한 프로젝트들입니다. 현장 방문 준비를 하고 필요시 참여를 취소할 수 있습니다.
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
                    <div className="flex items-center space-x-4 mb-2">
                      <p className="text-blue-800 font-bold text-lg">
                        📅 {formatDate(request.inspection_date)}
                      </p>
                      {request.inspection_time && (
                        <p className="text-blue-700 font-medium">
                          🕐 {request.inspection_time}
                        </p>
                      )}
                    </div>
                    <p className="text-blue-700 text-sm">
                      📍 {request.address}
                    </p>
                  </div>

                  {/* 관리자 메모 */}
                  {request.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium text-yellow-900">관리자 메모</span>
                      </div>
                      <p className="text-yellow-800 text-sm leading-relaxed">
                        {request.notes}
                      </p>
                    </div>
                  )}

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
                  <Button 
                    onClick={() => handleCancelParticipation(request.id)}
                    disabled={submittingInterest === request.id}
                    variant="outline" 
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    size="sm"
                  >
                    {submittingInterest === request.id ? '처리중...' : '❌ 참여 취소'}
                  </Button>
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
