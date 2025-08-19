'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
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
  Edit
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
    contractor: {
      user: {
        name: string
        email: string
      }
      company_name: string
    }
    will_participate: boolean
    created_at: string
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
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    inspection_date: '',
    notes: ''
  })
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
      console.log('Auth check response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        if (userData.success && userData.user) {
          console.log('Admin user authenticated:', userData.user)
          setIsAuthenticated(true)
        } else {
          console.error('Invalid admin session data:', userData)
          setMessage({ type: 'error', text: '관리자 인증이 필요합니다. 다시 로그인해주세요.' })
        }
      } else {
        console.error('Admin session check failed:', response.status)
        setMessage({ type: 'error', text: '관리자 인증이 필요합니다. 다시 로그인해주세요.' })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setMessage({ type: 'error', text: '인증 확인 중 오류가 발생했습니다.' })
    }
  }

  const fetchInspectionRequests = async () => {
    try {
      setLoading(true)
      console.log('Fetching inspection requests...')
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
        setRequests(data.data || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch inspection requests:', response.status, errorData)
        setMessage({ type: 'error', text: `현장 방문 요청을 불러오는데 실패했습니다: ${response.status}` })
      }
    } catch (error) {
      console.error('Error fetching inspection requests:', error)
      setMessage({ type: 'error', text: '현장 방문 요청을 불러오는 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const fetchInspectionStats = async () => {
    try {
      console.log('Fetching inspection stats...')
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
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch inspection stats:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error fetching inspection stats:', error)
    }
  }

  const handleScheduleInspection = async (requestId: string) => {
    try {
      console.log(`Scheduling inspection for request ${requestId}`)
      const response = await fetch(`/api/admin/requests/${requestId}/set-inspection-date`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleForm)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Inspection scheduled successfully:', data)
        setMessage({ type: 'success', text: '현장 방문 일정이 설정되었습니다.' })
        setShowScheduleModal(false)
        setSelectedRequest(null)
        setScheduleForm({ inspection_date: '', notes: '' })
        fetchInspectionRequests() // 목록 새로고침
        fetchInspectionStats() // 통계 새로고침
      } else {
        const errorData = await response.json()
        console.error('Failed to schedule inspection:', errorData)
        setMessage({ type: 'error', text: errorData.error || '현장 방문 일정 설정에 실패했습니다.' })
      }
    } catch (error) {
      console.error('Error scheduling inspection:', error)
      setMessage({ type: 'error', text: '현장 방문 일정 설정 중 오류가 발생했습니다.' })
    }
  }

  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      'INSPECTION_PENDING': '현장 방문 대기',
      'INSPECTION_SCHEDULED': '현장 방문 일정 설정됨',
      'BIDDING_OPEN': '입찰 진행중',
      'BIDDING_CLOSED': '입찰 마감',
      'CONTRACTOR_SELECTED': '업체 선정됨',
      'COMPLETED': '완료',
      'CLOSED': '종료'
    }
    return statusMap[status] || status
  }

  const getStatusBadgeVariant = (status: string) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'INSPECTION_PENDING': 'secondary',
      'INSPECTION_SCHEDULED': 'outline',
      'BIDDING_OPEN': 'default',
      'BIDDING_CLOSED': 'secondary',
      'CONTRACTOR_SELECTED': 'outline',
      'COMPLETED': 'default',
      'CLOSED': 'destructive'
    }
    return variantMap[status] || 'default'
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'KITCHEN': '주방 리노베이션',
      'BATHROOM': '욕실 리노베이션',
      'BASEMENT': '지하실 리노베이션',
      'FLOORING': '바닥재',
      'PAINTING': '페인팅',
      'OTHER': '기타',
      'OFFICE': '사무실',
      'RETAIL': '상업용',
      'CAFE_RESTAURANT': '카페/레스토랑',
      'EDUCATION': '교육시설',
      'HOSPITALITY_HEALTHCARE': '호텔/의료시설'
    }
    return categoryMap[category] || category
  }

  const getBudgetRangeDisplay = (range: string) => {
    const budgetMap: Record<string, string> = {
      'UNDER_50K': '50만원 미만',
      'RANGE_50_100K': '50만원 - 100만원',
      'OVER_100K': '100만원 이상'
    }
    return budgetMap[range] || range
  }

  const getTimelineDisplay = (timeline: string) => {
    const timelineMap: Record<string, string> = {
      'ASAP': '즉시',
      'WITHIN_1MONTH': '1개월 이내',
      'WITHIN_3MONTHS': '3개월 이내',
      'PLANNING': '계획 단계'
    }
    return timelineMap[timeline] || timeline
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '미정'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return '미정'
    
    try {
      // 시간 문자열을 Date 객체로 변환
      const [hours, minutes] = timeString.split(':').map(Number)
      const date = new Date()
      date.setHours(hours, minutes, 0, 0)
      
      // 한국어 형식으로 시간 표시
      const formatter = new Intl.DateTimeFormat('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      
      return formatter.format(date)
    } catch (error) {
      console.error('Time formatting error:', error)
      return timeString
    }
  }

  const openScheduleModal = (request: InspectionRequest) => {
    setSelectedRequest(request)
    setScheduleForm({
      inspection_date: request.inspection_date || '',
      notes: request.notes || ''
    })
    setShowScheduleModal(true)
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isAuthenticated ? '관리자 인증 확인 중...' : '현장 방문 데이터 로딩 중...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">현장 방문 일정 관리</h1>
          <p className="text-gray-600 mt-2">현장 방문 일정을 설정하고 관리합니다.</p>
        </div>
        <Button onClick={fetchInspectionRequests} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total_pending}</div>
              <div className="text-sm text-gray-600">방문 대기</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.scheduled_today}</div>
              <div className="text-sm text-gray-600">오늘 일정</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.scheduled_this_week}</div>
              <div className="text-sm text-gray-600">이번 주 일정</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.total_contractors_interested}</div>
              <div className="text-sm text-gray-600">참여 희망 업체</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 필터 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Label htmlFor="status-filter">상태별 필터</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSPECTION_PENDING">현장 방문 대기</SelectItem>
                <SelectItem value="INSPECTION_SCHEDULED">현장 방문 일정 설정됨</SelectItem>
                <SelectItem value="BIDDING_OPEN">입찰 진행중</SelectItem>
                <SelectItem value="BIDDING_CLOSED">입찰 마감</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 메시지 표시 */}
      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription className="flex items-center justify-between">
            <span>{message.text}</span>
            {message.type === 'error' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/adminlogin'}
              >
                로그인 페이지로 이동
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 현장 방문 요청 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>현장 방문 요청 목록 ({requests.length}개)</span>
            <div className="flex items-center space-x-2">
              <Label htmlFor="status-filter" className="text-sm">상태별 필터:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="OPEN">신규 요청</SelectItem>
                  <SelectItem value="INSPECTION_PENDING">현장 방문 대기</SelectItem>
                  <SelectItem value="INSPECTION_SCHEDULED">현장 방문 일정 설정</SelectItem>
                </SelectContent>
              </Select>
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
                              <span className="font-medium">{interest.contractor?.company_name || 'Unknown'}</span>
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
                    {request.status === 'INSPECTION_PENDING' && (
                      <Button
                        onClick={() => openScheduleModal(request)}
                        className="w-full"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        방문 일정 설정
                      </Button>
                    )}
                    
                    {request.status === 'INSPECTION_SCHEDULED' && (
                      <div className="text-center">
                        <Badge variant="outline" className="mb-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          일정 설정됨
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openScheduleModal(request)}
                          className="w-full"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          일정 수정
                        </Button>
                      </div>
                    )}
                    
                    <Button variant="outline" size="sm" className="w-full">
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
                <p>현재 {filterStatus === 'INSPECTION_PENDING' ? '현장 방문 대기' : '일정이 설정된'} 프로젝트가 없습니다.</p>
                <p className="text-sm">필터를 변경하거나 새 프로젝트를 확인해보세요.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 방문 일정 설정 모달 */}
      {showScheduleModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">현장 방문 일정 설정</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="inspection_date">방문 날짜</Label>
                <Input
                  id="inspection_date"
                  type="date"
                  value={scheduleForm.inspection_date}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, inspection_date: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                {/* 시간 입력 필드 제거 - 고객이 선택한 날짜만 사용 */}
              </div>
              
              <div>
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  placeholder="방문 시 참고사항을 입력하세요"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                onClick={() => handleScheduleInspection(selectedRequest.id)}
                className="flex-1"
                disabled={!scheduleForm.inspection_date}
              >
                일정 설정
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowScheduleModal(false)
                  setSelectedRequest(null)
                  setScheduleForm({ inspection_date: '', notes: '' })
                }}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

