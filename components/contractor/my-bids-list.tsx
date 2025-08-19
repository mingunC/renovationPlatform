'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Bid {
  id: string
  labor_cost: number
  material_cost: number
  permit_cost: number
  disposal_cost: number
  total_amount: number
  timeline_weeks: number
  start_date: string
  status: string
  created_at: string
  notes?: string
  estimate_file_url?: string
  request: {
    id: string
    category: string
    budget_range: string
    postal_code: string
    description: string
    status: string
    customer: {
      name: string
    }
    bidding_end_date?: string // Added for the new blue box
    bids?: { total_amount: number }[] // Added for the new blue box
    _count?: { bids: number } // Added for the new blue box
  }
}

function MyBidsContent() {
  const [bids, setBids] = useState<Bid[]>([])
  const [filteredBids, setFilteredBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [withdrawingBid, setWithdrawingBid] = useState<string | null>(null)
  
  // Edit Bid 팝업 상태 추가
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBidForEdit, setSelectedBidForEdit] = useState<Bid | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    bidAmount: '',
    timelineWeeks: 4,
    startDate: '',
    notes: '',
    newFile: null as File | null,
  })
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchBids()
    
    // Show success message if redirected from bid submission
    const submittedBidId = searchParams.get('submitted')
    if (submittedBidId) {
      // You could show a toast notification here
      console.log('Bid submitted successfully:', submittedBidId)
    }
  }, [searchParams])

  useEffect(() => {
    applyStatusFilter()
  }, [bids, statusFilter])

  const fetchBids = async () => {
    try {
      setLoading(true)
      // bids API에서 더 많은 정보를 가져오도록 수정
      const response = await fetch('/api/bids?contractor=me&include=request_details')
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Fetched bids data:', data)
        setBids(data.bids || [])
      } else {
        console.error('Failed to fetch bids:', response.status)
        setBids([])
      }
    } catch (error) {
      console.error('Error fetching bids:', error)
      setBids([])
    } finally {
      setLoading(false)
    }
  }

  const applyStatusFilter = () => {
    if (statusFilter === 'all') {
      setFilteredBids(bids)
    } else {
      setFilteredBids(bids.filter(bid => bid.status === statusFilter))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'ACCEPTED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Accepted</Badge>
      case 'REJECTED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  const handleEditBid = (bidId: string) => {
    const bid = bids.find(b => b.id === bidId)
    if (bid) {
      setSelectedBidForEdit(bid)
      // Edit form 초기화
      setEditForm({
        bidAmount: bid.total_amount.toString(),
        timelineWeeks: bid.timeline_weeks,
        startDate: new Date(bid.start_date).toISOString().split('T')[0],
        notes: bid.notes || '',
        newFile: null,
      })
      setIsEditModalOpen(true)
    }
  }

  const handleUpdateBid = async () => {
    if (!selectedBidForEdit) return
    
    try {
      setIsUpdating(true)
      
      // 파일 업로드 (새 파일이 있는 경우)
      let estimateFileUrl = selectedBidForEdit.estimate_file_url || ''
      if (editForm.newFile) {
        const formData = new FormData()
        formData.append('file', editForm.newFile)
        formData.append('projectId', selectedBidForEdit.request.id)
        
        const uploadResponse = await fetch('/api/upload/estimate-file', {
          method: 'POST',
          body: formData,
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          estimateFileUrl = uploadResult.fileUrl
        }
      }
      
      // 입찰 업데이트
      const updateData = {
        bidId: selectedBidForEdit.id,
        total_amount: parseFloat(editForm.bidAmount.replace(/[^\d]/g, '')),
        timeline_weeks: editForm.timelineWeeks,
        start_date: editForm.startDate,
        notes: editForm.notes,
        estimate_file_url: estimateFileUrl,
      }
      
      const response = await fetch(`/api/bids/${selectedBidForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (response.ok) {
        alert('입찰이 성공적으로 업데이트되었습니다!')
        setIsEditModalOpen(false)
        fetchBids() // 목록 새로고침
      } else {
        const errorData = await response.json()
        alert(`입찰 업데이트 실패: ${errorData.error || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('Error updating bid:', error)
      alert('입찰 업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleWithdrawBid = async (bidId: string) => {
    setWithdrawingBid(bidId)
    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setBids(prev => prev.filter(bid => bid.id !== bidId))
      } else {
        console.error('Failed to withdraw bid')
      }
    } catch (error) {
      console.error('Error withdrawing bid:', error)
    } finally {
      setWithdrawingBid(null)
    }
  }

  const handleViewProject = (requestId: string) => {
    router.push(`/request/${requestId}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-600">
          {filteredBids.length} of {bids.length} bids
        </div>
      </div>

      {/* Success Alert */}
      {searchParams.get('submitted') && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            ✅ Your bid has been submitted successfully! The customer will review it and get back to you.
          </AlertDescription>
        </Alert>
      )}

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No bids submitted yet' : `No ${statusFilter.toLowerCase()} bids`}
              </h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === 'all' 
                  ? 'Start bidding on renovation projects to grow your business.'
                  : `You don't have any ${statusFilter.toLowerCase()} bids at the moment.`
                }
              </p>
              {statusFilter === 'all' && (
                <Button onClick={() => router.push('/contractor/dashboard')}>
                  Browse Available Projects
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredBids.map((bid) => (
            <Card key={bid.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(bid.request.category)}</span>
                    <div>
                      <CardTitle className="text-lg">
                        {formatCategoryName(bid.request.category)} Renovation
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        for {bid.request.customer.name} • {bid.request.postal_code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(bid.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* 블루박스 - 입찰 정보 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
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
                        <div className="text-lg font-semibold text-blue-800">
                          {(() => {
                            // 입찰 마감일이 있으면 카운트다운, 없으면 기본 메시지
                            if (bid.request.bidding_end_date) {
                              const deadline = new Date(bid.request.bidding_end_date);
                              if (!isNaN(deadline.getTime())) {
                                return (
                                  <CountdownTimer 
                                    deadline={deadline}
                                    className="justify-center"
                                  />
                                );
                              }
                            }
                            return <span className="text-blue-600">입찰 진행중</span>;
                          })()}
                        </div>
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
                          {bid.request.bids ? bid.request.bids.length : 0}
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
                          ${(() => {
                            if (bid.request.bids && bid.request.bids.length > 0) {
                              const total = bid.request.bids.reduce((sum: number, b: any) => sum + b.total_amount, 0);
                              return Math.round(total / bid.request.bids.length).toLocaleString();
                            }
                            return '0';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 내 입찰 상태 표시 */}
                  <div className="mt-4 text-center">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      🕐 내 입찰 상태: {bid.status === 'PENDING' ? 'Pending' : bid.status}
                    </Badge>
                    <p className="text-sm text-blue-700 mt-1">
                      {bid.status === 'PENDING' ? '입찰 제출 완료 - 심사 진행 중' : 
                       bid.status === 'ACCEPTED' ? '입찰 승인됨 - 축하합니다!' :
                       bid.status === 'REJECTED' ? '입찰 거절됨 - 다른 기회를 찾아보세요' : 
                       '상태 확인 중'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Your Bid</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(bid.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Timeline</p>
                    <p className="text-sm font-medium text-gray-900">
                      {bid.timeline_weeks} {bid.timeline_weeks === 1 ? 'week' : 'weeks'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Start Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(bid.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Submitted</p>
                    <p className="text-sm font-medium text-gray-900">
                      {getTimeAgo(bid.created_at)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">
                  {bid.request.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProject(bid.request.id)}
                    >
                      View Project
                    </Button>
                    
                    {bid.status === 'PENDING' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBid(bid.id)}
                        >
                          Edit Bid
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              disabled={withdrawingBid === bid.id}
                            >
                              {withdrawingBid === bid.id ? 'Withdrawing...' : 'Withdraw'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Withdraw Bid</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to withdraw this bid? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleWithdrawBid(bid.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Withdraw Bid
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>

                  {bid.status === 'ACCEPTED' && (
                    <div className="text-sm text-green-600 font-medium">
                      🎉 Congratulations! Project awarded to you.
                    </div>
                  )}

                  {bid.status === 'REJECTED' && bid.request.status === 'CLOSED' && (
                    <div className="text-sm text-gray-600">
                      Project completed by another contractor
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Bid Modal */}
      {isEditModalOpen && selectedBidForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Bid</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              {/* Project Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Project Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{formatCategoryName(selectedBidForEdit.request.category)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">{selectedBidForEdit.request.postal_code}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget Range:</span>
                    <span className="ml-2 font-medium">{formatBudgetRange(selectedBidForEdit.request.budget_range)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium">{selectedBidForEdit.request.status}</span>
                  </div>
                </div>
              </div>

              {/* Editable Bid Form */}
              <form onSubmit={(e) => {
                e.preventDefault()
                handleUpdateBid()
              }} className="space-y-6">
                <h3 className="font-semibold text-gray-900">Edit Bid Details</h3>
                
                {/* Bid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Amount (CAD) *
                  </label>
                  <input
                    type="text"
                    value={editForm.bidAmount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bidAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter bid amount"
                    required
                  />
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Timeline (weeks) *
                  </label>
                  <input
                    type="number"
                    value={editForm.timelineWeeks}
                    onChange={(e) => setEditForm(prev => ({ ...prev, timelineWeeks: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="52"
                    required
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Start Date *
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Add any additional notes or details about your bid..."
                  />
                </div>

                {/* Current Estimate File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Estimate File
                  </label>
                  <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                    {selectedBidForEdit.estimate_file_url ? (
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-blue-600 font-medium">Current file: {selectedBidForEdit.estimate_file_url.split('/').pop()}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedBidForEdit.estimate_file_url, '_blank')}
                        >
                          View File
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-500">No estimate file attached</span>
                    )}
                  </div>
                </div>

                {/* New Estimate File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Estimate File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setEditForm(prev => ({ ...prev, newFile: e.target.files?.[0] || null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>

                {/* Bid Status Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status
                  </label>
                  <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                    <Badge className={`${
                      selectedBidForEdit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      selectedBidForEdit.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {selectedBidForEdit.status === 'PENDING' ? '🕐 Pending Review' :
                       selectedBidForEdit.status === 'ACCEPTED' ? '✅ Accepted' :
                       '❌ Rejected'}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Bid'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function MyBidsList() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    }>
      <MyBidsContent />
    </Suspense>
  )
}
