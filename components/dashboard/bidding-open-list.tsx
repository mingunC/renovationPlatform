'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BiddingRequest {
  id: string
  category: string
  budget_range: string
  postal_code: string
  address: string
  description: string
  inspection_date: string
  bidding_start_date: string
  bidding_end_date: string
  created_at: string
  customer: {
    name: string
  }
  _count: {
    bids: number
  }
  my_bid?: {
    id: string
    total_amount: number
    status: string
    created_at: string
  }
}

export function BiddingOpenList() {
  const [requests, setRequests] = useState<BiddingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchBiddingRequests()
  }, [])

  const fetchBiddingRequests = async () => {
    try {
      const response = await fetch('/api/requests?status=BIDDING_OPEN')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching bidding requests:', error)
    } finally {
      setLoading(false)
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

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: '마감됨', color: 'text-red-600', urgent: false }
    if (diffDays === 0) return { text: '오늘 마감', color: 'text-red-600', urgent: true }
    if (diffDays === 1) return { text: '내일 마감', color: 'text-orange-600', urgent: true }
    if (diffDays <= 3) return { text: `${diffDays}일 남음`, color: 'text-amber-600', urgent: true }
    return { text: `${diffDays}일 남음`, color: 'text-gray-600', urgent: false }
  }

  const handleSubmitBid = (requestId: string) => {
    router.push(`/contractor/bid/${requestId}`)
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
          <div className="text-gray-400 text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">입찰 진행중인 요청이 없습니다</h3>
          <p className="text-gray-600">현장 방문을 완료한 프로젝트에 대한 입찰이 시작되면 여기에 표시됩니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 안내 메시지 */}
      <Alert>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <AlertDescription>
          현장 방문을 완료하고 입찰이 진행 중인 프로젝트들입니다. 마감 시간 전에 경쟁력 있는 견적을 제출하세요.
        </AlertDescription>
      </Alert>

      {/* 요청 목록 */}
      {requests.map((request) => {
        const timeRemaining = getTimeRemaining(request.bidding_end_date)
        const hasBid = !!request.my_bid

        return (
          <Card key={request.id} className={`hover:shadow-md transition-shadow ${timeRemaining.urgent ? 'border-amber-300' : ''}`}>
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
                    {hasBid && (
                      <Badge className="bg-blue-100 text-blue-800">
                        ✅ 입찰 완료
                      </Badge>
                    )}
                  </div>

                  {/* 입찰 마감 정보 */}
                  <div className={`border rounded-lg p-4 mb-4 ${timeRemaining.urgent ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-900">입찰 마감</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(request.bidding_end_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${timeRemaining.color}`}>
                          {timeRemaining.text}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request._count.bids}개 입찰서 제출됨
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 프로젝트 정보 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                      <p className="text-xs text-gray-500 font-medium">현장 방문</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(request.inspection_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">경쟁사</p>
                      <p className="text-sm font-medium text-gray-900">
                        {request._count.bids}개 업체
                      </p>
                    </div>
                  </div>

                  {/* 내 입찰 정보 */}
                  {hasBid && request.my_bid && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">내 입찰가</p>
                          <p className="text-lg font-bold text-blue-800">
                            ${request.my_bid.total_amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-700">
                            제출일: {formatDate(request.my_bid.created_at)}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {request.my_bid.status === 'PENDING' ? '심사중' : request.my_bid.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-700 line-clamp-2">
                    {request.description}
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="ml-4 flex flex-col space-y-2">
                  {timeRemaining.text !== '마감됨' ? (
                    <>
                      <Button 
                        onClick={() => handleSubmitBid(request.id)}
                        className={hasBid ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                      >
                        {hasBid ? '입찰 수정' : '입찰 제출'}
                      </Button>
                      <Button variant="outline" size="sm">
                        상세보기
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" disabled>
                      마감됨
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
