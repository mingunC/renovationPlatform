'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit, 
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'

interface Project {
  id: string
  category: string
  property_type: string
  budget_range: string
  timeline: string
  address: string
  description: string
  status: string
  created_at: string
  customer?: {
    name: string
    email: string
  }
  _count?: {
    bids: number
  }
  inspection_date?: string
  bidding_start_date?: string
  bidding_end_date?: string
  selected_contractor_id?: string
}

interface ProjectStats {
  total: number
  open: number
  inspection_pending: number
  inspection_scheduled: number
  bidding_open: number
  bidding_closed: number
  contractor_selected: number
  completed: number
  closed: number
}

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects()
      fetchStats()
    }
  }, [isAuthenticated])

  const checkAdminAuth = async () => {
    try {
      console.log('Checking admin authentication...')
      
      // 쿠키 값 확인 (디버깅용)
      const cookies = document.cookie
      console.log('All cookies:', cookies)
      const adminSessionCookie = cookies.split(';').find(c => c.trim().startsWith('admin_session='))
      console.log('Admin session cookie found:', adminSessionCookie)
      
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

  const fetchProjects = async () => {
    try {
      setLoading(true)
      console.log('Fetching projects...')
      const response = await fetch('/api/admin/requests', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log('Projects API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Projects data:', data)
        setProjects(data.requests || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch projects:', response.status, errorData)
        setMessage({ type: 'error', text: `프로젝트 목록을 불러오는데 실패했습니다: ${response.status}` })
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setMessage({ type: 'error', text: '프로젝트 목록을 불러오는 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...')
      const response = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log('Stats API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Stats data:', data)
        setStats(data.stats)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch stats:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      console.log(`Updating project ${projectId} status to ${newStatus}`)
      const response = await fetch(`/api/admin/requests/${projectId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '프로젝트 상태가 업데이트되었습니다.' })
        fetchProjects() // 목록 새로고침
        fetchStats() // 통계 새로고침
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || '상태 업데이트에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '상태 업데이트 중 오류가 발생했습니다.' })
    }
  }

  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      'OPEN': '신규 요청',
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
      'OPEN': 'default',
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isAuthenticated ? '관리자 인증 확인 중...' : '프로젝트 데이터 로딩 중...'}
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
          <h1 className="text-3xl font-bold text-gray-900">프로젝트 관리</h1>
          <p className="text-gray-600 mt-2">모든 프로젝트의 상태를 관리하고 모니터링합니다.</p>
        </div>
        <Button onClick={fetchProjects} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">전체</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.open}</div>
              <div className="text-sm text-gray-600">신규</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.inspection_pending}</div>
              <div className="text-sm text-gray-600">방문 대기</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.inspection_scheduled}</div>
              <div className="text-sm text-gray-600">일정 설정</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.bidding_open}</div>
              <div className="text-sm text-gray-600">입찰 진행</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.bidding_closed}</div>
              <div className="text-sm text-gray-600">입찰 마감</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{stats.contractor_selected}</div>
              <div className="text-sm text-gray-600">업체 선정</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">완료</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.closed}</div>
              <div className="text-sm text-gray-600">종료</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="프로젝트 설명, 주소, 고객명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">상태</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="OPEN">신규 요청</SelectItem>
                  <SelectItem value="INSPECTION_PENDING">현장 방문 대기</SelectItem>
                  <SelectItem value="INSPECTION_SCHEDULED">현장 방문 일정 설정됨</SelectItem>
                  <SelectItem value="BIDDING_OPEN">입찰 진행중</SelectItem>
                  <SelectItem value="BIDDING_CLOSED">입찰 마감</SelectItem>
                  <SelectItem value="CONTRACTOR_SELECTED">업체 선정됨</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="CLOSED">종료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter">카테고리</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 카테고리</SelectItem>
                  <SelectItem value="KITCHEN">주방 리노베이션</SelectItem>
                  <SelectItem value="BATHROOM">욕실 리노베이션</SelectItem>
                  <SelectItem value="BASEMENT">지하실 리노베이션</SelectItem>
                  <SelectItem value="FLOORING">바닥재</SelectItem>
                  <SelectItem value="PAINTING">페인팅</SelectItem>
                  <SelectItem value="OTHER">기타</SelectItem>
                  <SelectItem value="OFFICE">사무실</SelectItem>
                  <SelectItem value="RETAIL">상업용</SelectItem>
                  <SelectItem value="CAFE_RESTAURANT">카페/레스토랑</SelectItem>
                  <SelectItem value="EDUCATION">교육시설</SelectItem>
                  <SelectItem value="HOSPITALITY_HEALTHCARE">호텔/의료시설</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

      {/* 프로젝트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>프로젝트 목록 ({filteredProjects.length}개)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* 프로젝트 정보 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-4">
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {getStatusDisplayName(project.status)}
                      </Badge>
                      <span className="text-sm text-gray-500">ID: {project.id}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{getCategoryDisplayName(project.category)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{getBudgetRangeDisplay(project.budget_range)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{getTimelineDisplay(project.timeline)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{project.address}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>고객: {project.customer?.name || '고객명 없음'}</span>
                      <span>입찰: {project._count?.bids || 0}개</span>
                      <span>생성일: {formatDate(project.created_at)}</span>
                      {project.inspection_date && (
                        <span>방문일: {formatDate(project.inspection_date)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex flex-col space-y-2">
                    <Select
                      value={project.status}
                      onValueChange={(newStatus) => updateProjectStatus(project.id, newStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">신규 요청</SelectItem>
                        <SelectItem value="INSPECTION_PENDING">현장 방문 대기</SelectItem>
                        <SelectItem value="INSPECTION_SCHEDULED">현장 방문 일정 설정됨</SelectItem>
                        <SelectItem value="BIDDING_OPEN">입찰 진행중</SelectItem>
                        <SelectItem value="BIDDING_CLOSED">입찰 마감</SelectItem>
                        <SelectItem value="CONTRACTOR_SELECTED">업체 선정됨</SelectItem>
                        <SelectItem value="COMPLETED">완료</SelectItem>
                        <SelectItem value="CLOSED">종료</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project)
                          setShowEditModal(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        수정
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        상세보기
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>검색 조건에 맞는 프로젝트가 없습니다.</p>
                <p className="text-sm">검색어나 필터를 변경해보세요.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
