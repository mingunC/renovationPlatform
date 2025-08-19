'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface AdminDashboardStats {
  totalProjects: number
  openProjects: number
  inspectionPending: number
  inspectionScheduled: number
  biddingOpen: number
  completedProjects: number
  totalContractors: number
  verifiedContractors: number
  totalCustomers: number
  totalRevenue: number
}

interface ProjectSummary {
  id: string
  category: string
  budget_range: string
  status: string
  created_at: string
  customer_name: string
  inspection_date?: string
  bidding_start_date?: string
  bidding_end_date?: string
  inspection_notes?: string // Added inspection_notes
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    inspection_date: '',
    notes: ''
  })
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // 대시보드 통계 데이터 가져오기
      const statsResponse = await fetch('/api/admin/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // 최근 프로젝트 데이터 가져오기
      const projectsResponse = await fetch('/api/admin/dashboard/recent-projects')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        console.log('📊 Fetched projects:', projectsData.projects)
        setRecentProjects(projectsData.projects)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', text: string }> = {
      'OPEN': { variant: 'default', text: '새 요청' },
      'INSPECTION_PENDING': { variant: 'secondary', text: '방문 대기' },
      'INSPECTION_SCHEDULED': { variant: 'outline', text: '방문 예정' },
      'BIDDING_OPEN': { variant: 'default', text: '입찰 진행' },
      'BIDDING_CLOSED': { variant: 'secondary', text: '입찰 마감' },
      'CONTRACTOR_SELECTED': { variant: 'outline', text: '업체 선택' },
      'COMPLETED': { variant: 'default', text: '완료' },
      'CLOSED': { variant: 'destructive', text: '마감' }
    }

    const config = statusConfig[status] || { variant: 'outline', text: status }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const openScheduleModal = (project: ProjectSummary) => {
    console.log('🔍 Opening schedule modal for project:', project)
    console.log('📅 Project inspection_date:', project.inspection_date)
    console.log('📅 Project inspection_date type:', typeof project.inspection_date)
    
    setSelectedProject(project)
    
    // 고객이 입력한 방문 날짜가 있으면 자동으로 설정
    let customerDate = ''
    if (project.inspection_date) {
      customerDate = new Date(project.inspection_date).toISOString().split('T')[0]
    } else {
      // inspection_date가 없으면 기본값으로 3일 후 설정
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 3)
      customerDate = defaultDate.toISOString().split('T')[0]
      console.log('📅 Using default date (3 days from now):', customerDate)
    }
    
    console.log('📅 Customer date extracted:', customerDate)
    
    setScheduleForm({
      inspection_date: customerDate,
      notes: ''
    })
    setShowScheduleModal(true)
  }

  const handleScheduleInspection = async () => {
    if (!selectedProject || !scheduleForm.inspection_date) {
      return
    }

    try {
      setScheduling(true)
      
      const response = await fetch(`/api/admin/requests/${selectedProject.id}/set-inspection-date`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleForm)
      })

      if (response.ok) {
        // 성공 시 모달 닫고 데이터 새로고침
        setShowScheduleModal(false)
        setSelectedProject(null)
        await fetchDashboardData()
        alert('현장 방문 일정이 설정되었습니다!')
      } else {
        const errorData = await response.json()
        alert(`일정 설정 실패: ${errorData.error || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('Error scheduling inspection:', error)
      alert('일정 설정 중 오류가 발생했습니다.')
    } finally {
      setScheduling(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">전체 시스템 현황을 모니터링하고 관리할 수 있습니다.</p>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 프로젝트</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              활성: {stats?.openProjects || 0}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현장 방문 대기</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inspectionPending || 0}</div>
            <p className="text-xs text-muted-foreground">
              일정 설정: {stats?.inspectionScheduled || 0}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">등록된 업체</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContractors || 0}</div>
            <p className="text-xs text-muted-foreground">
              인증 완료: {stats?.verifiedContractors || 0}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 고객</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              활성 고객 수
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 탭 */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">전체 현황</TabsTrigger>
          <TabsTrigger value="projects">프로젝트 관리</TabsTrigger>
          <TabsTrigger value="contractors">업체 관리</TabsTrigger>
          <TabsTrigger value="settings">시스템 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 최근 프로젝트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>최근 프로젝트 현황</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{project.category}</span>
                          {getStatusBadge(project.status)}
                          <span className="text-sm text-gray-500">{project.budget_range}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          고객: {project.customer_name} | 등록일: {formatDate(project.created_at)}
                        </p>
                        {project.inspection_date && (
                          <p className="text-sm text-blue-600 mt-1">
                            현장 방문: {formatDate(project.inspection_date)}
                          </p>
                        )}
                        {project.inspection_notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            메모: {project.inspection_notes}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          상세보기
                        </Button>
                        {project.status === 'INSPECTION_PENDING' && (
                          <Button size="sm" onClick={() => openScheduleModal(project)}>
                            일정 설정
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    등록된 프로젝트가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 빠른 액션 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => window.location.href = '/admin/inspection-schedule'}
                >
                  <Calendar className="h-6 w-6" />
                  <span>현장 방문 일정 설정</span>
                </Button>
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/contractor-participation'}
                >
                  <Users className="h-6 w-6" />
                  <span>업체 참여 현황</span>
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/add-contractor'}
                >
                  <Building2 className="h-6 w-6" />
                  <span>업체 추가</span>
                </Button>
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/project-management'}
                >
                  <Building2 className="h-6 w-6" />
                  <span>프로젝트 상태 관리</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">프로젝트 관리 기능이 여기에 구현됩니다.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contractors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>업체 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">업체 승인 및 관리 기능이 여기에 구현됩니다.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>시스템 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">시스템 설정 및 관리 기능이 여기에 구현됩니다.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 일정 설정 모달 */}
      {showScheduleModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">현장 방문 일정 설정</h3>
            <p className="text-sm text-gray-600 mb-4">
              프로젝트: {selectedProject.category} - {selectedProject.customer_name}
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="inspection_date">방문 날짜</Label>
                <Input
                  id="inspection_date"
                  type="date"
                  value={scheduleForm.inspection_date}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, inspection_date: e.target.value }))}
                  required
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">고객이 선택한 날짜입니다</p>
              </div>
              
              {/* 시간 입력 필드 제거 - 고객이 선택한 날짜만 사용 */}
              
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
                onClick={handleScheduleInspection}
                className="flex-1"
                disabled={!scheduleForm.inspection_date || scheduling}
              >
                {scheduling ? '설정 중...' : '일정 설정'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowScheduleModal(false)
                  setSelectedProject(null)
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
