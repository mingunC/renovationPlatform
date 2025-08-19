// components/contractor/request-list.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'

interface RenovationRequest {
  id: string
  category: string
  budget_range: string
  postal_code: string
  address: string
  description: string
  status: string
  created_at: string
  customer: {
    name: string
  }
  inspection_interests?: Array<{
    contractor_id: string
    will_participate: boolean
  }>
  _count?: {
    inspection_interests: number
  }
}

export function RequestList() {
  const [requests, setRequests] = useState<RenovationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingInterest, setSubmittingInterest] = useState<string | null>(null)
  const [myContractorId, setMyContractorId] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
    fetchMyProfile()
  }, [])

  const fetchMyProfile = async () => {
    try {
      const response = await fetch('/api/contractor/profile')
      if (response.ok) {
        const data = await response.json()
        setMyContractorId(data.id)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchRequests = async () => {
    try {
      // OPEN 및 INSPECTION_PENDING 상태의 요청들 가져오기
      const response = await fetch('/api/requests/public')
      
      if (response.ok) {
        const data = await response.json()
        setRequests(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInterestToggle = async (requestId: string, currentParticipation: boolean) => {
    setSubmittingInterest(requestId)
    
    try {
      const response = await fetch('/api/contractor/inspection-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          will_participate: !currentParticipation,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // 토스트 알림
        toast({
          title: !currentParticipation ? "참여 확정" : "참여 취소",
          description: data.message,
          variant: !currentParticipation ? "default" : "destructive"
        })
        
        // 목록 새로고침
        await fetchRequests()
      } else {
        const errorData = await response.json()
        toast({
          title: "오류",
          description: errorData.error || "처리 중 오류가 발생했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error toggling interest:', error)
      toast({
        title: "네트워크 오류",
        description: "인터넷 연결을 확인해 주세요.",
        variant: "destructive"
      })
    } finally {
      setSubmittingInterest(null)
    }
  }

  const formatCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'KITCHEN': '주방',
      'BATHROOM': '욕실',
      'BASEMENT': '지하실',
      'FLOORING': '바닥',
      'PAINTING': '페인팅',
      'OTHER': '기타'
    }
    return categoryMap[category] || category
  }

  const formatBudgetRange = (range: string): string => {
    switch (range) {
      case 'UNDER_50K': return '$50K 미만'
      case 'RANGE_50_100K': return '$50K - $100K'
      case 'OVER_100K': return '$100K 이상'
      default: return range
    }
  }

  const getStatusBadge = (status: string, participantCount: number = 0) => {
    switch (status) {
      case 'OPEN':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            🆕 신규 요청
          </Badge>
        )
      case 'INSPECTION_PENDING':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            👥 {participantCount}개 업체 참여중
          </Badge>
        )
      default:
        return null
    }
  }

  const isParticipating = (request: RenovationRequest): boolean => {
    if (!myContractorId || !request.inspection_interests) return false
    return request.inspection_interests.some(
      interest => interest.contractor_id === myContractorId && interest.will_participate
    )
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
          <div className="text-gray-400 text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            새로운 요청이 없습니다
          </h3>
          <p className="text-gray-600">
            새로운 프로젝트가 등록되면 여기에 표시됩니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 안내 메시지 */}
      <Alert>
        <AlertDescription>
          💡 현장 방문에 참여하시면 고객과 직접 만나 프로젝트를 상담하고 견적을 제출할 수 있습니다.
        </AlertDescription>
      </Alert>

      {/* 요청 목록 */}
      {requests.map((request) => {
        const participating = isParticipating(request)
        const participantCount = request._count?.inspection_interests || 0

        return (
          <Card 
            key={request.id} 
            className={`hover:shadow-md transition-all ${
              participating ? 'border-blue-500 bg-blue-50/30' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 헤더 */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {formatCategory(request.category)} 리노베이션
                    </h3>
                    {getStatusBadge(request.status, participantCount)}
                    {participating && (
                      <Badge variant="default" className="bg-blue-600">
                        ✓ 참여중
                      </Badge>
                    )}
                  </div>

                  {/* 고객 정보 */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>👤 {request.customer.name}</span>
                    <span>📍 {request.postal_code}</span>
                    <span>💰 {formatBudgetRange(request.budget_range)}</span>
                  </div>

                  {/* 설명 */}
                  <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                    {request.description}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>등록일: {new Date(request.created_at).toLocaleDateString()}</span>
                    {participantCount > 0 && (
                      <span className="text-blue-600 font-medium">
                        {participantCount}개 업체 관심 표시
                      </span>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="ml-4 flex flex-col gap-2">
                  <Button
                    onClick={() => handleInterestToggle(request.id, participating)}
                    disabled={submittingInterest === request.id}
                    variant={participating ? "outline" : "default"}
                    size="sm"
                    className={participating ? "border-red-300 text-red-600 hover:bg-red-50" : ""}
                  >
                    {submittingInterest === request.id ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> 처리중...
                      </span>
                    ) : participating ? (
                      '❌ 참여 취소'
                    ) : (
                      '✋ 현장방문 참여'
                    )}
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    상세보기 →
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