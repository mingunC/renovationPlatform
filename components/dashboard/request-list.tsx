'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RenovationRequest {
  id: string
  category: string
  budget_range: string
  postal_code: string
  address: string
  description: string
  status: string
  inspection_date?: string | null
  created_at: string
  _count: {
    bids: number
  }
  customer: {
    name: string
  }
}

interface RequestListProps {
  contractorLocation?: string
}

export function RequestList({ contractorLocation = 'M5V 3A8' }: RequestListProps) {
  const [requests, setRequests] = useState<RenovationRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<RenovationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [filters, setFilters] = useState({
    category: 'all',
    budget: 'all',
    location: '',
    sortBy: 'newest'
  })
  const router = useRouter()

  useEffect(() => {
    fetchRequests()
    
    // Set up auto-refresh every 15 minutes (900,000 ms)
    const intervalId = setInterval(() => {
      fetchRequests()
    }, 15 * 60 * 1000)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [requests, filters])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests?status=OPEN')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      } else {
        // Fallback to mock data if API fails
        setRequests(getMockRequests())
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      // Use mock data as fallback
      setRequests(getMockRequests())
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  const getMockRequests = (): RenovationRequest[] => {
    const categories = ['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING', 'OTHER']
    const budgets = ['UNDER_50K', 'RANGE_50_100K', 'OVER_100K']
    const postalCodes = ['M5V 3A8', 'M4C 1B5', 'M2N 6K1', 'L5A 2B3', 'L6P 1A1', 'K1A 0A6', 'H3A 1B2', 'V6B 3K9', 'T2P 1J9', 'S7K 1A1', 'R3T 2N2', 'E1C 4B9']
    const customerNames = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson', 'Lisa Brown', 'Tom Anderson', 'Jennifer Taylor', 'Robert Kim', 'Amanda White', 'Chris Martinez', 'Nicole Thompson']
    
    const descriptions = [
      'Complete kitchen renovation including new cabinets, countertops, and appliances. Looking for modern design with quality materials.',
      'Master bathroom remodel with walk-in shower, double vanity, and heated floors. High-end finishes preferred.',
      'Basement finishing project to create family room, office space, and storage area. Need proper insulation and lighting.',
      'Hardwood flooring installation throughout main floor. Prefer engineered hardwood with professional installation.',
      'Interior painting for entire house including walls, ceilings, and trim. Looking for experienced residential painters.',
      'Deck construction and outdoor living space. Need permits handled and weather-resistant materials.',
      'Kitchen island installation with electrical work for outlets and pendant lighting.',
      'Bathroom tile work including shower surround and floor. Prefer natural stone materials.',
      'Basement waterproofing and mold remediation. Previous water damage needs professional attention.',
      'Laminate flooring installation in bedrooms and hallways. Budget-friendly but quality materials.',
      'Exterior house painting including prep work, primer, and two coats of premium paint.',
      'Custom built-in storage solutions for living room and home office space.'
    ]

    return Array.from({ length: 12 }, (_, index) => {
      const createdDate = new Date()
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 7)) // Within last week
      createdDate.setHours(createdDate.getHours() - Math.floor(Math.random() * 24))

      // 샘플 현장 방문 일정 생성 (일부 요청에만)
      let inspectionDate = null
      let status = 'OPEN'
      if (index < 4) { // 처음 4개 요청에만 현장 방문 일정 설정
        const inspection = new Date()
        inspection.setDate(inspection.getDate() + Math.floor(Math.random() * 10) + 2) // 2-12일 후
        inspection.setHours(9 + Math.floor(Math.random() * 8)) // 9AM-5PM
        inspection.setMinutes([0, 30][Math.floor(Math.random() * 2)]) // :00 or :30
        inspectionDate = inspection.toISOString()
        status = 'INSPECTION_SCHEDULED'
      }

      return {
        id: `mock-${index + 1}`,
        category: categories[index % categories.length],
        budget_range: budgets[index % budgets.length],
        postal_code: postalCodes[index % postalCodes.length],
        address: `${123 + index} Main Street, Toronto, ON`,
        description: descriptions[index % descriptions.length],
        status,
        inspection_date: inspectionDate,
        created_at: createdDate.toISOString(),
        _count: {
          bids: Math.floor(Math.random() * 5) // 0-4 bids
        },
        customer: {
          name: customerNames[index % customerNames.length]
        }
      }
    })
  }

  const applyFiltersAndSort = () => {
    let filtered = [...requests]

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(req => req.category === filters.category)
    }

    // Apply budget filter
    if (filters.budget !== 'all') {
      filtered = filtered.filter(req => req.budget_range === filters.budget)
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(req => 
        req.postal_code.toLowerCase().includes(filters.location.toLowerCase()) ||
        req.address.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'budget_high':
        filtered.sort((a, b) => getBudgetValue(b.budget_range) - getBudgetValue(a.budget_range))
        break
      case 'budget_low':
        filtered.sort((a, b) => getBudgetValue(a.budget_range) - getBudgetValue(b.budget_range))
        break
      case 'fewest_bids':
        filtered.sort((a, b) => a._count.bids - b._count.bids)
        break
    }

    setFilteredRequests(filtered)
  }

  const getBudgetValue = (budgetRange: string): number => {
    switch (budgetRange) {
      case 'UNDER_50K': return 25000
      case 'RANGE_50_100K': return 75000
      case 'OVER_100K': return 150000
      default: return 0
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

  const formatCategoryName = (category: string): string => {
    return category.charAt(0) + category.slice(1).toLowerCase()
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

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  const calculateDistance = (postalCode: string): string => {
    // Simplified distance calculation - in production, use actual geolocation
    const distances = ['2.1 km', '5.3 km', '8.7 km', '12.4 km', '15.9 km', '18.2 km']
    return distances[Math.floor(Math.random() * distances.length)]
  }

  const handleSubmitBid = (requestId: string) => {
    router.push(`/contractor/bid/${requestId}`)
  }

  const formatInspectionDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleInspectionInterest = async (requestId: string, willParticipate: boolean) => {
    try {
      // Mock 데이터인 경우 시뮬레이션된 API 호출
      if (requestId.startsWith('mock-')) {
        // Mock 환경에서는 실제 API 호출로 처리 (Mock 엔드포인트가 처리함)
        // fallthrough to actual API call
      }

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
        // 성공적으로 제출된 경우
        const successMessage = willParticipate ? '✅ 현장 방문 참여가 확정되었습니다!' : '❌ 현장 방문 불참으로 등록되었습니다.'
        
        // 성공 알림 표시
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300'
        notification.textContent = successMessage
        document.body.appendChild(notification)
        
        // 3초 후 알림 제거
        setTimeout(() => {
          notification.style.opacity = '0'
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 300)
        }, 3000)
        
        fetchRequests() // 목록 새로고침
      } else {
        const errorData = await response.json()
        console.error('Error submitting inspection interest:', errorData)
        
        // 구체적인 에러 메시지 표시
        let errorMessage = '참여 의사 등록 중 오류가 발생했습니다.'
        
        if (response.status === 401) {
          errorMessage = '로그인이 필요합니다. 다시 로그인해 주세요.'
        } else if (response.status === 404) {
          if (errorData.error?.includes('Contractor profile')) {
            errorMessage = '업체 프로필이 없습니다. 업체 등록을 완료해 주세요.'
          } else {
            errorMessage = '요청을 찾을 수 없습니다.'
          }
        } else if (response.status === 400) {
          if (errorData.error?.includes('not accepting inspection')) {
            errorMessage = '현재 현장 방문 참여 접수가 마감되었습니다.'
          } else if (errorData.error?.includes('date has already passed')) {
            errorMessage = '현장 방문 일정이 이미 지났습니다.'
          } else if (errorData.error?.includes('does not handle this category')) {
            errorMessage = '이 카테고리는 귀하의 전문 분야가 아닙니다.'
          } else {
            errorMessage = errorData.error || '잘못된 요청입니다.'
          }
        }
        
        // 에러 알림 표시
        const errorNotification = document.createElement('div')
        errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300'
        errorNotification.textContent = errorMessage
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
      console.error('Error submitting inspection interest:', error)
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="KITCHEN">Kitchen</SelectItem>
                  <SelectItem value="BATHROOM">Bathroom</SelectItem>
                  <SelectItem value="BASEMENT">Basement</SelectItem>
                  <SelectItem value="FLOORING">Flooring</SelectItem>
                  <SelectItem value="PAINTING">Painting</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget-filter">Budget Range</Label>
              <Select value={filters.budget} onValueChange={(value) => setFilters({...filters, budget: value})}>
                <SelectTrigger id="budget-filter">
                  <SelectValue placeholder="All Budgets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="UNDER_50K">Under $50K</SelectItem>
                  <SelectItem value="RANGE_50_100K">$50K - $100K</SelectItem>
                  <SelectItem value="OVER_100K">Over $100K</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location-filter">Location</Label>
              <Input
                id="location-filter"
                placeholder="Postal code or city"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="sort-filter">Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                <SelectTrigger id="sort-filter">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="budget_high">Highest Budget</SelectItem>
                  <SelectItem value="budget_low">Lowest Budget</SelectItem>
                  <SelectItem value="fewest_bids">Fewest Bids</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({category: 'all', budget: 'all', location: '', sortBy: 'newest'})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button variant="ghost" onClick={fetchRequests} className="text-blue-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{getCategoryIcon(request.category)}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {formatCategoryName(request.category)} Renovation
                        </h3>
                        <p className="text-sm text-gray-600">by {request.customer.name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Budget</p>
                        <Badge variant="secondary" className="mt-1">
                          {formatBudgetRange(request.budget_range)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="text-sm font-medium text-gray-900">{request.postal_code}</p>
                        <p className="text-xs text-gray-500">{calculateDistance(request.postal_code)} away</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Posted</p>
                        <p className="text-sm font-medium text-gray-900">{getTimeAgo(request.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Bids Submitted</p>
                        <p className="text-sm font-medium text-gray-900">{request._count.bids} bids</p>
                      </div>
                    </div>

                    {/* 현장 방문 일정 (있는 경우에만 표시) */}
                    {request.inspection_date && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-blue-900">현장 방문 일정</span>
                          <Badge className="bg-blue-100 text-blue-800 ml-auto">
                            {request.status === 'INSPECTION_SCHEDULED' ? '참여 가능' : request.status}
                          </Badge>
                        </div>
                        <p className="text-blue-800 font-bold text-lg">
                          {formatInspectionDate(request.inspection_date)}
                        </p>
                        <p className="text-blue-700 text-sm mt-1">
                          📍 {request.address}
                        </p>
                        {request.status === 'INSPECTION_SCHEDULED' && (
                          <div className="flex space-x-2 mt-3">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleInspectionInterest(request.id, true)}
                            >
                              ✅ 참여하기
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleInspectionInterest(request.id, false)}
                            >
                              ❌ 불참
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                      {request.description}
                    </p>
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <Button 
                      onClick={() => handleSubmitBid(request.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Submit Bid
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
