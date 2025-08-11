'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  }
}

function MyBidsContent() {
  const [bids, setBids] = useState<Bid[]>([])
  const [filteredBids, setFilteredBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [withdrawingBid, setWithdrawingBid] = useState<string | null>(null)
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
      const response = await fetch('/api/bids?contractor=me')
      if (response.ok) {
        const data = await response.json()
        setBids(data.bids || [])
      }
    } catch (error) {
      console.error('Error fetching bids:', error)
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
    router.push(`/contractor/bid/edit/${bidId}`)
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
    </div>
  )
}

export function MyBidsList() {
  return (
    <Suspense fallback={
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
    }>
      <MyBidsContent />
    </Suspense>
  )
}
