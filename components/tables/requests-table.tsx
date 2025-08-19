'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, MapPin, Calendar, DollarSign, Clock, Image as ImageIcon, Eye, EyeOff, FileText, User } from 'lucide-react'
import { ProjectPhotos } from '@/components/ui/project-photos'

interface RenovationRequest {
  id: string
  category: string
  budget_range: string
  timeline: string
  postal_code: string
  address: string
  description: string
  photos: string[]
  status: string
  inspection_date?: string | null
  created_at: string
  _count: {
    bids: number
    inspection_interests?: number // Added for inspection interests count
  }
  customer?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  distance?: string
}

interface RequestsTableProps {
  status?: string
  isMyProjects?: boolean // my-projects 페이지 여부
  additionalStatuses?: string[] // 추가로 가져올 상태들
}

export function RequestsTable({ status, isMyProjects = false, additionalStatuses = [] }: RequestsTableProps) {
  const [requests, setRequests] = useState<RenovationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  
  // Helper functions
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'OPEN': return '견적요청 등록'
      case 'INSPECTION_PENDING': return '현장방문 대기'
      case 'INSPECTION_SCHEDULED': return '현장방문 예정'
      case 'BIDDING_OPEN': return '입찰 진행중'
      case 'BIDDING_CLOSED': return '입찰 마감'
      case 'CONTRACTOR_SELECTED': return '업체 선택됨'
      case 'COMPLETED': return '완료'
      default: return status
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'OPEN':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'INSPECTION_PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'INSPECTION_SCHEDULED':
        return `${baseClasses} bg-orange-100 text-orange-800`
      case 'BIDDING_OPEN':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'BIDDING_CLOSED':
        return `${baseClasses} bg-gray-100 text-gray-800`
      case 'CONTRACTOR_SELECTED':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'COMPLETED':
        return `${baseClasses} bg-emerald-100 text-emerald-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatBudgetRange = (range: string): string => {
    switch (range) {
      case 'UNDER_50K': return 'Under $50K'
      case 'RANGE_50_100K': return '$50K - $100K'
      case 'OVER_100K': return 'Over $100K'
      default: return range
    }
  }

  const formatTimeline = (timeline: string): string => {
    switch (timeline) {
      case 'ASAP': return 'ASAP'
      case 'WITHIN_1MONTH': return 'Within 1 month'
      case 'WITHIN_3MONTHS': return 'Within 3 months'
      case 'PLANNING': return 'Planning'
      default: return timeline
    }
  }

  const formatCategory = (category: string): string => {
    return category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return '오늘'
    if (diffInDays === 1) return '어제'
    if (diffInDays < 7) return `${diffInDays}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const formatInspectionDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const toggleCard = (requestId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId)
    } else {
      newExpanded.add(requestId)
    }
    setExpandedCards(newExpanded)
  }

  useEffect(() => {
      const fetchRequests = async () => {
    try {
      setLoading(true)
      
      // my-projects 페이지일 때는 additionalStatuses 사용
      let statusesToFetch = [status]
      if (isMyProjects && additionalStatuses.length > 0) {
        statusesToFetch = additionalStatuses
      } else if (isMyProjects && status === 'OPEN') {
        statusesToFetch = ['OPEN', 'INSPECTION_PENDING']
      }
      
      console.log('🔍 Fetching requests for statuses:', statusesToFetch)
      
      // my-projects 페이지일 때는 전용 API 사용
      if (isMyProjects) {
        const url = `/api/requests/my-projects?additionalStatuses=${statusesToFetch.join(',')}`
        console.log(`🔍 Fetching from my-projects API: ${url}`)
        const response = await fetch(url)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`📦 My-projects response:`, data.requests?.length || 0, 'requests')
          setRequests(data.requests || [])
          return
        } else {
          console.error(`❌ Failed to fetch from my-projects API:`, response.status)
          setError('Failed to fetch my projects')
          return
        }
      }
      
      // 일반 페이지일 때는 기존 API 사용
      const requestsPromises = statusesToFetch.map(async (statusFilter) => {
        const url = `/api/requests/public?status=${statusFilter}`
        console.log(`🔍 Fetching from public API: ${url}`)
        const response = await fetch(url)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`📦 Response for ${statusFilter}:`, data.requests?.length || 0, 'requests')
          return data.requests || []
        } else {
          console.error(`❌ Failed to fetch ${statusFilter}:`, response.status)
          return []
        }
      })
      
      const allResponses = await Promise.all(requestsPromises)
      
      // 모든 요청을 하나의 배열로 합치고 중복 제거
      const allRequests = allResponses.flat()
      const uniqueRequests = allRequests.filter((request, index, self) => 
        index === self.findIndex(r => r.id === request.id)
      )
      
      console.log('📦 Total unique requests:', uniqueRequests.length)
      console.log('📋 All requests:', uniqueRequests.map(req => ({ id: req.id, status: req.status, category: req.category })))
      
      setRequests(uniqueRequests)
    } catch (error) {
      console.error('❌ Error fetching requests:', error)
      setError('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

    fetchRequests()
  }, [status, isMyProjects])

  // Photos 데이터 변경 시 로깅
  useEffect(() => {
    if (requests.length > 0) {
      console.log('🔍 All requests photos data:', requests.map(req => ({ id: req.id, photos: req.photos })))
    }
  }, [requests])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <span className="ml-2 text-gray-600">견적요청서를 불러오는 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">❌ {error}</div>
        <Button onClick={() => window.location.reload()} variant="outline">
          다시 시도
        </Button>
      </div>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-amber-600 mb-4">✨ 아직 견적요청서가 없습니다</div>
        <p className="text-sm text-gray-400">새로운 견적요청서가 등록되면 여기에 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <Card key={request.id} className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0">
            {/* 헤더 영역 */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {formatCategory(request.category)} Renovation
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>by {request.customer?.name || 'Anonymous'}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0 shadow-sm">
                  {getStatusDisplayName(request.status)}
                </Badge>
              </div>

              {/* 현장 방문 일정 */}
              {request.inspection_date && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">현장 방문 일정</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900 mb-2">
                    {formatInspectionDate(request.inspection_date)}
                  </div>
                  <div className="flex items-center space-x-2 text-blue-700 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{request.address}</span>
                  </div>
                  {/* 현장 방문 참여 업체 수 */}
                  <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">👥</span>
                      </div>
                      <span className="text-sm font-medium text-blue-800">참여 업체</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-700">
                        {request._count.inspection_interests || 0}개
                      </div>
                      <div className="text-xs text-blue-600">
                        {(request._count.inspection_interests || 0) > 0 ? '업체 참여' : '아직 없음'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 토글 버튼 */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCard(request.id)}
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full px-4 py-2 transition-all duration-200"
                >
                  {expandedCards.has(request.id) ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      상세정보 접기
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      상세정보 보기
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 토글된 상세 정보 */}
            {expandedCards.has(request.id) && (
              <div className="border-t border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
                {/* 디버깅용 로그 */}
                
                {/* 주요 정보 요약 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">Budget</div>
                    <div className="bg-white rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm">
                      {formatBudgetRange(request.budget_range)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">Location</div>
                    <div className="bg-white rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm">
                      {request.postal_code}
                    </div>
                    {request.distance && (
                      <div className="text-xs text-gray-500 mt-1">{request.distance} away</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">Posted</div>
                    <div className="bg-white rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm">
                      {formatDate(request.created_at)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      {request.status === 'BIDDING_OPEN' ? '받은 견적서' : 'Timeline'}
                    </div>
                    <div className={`rounded-lg px-4 py-3 text-sm font-semibold shadow-sm ${
                      request.status === 'BIDDING_OPEN' 
                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200' 
                        : 'bg-white text-gray-800'
                    }`}>
                      {request.status === 'BIDDING_OPEN' ? (
                        <>
                          {request._count.bids}개
                          <div className="text-xs text-amber-600 mt-1">입찰 진행중</div>
                        </>
                      ) : (
                        <>
                          {formatTimeline(request.timeline || 'Unknown')}
                          <div className="text-xs text-gray-500 mt-1">완료 예정</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 첨부된 Photos */}
                  <div>
                    <ProjectPhotos photos={request.photos} title="첨부된 Photos" />
                  </div>

                  {/* 상세주소 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <MapPin className="w-5 h-5 text-amber-600 mr-2" />
                      상세주소
                    </h4>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">우편번호</div>
                      <div className="font-medium text-gray-800 mb-3">{request.postal_code}</div>
                      <div className="text-sm text-gray-600 mb-2">주소</div>
                      <div className="font-medium text-gray-800">{request.address}</div>
                    </div>
                  </div>
                </div>

                {/* 프로젝트 설명 */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-5 h-5 text-amber-600 mr-2" />
                    프로젝트 설명
                  </h4>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{request.description}</p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex justify-center space-x-3 mt-6">
                  {isMyProjects ? (
                    // my-projects 페이지: 상태에 따른 버튼
                    <>
                      {request.status === 'INSPECTION_SCHEDULED' && (
                        <Button 
                          variant="destructive" 
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => {
                            if (confirm('현장방문을 취소하시겠습니까? 프로젝트가 새요청 탭으로 이동합니다.')) {
                              // 비동기 작업을 별도 함수로 분리하여 에러 처리 개선
                              const cancelInspection = async () => {
                                try {
                                  const response = await fetch(`/api/requests/${request.id}/cancel-inspection`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json'
                                    }
                                  });
                                  
                                  if (response.ok) {
                                    const data = await response.json();
                                    alert(data.message);
                                    // 목록 새로고침 (에러 방지를 위한 안전한 방식)
                                    setTimeout(() => {
                                      try {
                                        window.location.reload();
                                      } catch (reloadError) {
                                        console.error('Reload error:', reloadError);
                                        // 새로고침 실패 시 수동으로 페이지 이동
                                        window.location.href = window.location.href;
                                      }
                                    }, 100);
                                  } else {
                                    const errorData = await response.json();
                                    alert(`취소 실패: ${errorData.error}`);
                                  }
                                } catch (error) {
                                  console.error('Error cancelling inspection:', error);
                                  alert('취소 중 오류가 발생했습니다.');
                                }
                              };
                              
                              // 비동기 작업 실행 (에러 처리 강화)
                              cancelInspection().catch(error => {
                                console.error('Unexpected error in cancelInspection:', error);
                                alert('예상치 못한 오류가 발생했습니다.');
                              });
                            }
                          }}
                        >
                          🚫 현장방문 취소
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="border-amber-200 text-amber-700 hover:bg-amber-50"
                        onClick={() => toggleCard(request.id)}
                      >
                        닫기
                      </Button>
                    </>
                  ) : (
                    // 일반 페이지: 상세보기, 입찰하기 버튼
                    <>
                      <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                        상세보기
                      </Button>
                      <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-md">
                        입찰하기
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
