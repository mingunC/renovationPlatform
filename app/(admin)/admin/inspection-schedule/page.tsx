'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { 
  Calendar,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  X
} from 'lucide-react'

interface InspectionRequest {
  id: string
  category: string
  property_type: string
  budget_range: string
  timeline: string
  address: string
  description: string
  status: string
  created_at: string
  customer: {
    name: string
    email: string
    phone: string
  }
  _count: {
    bids: number
  }
  inspection_date?: string
  inspection_time?: string
  notes?: string
  inspection_interests: Array<{
    id: string
    will_participate: boolean
    created_at: string
    contractor: {
      id: string
      business_name: string
      user: {
        id: string
        name: string
        email: string
      }
    }
  }>
}

interface InspectionStats {
  total_pending: number
  scheduled_today: number
  scheduled_this_week: number
  total_contractors_interested: number
}

export default function InspectionSchedulePage() {
  const [requests, setRequests] = useState<InspectionRequest[]>([])
  const [stats, setStats] = useState<InspectionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<InspectionRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [filterStatus, setFilterStatus] = useState('INSPECTION_PENDING')

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchInspectionRequests()
      fetchInspectionStats()
    }
  }, [isAuthenticated, filterStatus])

  const checkAdminAuth = async () => {
    try {
      console.log('Checking admin authentication...')
      const response = await fetch('/api/auth/check-admin-session', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        setIsAuthenticated(true)
        console.log('Admin authentication successful')
      } else {
        console.log('Admin authentication failed')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Admin authentication error:', error)
      setIsAuthenticated(false)
    }
  }

  const fetchInspectionRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/schedule-inspection?status=${filterStatus}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('Inspection requests API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Inspection requests data:', data)
        console.log('First request inspection_interests:', data.requests?.[0]?.inspection_interests)
        setRequests(data.requests || [])
      } else {
        console.error('Failed to fetch inspection requests:', response.status)
        setMessage({ type: 'error', text: '현장 방문 요청을 불러오는데 실패했습니다.' })
      }
    } catch (error) {
      console.error('Failed to fetch inspection requests:', error)
      setMessage({ type: 'error', text: '현장 방문 요청을 불러오는데 실패했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const fetchInspectionStats = async () => {
    try {
      const response = await fetch('/api/admin/inspection-stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('Inspection stats API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Inspection stats data:', data)
        setStats(data.stats)
      } else {
        console.error('Failed to fetch inspection stats:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch inspection stats:', error)
    }
  }

  const openDetailModal = (request: InspectionRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedRequest(null)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'default'
      case 'INSPECTION_PENDING':
        return 'secondary'
      case 'INSPECTION_SCHEDULED':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '신규 요청'
      case 'INSPECTION_PENDING':
        return '현장 방문 대기'
      case 'INSPECTION_SCHEDULED':
        return '현장 방문 일정 설정'
      default:
        return status
    }
  }

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'KITCHEN':
        return '주방'
      case 'BATHROOM':
        return '욕실'
      case 'LIVING_ROOM':
        return '거실'
      case 'BEDROOM':
        return '침실'
      case 'BASEMENT':
        return '지하실'
      case 'ATTIC':
        return '다락방'
      case 'GARAGE':
        return '차고'
      case 'DECK':
        return '데크'
      case 'POOL':
        return '수영장'
      case 'LANDSCAPING':
        return '조경'
      case 'ROOFING':
        return '지붕'
      case 'WINDOWS':
        return '창문'
      case 'DOORS':
        return '문'
      case 'ELECTRICAL':
        return '전기'
      case 'PLUMBING':
        return '배관'
      case 'HVAC':
        return '난방/냉방'
      case 'PAINTING':
        return '페인팅'
      case 'FLOORING':
        return '바닥재'
      case 'OTHER':
        return '기타'
      default:
        return category
    }
  }

  const getBudgetRangeDisplay = (budgetRange: string) => {
    switch (budgetRange) {
      case 'RANGE_10_25K':
        return '1-2.5만 달러'
      case 'RANGE_25_50K':
        return '2.5-5만 달러'
      case 'RANGE_50_100K':
        return '5-10만 달러'
      case 'RANGE_100_250K':
        return '10-25만 달러'
      case 'RANGE_250_500K':
        return '25-50만 달러'
      case 'RANGE_500K_1M':
        return '50-100만 달러'
      case 'RANGE_1M_PLUS':
        return '100만 달러 이상'
      default:
        return budgetRange
    }
  }

  const getTimelineDisplay = (timeline: string) => {
    switch (timeline) {
      case 'ASAP':
        return '즉시'
      case 'WITHIN_1MONTH':
        return '1개월 이내'
      case 'WITHIN_3MONTHS':
        return '3개월 이내'
      case 'WITHIN_6MONTHS':
        return '6개월 이내'
      case 'WITHIN_1YEAR':
        return '1년 이내'
      case 'FLEXIBLE':
        return '유연함'
      default:
        return timeline
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '날짜 없음'
    try {
      return new Date(dateString).toLocaleDateString('ko-KR')
    } catch {
      return '날짜 오류'
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return '시간 없음'
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '시간 오류'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600">관리자 계정으로 로그인해주세요.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">현장 방문 일정 관리</h1>
        <Button onClick={fetchInspectionRequests} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">대기 중</p>
                  <p className="text-2xl font-bold">{stats.total_pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">오늘 방문</p>
                  <p className="text-2xl font-bold">{stats.scheduled_today}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">이번 주</p>
                  <p className="text-2xl font-bold">{stats.scheduled_this_week}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">참여 업체</p>
                  <p className="text-2xl font-bold">{stats.total_contractors_interested}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 에러 메시지 */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* 현장 방문 요청 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>현장 방문 요청 목록 ({requests.length}개)</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">상태별 필터:</span>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">전체</option>
                <option value="OPEN">신규 요청</option>
                <option value="INSPECTION_PENDING">현장 방문 대기</option>
                <option value="INSPECTION_SCHEDULED">현장 방문 일정 설정</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  {/* 프로젝트 정보 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-4">
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {getStatusDisplayName(request.status)}
                      </Badge>
                      <span className="text-sm text-gray-500">ID: {request.id}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{getCategoryDisplayName(request.category || 'Unknown')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{getBudgetRangeDisplay(request.budget_range || 'Unknown')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{getTimelineDisplay(request.timeline || 'Unknown')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{request.address || '주소 없음'}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {request.description || '설명 없음'}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>고객: {request.customer?.name || 'Unknown'}</span>
                      <span>입찰: {request._count?.bids || 0}개</span>
                      <span>생성일: {formatDate(request.created_at)}</span>
                      {request.inspection_date && (
                        <span>방문일: {formatDate(request.inspection_date)}</span>
                      )}
                      {request.inspection_time && (
                        <span>방문시간: {formatTime(request.inspection_time)}</span>
                      )}
                    </div>

                    {/* 참여 희망 업체 정보 */}
                    {request.inspection_interests && request.inspection_interests.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">참여 희망 업체 ({request.inspection_interests.length}개)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {request.inspection_interests.map((interest, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              <span className="font-medium">{interest.contractor?.business_name || 'Unknown'}</span>
                              <span className="ml-2">({interest.contractor?.user?.name || 'Unknown'})</span>
                              {interest.will_participate && (
                                <Badge variant="outline" className="ml-2 text-xs">참여 확정</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => openDetailModal(request)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      상세보기
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {requests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>현장 방문 대기 또는 일정이 설정된 프로젝트가 없습니다.</p>
                <p className="text-sm">필터를 변경하거나 새 프로젝트를 확인해보세요.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">프로젝트 상세 정보</h3>
              <Button variant="ghost" size="sm" onClick={closeDetailModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">프로젝트 ID</Label>
                  <p className="text-sm text-gray-900">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">상태</Label>
                  <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>
                    {getStatusDisplayName(selectedRequest.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">카테고리</Label>
                  <p className="text-sm text-gray-900">{getCategoryDisplayName(selectedRequest.category || 'Unknown')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">예산 범위</Label>
                  <p className="text-sm text-gray-900">{getBudgetRangeDisplay(selectedRequest.budget_range || 'Unknown')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">타임라인</Label>
                  <p className="text-sm text-gray-900">{getTimelineDisplay(selectedRequest.timeline || 'Unknown')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">생성일</Label>
                  <p className="text-sm text-gray-900">{formatDate(selectedRequest.created_at)}</p>
                </div>
              </div>

              {/* 주소 */}
              <div>
                <Label className="text-sm font-medium text-gray-700">주소</Label>
                <p className="text-sm text-gray-900">{selectedRequest.address || '주소 없음'}</p>
              </div>

              {/* 설명 */}
              <div>
                <Label className="text-sm font-medium text-gray-700">프로젝트 설명</Label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.description || '설명 없음'}</p>
              </div>

              {/* 고객 정보 */}
              <div>
                <Label className="text-sm font-medium text-gray-700">고객 정보</Label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-900">이름: {selectedRequest.customer?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-900">이메일: {selectedRequest.customer?.email || 'Unknown'}</p>
                  <p className="text-sm text-gray-900">전화번호: {selectedRequest.customer?.phone || 'Unknown'}</p>
                </div>
              </div>

              {/* 현장 방문 정보 */}
              {(selectedRequest.inspection_date || selectedRequest.inspection_time || selectedRequest.notes) && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">현장 방문 정보</Label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    {selectedRequest.inspection_date && (
                      <p className="text-sm text-gray-900">방문일: {formatDate(selectedRequest.inspection_date)}</p>
                    )}
                    {selectedRequest.inspection_time && (
                      <p className="text-sm text-gray-900">방문시간: {formatTime(selectedRequest.inspection_time)}</p>
                    )}
                    {selectedRequest.notes && (
                      <p className="text-sm text-gray-900">메모: {selectedRequest.notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 참여 희망 업체 */}
              {selectedRequest.inspection_interests && selectedRequest.inspection_interests.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">참여 희망 업체 ({selectedRequest.inspection_interests.length}개)</Label>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    {selectedRequest.inspection_interests.map((interest, index) => (
                      <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                        <p className="text-sm font-medium text-gray-900">{interest.contractor?.business_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-600">담당자: {interest.contractor?.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-600">이메일: {interest.contractor?.user?.email || 'Unknown'}</p>
                        <p className="text-xs text-gray-600">참여 확정: {interest.will_participate ? '예' : '아니오'}</p>
                        <p className="text-xs text-gray-600">등록일: {formatDate(interest.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={closeDetailModal} variant="outline">
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

