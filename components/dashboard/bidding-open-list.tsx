'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BidSubmissionModal, BidSubmissionData } from '@/components/contractor/bid-submission-modal'

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
  average_bid?: {
    total_amount: number
  }
  bids?: {
    total_amount: number
  }[]
  status: string;
}

export function BiddingOpenList() {
  const [requests, setRequests] = useState<BiddingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<BiddingRequest | null>(null)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBiddingRequests()
  }, [])

  const fetchBiddingRequests = async () => {
    try {
      console.log('🔍 Fetching bidding requests...')
      // 공개 API를 사용하여 BIDDING_OPEN 상태의 요청들을 가져오기
      const response = await fetch('/api/requests/public?status=BIDDING_OPEN')
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 API Response:', data)
        
        if (data.success && data.requests) {
          console.log('📋 Bidding requests:', data.requests)
          console.log('📊 Requests length:', data.requests.length)
          
          // 🚨 디버깅: 각 요청의 my_bid 상태 확인
          console.log('🔍 Checking my_bid status for each request:');
          data.requests.forEach((request: BiddingRequest, index: number) => {
            console.log(`Request ${index + 1}:`, {
              id: request.id,
              hasMyBid: !!request.my_bid,
              myBidData: request.my_bid,
              status: request.status
            });
          });
          
          // ✅ 모든 프로젝트를 표시 (입찰 여부와 관계없이)
          console.log('✅ Displaying all requests:', data.requests.length);
          setRequests(data.requests);
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
      console.error('❌ Error fetching bidding requests:', error)
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calculateAverageBid = (bids: { total_amount: number }[]): number => {
    if (!bids || bids.length === 0) return 0
    const total = bids.reduce((sum, bid) => sum + bid.total_amount, 0)
    return Math.round(total / bids.length)
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
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) {
      return `${seconds}초 전`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}분 전`;
    } else if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)}시간 전`;
    } else {
      return `${Math.floor(seconds / 86400)}일 전`;
    }
  };


  const handleSubmitBid = (request: BiddingRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const handleBidSubmission = async (bidData: { bidAmount: string; file?: File; message: string; }) => {
    try {
      setIsSubmitting(true);
      
      // 입찰 금액 검증
      const cleanAmount = bidData.bidAmount.replace(/[^\d]/g, '');
      if (!cleanAmount || parseInt(cleanAmount) <= 0) {
        alert('유효한 입찰 금액을 입력해주세요.');
        return;
      }

      // 프로젝트 ID 확인
      if (!selectedRequest?.id) {
        alert('프로젝트를 선택해주세요.');
        return;
      }

      // 프로젝트 상태 확인 - 입찰 가능한 상태인지 검증
      console.log('🔍 Checking project status for bidding:', {
        projectId: selectedRequest.id,
        status: selectedRequest.status,
        allowedStatuses: ['BIDDING_OPEN']
      });
      
      if (selectedRequest.status !== 'BIDDING_OPEN') {
        console.log('❌ Project status not allowed for bidding:', selectedRequest.status);
        
        const statusMessages = {
          'OPEN': '견적요청 등록 상태입니다. 아직 입찰이 시작되지 않았습니다.',
          'INSPECTION_PENDING': '현장방문 대기 중인 프로젝트입니다. 입찰이 불가능합니다.',
          'INSPECTION_SCHEDULED': '현장방문 일정이 설정된 프로젝트입니다. 입찰이 불가능합니다.',
          'BIDDING_CLOSED': '입찰이 마감된 프로젝트입니다. 입찰이 불가능합니다.',
          'CONTRACTOR_SELECTED': '업체가 선택된 프로젝트입니다. 입찰이 불가능합니다.',
          'CLOSED': '마감된 프로젝트입니다. 입찰이 불가능합니다.',
          'COMPLETED': '완료된 프로젝트입니다. 입찰이 불가능합니다.'
        };
        
        const message = statusMessages[selectedRequest.status as keyof typeof statusMessages] || 
                       `프로젝트 상태(${selectedRequest.status})로 인해 입찰이 불가능합니다.`;
        
        console.log('🚫 Bidding blocked:', message);
        alert(message);
        return;
      }
      
      console.log('✅ Project status allows bidding:', selectedRequest.status);

      let estimateFileUrl = '';
      // 파일이 있는 경우에만 업로드 시도
      if (bidData.file) {
        try {
          console.log('Uploading file...', bidData.file.name);
          estimateFileUrl = await uploadEstimateFile(bidData.file, selectedRequest.id);
          console.log('File uploaded successfully:', estimateFileUrl);
        } catch (error) {
          console.error('File upload failed:', error);
          alert('파일 업로드에 실패했습니다. 파일 없이 입찰을 진행합니다.');
          estimateFileUrl = '';
        }
      }

      // 간소화된 입찰 데이터
      const bidSubmissionData = {
        request_id: selectedRequest.id,
        total_amount: parseInt(cleanAmount),
        estimate_file_url: estimateFileUrl || '',
        notes: bidData.message.trim() || '',
        timeline_weeks: 4,
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // 🚨 디버깅: 보내는 데이터 확인
      console.log('=== DEBUGGING BID SUBMISSION ===');
      console.log('selectedProject:', selectedRequest);
      console.log('cleanAmount:', cleanAmount, typeof cleanAmount);
      console.log('bidSubmissionData:', JSON.stringify(bidSubmissionData, null, 2));
      console.log('================================');

      // 입찰 제출 API 호출
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bidSubmissionData),
      });

      const result = await response.json();
      
      // 🚨 디버깅: 응답 데이터 확인
      console.log('=== API RESPONSE DEBUG ===');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(result, null, 2));
      
      // Validation failed 에러의 details 자세히 출력
      if (result.error === 'Validation failed' && result.details) {
        console.log('=== VALIDATION ERRORS ===');
        if (Array.isArray(result.details)) {
          result.details.forEach((error: any, index: number) => {
            console.log(`Error ${index + 1}:`, {
              field: error.path?.join('.') || 'unknown',
              message: error.message,
              code: error.code,
              received: error.received,
              expected: error.expected
            });
          });
        } else {
          console.log('Details object:', result.details);
        }
        console.log('=========================');
      }
      console.log('=========================');

      if (!response.ok) {
        console.error('Bid submission failed:', result);
        
        // 상세 에러 메시지 표시
        let errorMessage = 'Bid submission failed';
        if (result.details && Array.isArray(result.details)) {
          const fieldErrors = result.details.map((err: any) => 
            `${err.path?.join('.') || 'field'}: ${err.message}`
          ).join('\n');
          errorMessage = `입력 오류:\n${fieldErrors}`;
          
          // 사용자에게 구체적인 에러 보여주기
          alert(errorMessage);
          return;
        } else if (result.error) {
          errorMessage = result.error;
        }
        
        throw new Error(errorMessage);
      }

      // ✅ HTTP 상태 코드로 성공/실패 판단
      if (response.ok) {
        console.log('✅ Bid submitted successfully!');
        alert('입찰이 성공적으로 제출되었습니다!');
        setIsModalOpen(false);
        
        // 목록 새로고침
        await fetchBiddingRequests();
      } else {
        console.error('❌ Bid submission failed:', result);
        throw new Error(result.error || '입찰 제출에 실패했습니다.');
      }

    } catch (error) {
      console.error('Bid submission error:', error);
      alert(`입찰 제출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadEstimateFile = async (file: File, projectId: string): Promise<string> => {
    try {
      console.log('Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        projectId: projectId
      })

      // 클라이언트 측 파일 검증
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('파일 크기가 10MB를 초과합니다.')
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('지원하지 않는 파일 형식입니다. PDF, DOC, DOCX, JPG, PNG만 허용됩니다.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)
      
      console.log('Sending file upload request...')
      
      const response = await fetch('/api/upload/estimate-file', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('File upload failed:', errorData)
        throw new Error(errorData.error || '파일 업로드에 실패했습니다.')
      }
      
      const data = await response.json()
      console.log('File upload successful:', data)
      
      return data.fileUrl
      
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  const toggleDetails = (requestId: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev)
      if (newSet.has(requestId)) {
        newSet.delete(requestId)
      } else {
        newSet.add(requestId)
      }
      return newSet
    })
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

  console.log('🔄 Rendering BiddingOpenList component')
  console.log('📊 Current requests state:', requests)
  console.log('📊 Loading state:', loading)
  
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
        const hasBid = !!request.my_bid

        return (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 프로젝트 헤더 */}
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getCategoryIcon(request.category)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {formatCategory(request.category)} 리노베이션
                      </h3>
                      <p className="text-sm text-gray-600">by {request.customer.name}</p>
                      {/* 프로젝트 상태 표시 */}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={request.status === 'BIDDING_OPEN' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            request.status === 'BIDDING_OPEN'
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {request.status === 'OPEN' && '견적요청 등록'}
                          {request.status === 'BIDDING_OPEN' && '입찰 진행중'}
                          {request.status === 'INSPECTION_PENDING' && '현장방문 대기'}
                          {request.status === 'INSPECTION_SCHEDULED' && '현장방문 예정'}
                          {request.status === 'BIDDING_CLOSED' && '입찰 마감'}
                          {request.status === 'CONTRACTOR_SELECTED' && '업체 선택됨'}
                          {request.status === 'CLOSED' && '마감됨'}
                          {request.status === 'COMPLETED' && '완료됨'}
                        </Badge>
                        {request.status === 'BIDDING_OPEN' && (
                          <span className="text-xs text-green-600 font-medium">✓ 입찰 가능</span>
                        )}
                        {request.status === 'OPEN' && (
                          <span className="text-xs text-gray-600 font-medium">⏳ 입찰 대기</span>
                        )}
                      </div>
                    </div>
                    {hasBid && (
                      <Badge className="bg-blue-100 text-blue-800">
                        ✅ 입찰 완료
                      </Badge>
                    )}
                  </div>

                  {/* 입찰 정보 섹션 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* 남은 시간 타임머 */}
                      <div className="text-center group">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-base font-semibold text-blue-900 mb-3">남은 시간</h4>
                        <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                          {(() => {
                            const deadline = new Date(request.bidding_end_date);
                            return isNaN(deadline.getTime()) ? (
                              <div className="text-red-500">Invalid date</div>
                            ) : (
                              <CountdownTimer 
                                deadline={deadline}
                                className="justify-center"
                              />
                            );
                          })()}
                        </div>
                      </div>

                      {/* 입찰 수 정보 */}
                      <div className="text-center group">
                        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-3 group-hover:bg-indigo-200 transition-colors">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="text-base font-semibold text-blue-900 mb-3">입찰 수</h4>
                        <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                          <p className="text-3xl font-bold text-indigo-800">
                            {request._count.bids}
                          </p>
                        </div>
                      </div>

                      {/* 평균 가격 정보 */}
                      <div className="text-center group">
                        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-3 group-hover:bg-emerald-200 transition-colors">
                          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <h4 className="text-base font-semibold text-blue-900 mb-3">평균 가격</h4>
                        <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                          <p className="text-3xl font-bold text-emerald-800">
                            ${calculateAverageBid(request.bids || []).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* 입찰 상태 표시 */}
                    {hasBid && request.my_bid && (
                      <div className="mt-4 text-center">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          🕐 입찰 상태: {request.my_bid.status === 'PENDING' ? 'Pending' : request.my_bid.status}
                        </Badge>
                        <p className="text-sm text-blue-700 mt-1">
                          입찰 제출 완료 - 심사 진행 중
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 프로젝트 정보 - 토글 안으로 이동 */}
                  {/* <div className="grid grid-cols-3 gap-4 mb-4">
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
                  </div> */}

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

                  {/* 상세 정보 섹션 */}
                  {expandedRequests.has(request.id) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-3">상세 정보</h4>
                      
                      {/* Budget, Location, Timeline, Posted 정보를 여기로 이동 */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-3 bg-white rounded-lg border">
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
                          <p className="text-xs text-gray-500 font-medium">게시일</p>
                          <p className="text-sm font-medium text-gray-900">
                            {getTimeAgo(request.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><span className="font-medium">프로젝트 설명:</span> {request.description}</p>
                        <p><span className="font-medium">주소:</span> {request.address}</p>
                        <p><span className="text-gray-500">생성일:</span> {formatDate(request.created_at)}</p>
                        <p><span className="font-medium">현재 입찰 수:</span> {request._count.bids}개</p>
                        {request.bids && request.bids.length > 0 && (
                          <p><span className="font-medium">현재 평균 입찰가:</span> ${calculateAverageBid(request.bids).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="ml-4 flex flex-col space-y-2">
                  <Button 
                    onClick={() => handleSubmitBid(request)}
                    disabled={request.status !== 'BIDDING_OPEN'}
                    className={`${
                      hasBid 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : request.status === 'BIDDING_OPEN'
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 cursor-not-allowed"
                    }`}
                    title={
                      request.status !== 'BIDDING_OPEN'
                        ? request.status === 'OPEN' 
                          ? '아직 입찰이 시작되지 않았습니다. 견적요청 등록 상태입니다.'
                          : `현재 상태(${request.status})로는 입찰이 불가능합니다.`
                        : hasBid ? '입찰 수정' : '입찰 제출'
                    }
                  >
                    {hasBid ? '입찰 수정' : '입찰 제출'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleDetails(request.id)}
                  >
                    {expandedRequests.has(request.id) ? '접기' : '상세보기'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* 입찰 제출 모달 */}
      {selectedRequest && (
        <BidSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectId={selectedRequest.id}
          projectTitle={`${formatCategory(selectedRequest.category)} 리노베이션`}
          onSubmit={handleBidSubmission}
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}
