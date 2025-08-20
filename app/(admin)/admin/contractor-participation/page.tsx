'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, TrendingUp, MapPin, Calendar, AlertTriangle, CheckCircle, Eye } from 'lucide-react'
import { format } from 'date-fns'

interface Contractor {
  id: string
  user: {
    name: string
    email: string
  }
  business_name: string
  business_number: string
  phone: string
  service_areas: string[]
  categories: string[]
  rating: number
  review_count: number
  profile_completed: boolean
  completion_percentage: number
  insurance_verified: boolean
  wsib_verified: boolean
  created_at: string
  onboarding_completed_at?: string
}

interface InspectionInterest {
  id: string
  request_id: string
  contractor_id: string
  will_participate: boolean
  created_at: string
  renovation_request: {
    property_type: string
    category: string
    address: string
    customer: {
      name: string
    }
  }
  contractor: {
    business_name: string
    user: {
      name: string
      email: string
    }
  }
}

interface ParticipationStats {
  total_contractors: number
  verified_contractors: number
  active_contractors: number
  total_participations: number
  participation_rate: number
}

export default function ContractorParticipationPage() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [inspectionInterests, setInspectionInterests] = useState<InspectionInterest[]>([])
  const [stats, setStats] = useState<ParticipationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchContractors(),
        fetchInspectionInterests(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: '데이터를 불러오는데 실패했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const fetchContractors = async () => {
    try {
      const response = await fetch('/api/admin/contractors')
      if (response.ok) {
        const data = await response.json()
        setContractors(data.contractors)
      }
    } catch (error) {
      console.error('Error fetching contractors:', error)
    }
  }

  const fetchInspectionInterests = async () => {
    try {
      const response = await fetch('/api/admin/inspection-interests')
      if (response.ok) {
        const data = await response.json()
        setInspectionInterests(data.interests)
      }
    } catch (error) {
      console.error('Error fetching inspection interests:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/contractor-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const getVerificationStatus = (contractor: Contractor) => {
    if (contractor.insurance_verified && contractor.wsib_verified) {
      return <Badge variant="default">완전 인증</Badge>
    } else if (contractor.insurance_verified || contractor.wsib_verified) {
      return <Badge variant="secondary">부분 인증</Badge>
    } else {
      return <Badge variant="outline">미인증</Badge>
    }
  }

  const getProfileCompletionStatus = (percentage: number) => {
    if (percentage >= 100) {
      return <Badge variant="default">완성</Badge>
    } else if (percentage >= 80) {
      return <Badge variant="secondary">거의 완성</Badge>
    } else if (percentage >= 50) {
      return <Badge variant="outline">진행중</Badge>
    } else {
      return <Badge variant="destructive">미완성</Badge>
    }
  }

  const getContractorParticipationCount = (contractorId: string) => {
    return inspectionInterests.filter(interest => 
      interest.contractor_id === contractorId && interest.will_participate
    ).length
  }

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = 
      contractor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || contractor.categories.includes(categoryFilter)
    
    const matchesVerification = !verificationFilter || 
      (verificationFilter === 'verified' && contractor.insurance_verified && contractor.wsib_verified) ||
      (verificationFilter === 'partial' && (contractor.insurance_verified || contractor.wsib_verified)) ||
      (verificationFilter === 'unverified' && !contractor.insurance_verified && !contractor.wsib_verified)
    
    return matchesSearch && matchesCategory && matchesVerification
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">업체 참여 현황 모니터링</h1>
          <p className="text-gray-600 mt-2">등록된 업체들의 참여 현황과 활동을 모니터링합니다.</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          새로고침
        </Button>
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

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.total_contractors}</div>
                  <div className="text-sm text-gray-600">전체 업체</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.verified_contractors}</div>
                  <div className="text-sm text-gray-600">인증 완료</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.active_contractors}</div>
                  <div className="text-sm text-gray-600">활동 업체</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.participation_rate}%</div>
                  <div className="text-sm text-gray-600">참여율</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">검색</Label>
              <Input
                id="search"
                placeholder="업체명, 담당자명, 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="category-filter">카테고리</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="모든 카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 카테고리</SelectItem>
                  <SelectItem value="Kitchen Renovation">Kitchen Renovation</SelectItem>
                  <SelectItem value="Bathroom Renovation">Bathroom Renovation</SelectItem>
                  <SelectItem value="Basement Renovation">Basement Renovation</SelectItem>
                  <SelectItem value="Deck & Fence">Deck & Fence</SelectItem>
                  <SelectItem value="Interior Painting">Interior Painting</SelectItem>
                  <SelectItem value="Exterior Painting">Exterior Painting</SelectItem>
                  <SelectItem value="Roofing">Roofing</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="Landscaping">Landscaping</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="verification-filter">인증 상태</Label>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="모든 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">모든 상태</SelectItem>
                  <SelectItem value="verified">완전 인증</SelectItem>
                  <SelectItem value="partial">부분 인증</SelectItem>
                  <SelectItem value="unverified">미인증</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 업체 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>
            업체 목록 ({filteredContractors.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContractors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>조건에 맞는 업체가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContractors.map((contractor) => (
                <div key={contractor.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{contractor.business_name || '개인업체'}</Badge>
                        {getVerificationStatus(contractor)}
                        {getProfileCompletionStatus(contractor.completion_percentage)}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{contractor.user.name}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>이메일:</strong> {contractor.user.email}</p>
                          <p><strong>전화번호:</strong> {contractor.phone}</p>
                          <p><strong>사업자번호:</strong> {contractor.business_number}</p>
                        </div>
                        <div>
                          <p><strong>평점:</strong> {contractor.rating || 'N/A'} ({contractor.review_count}개 리뷰)</p>
                          <p><strong>서비스 지역:</strong> {contractor.service_areas.join(', ')}</p>
                          <p><strong>참여 횟수:</strong> {getContractorParticipationCount(contractor.id)}회</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {contractor.categories.map((category) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 space-y-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedContractor(contractor)}
                      >
                        상세보기
                      </Button>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        승인/거부
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 참여 현황 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            최근 참여 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inspectionInterests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>아직 참여 현황이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inspectionInterests.slice(0, 10).map((interest) => (
                <div key={interest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={interest.will_participate ? 'default' : 'secondary'}>
                      {interest.will_participate ? '참여' : '미참여'}
                    </Badge>
                    <div>
                      <p className="font-medium">{interest.contractor.business_name || interest.contractor.user.name}</p>
                      <p className="text-sm text-gray-600">
                        {interest.renovation_request.property_type} - {interest.renovation_request.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{format(new Date(interest.created_at), 'yyyy-MM-dd HH:mm')}</p>
                    <p>{interest.renovation_request.address}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
