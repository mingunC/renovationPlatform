'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RequestData {
  category: string
  budget_range: string
  timeline: string
  postal_code: string
  description: string
  photos?: string[]
}

function SuccessContent() {
  const [requestData, setRequestData] = useState<RequestData | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('id')

  useEffect(() => {
    const fetchRequestData = async () => {
      if (!requestId) {
        router.push('/request')
        return
      }

      try {
        const response = await fetch(`/api/requests/${requestId}`)
        if (response.ok) {
          const data = await response.json()
          setRequestData(data.request)
        }
      } catch (error) {
        console.error('Error fetching request:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequestData()
  }, [requestId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your request details...</p>
        </div>
      </div>
    )
  }

  if (!requestData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn&apos;t find your renovation request.</p>
          <Button onClick={() => router.push('/request')}>
            Submit New Request
          </Button>
        </div>
      </div>
    )
  }

  const formatCategoryName = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase()
  }

  const formatBudgetRange = (range: string) => {
    switch (range) {
      case 'UNDER_50K':
        return 'Under $50,000'
      case 'RANGE_50_100K':
        return '$50,000 - $100,000'
      case 'OVER_100K':
        return 'Over $100,000'
      default:
        return range
    }
  }

  const formatTimeline = (timeline: string) => {
    switch (timeline) {
      case 'ASAP':
        return 'ASAP'
      case 'WITHIN_1MONTH':
        return 'Within 1 month'
      case 'WITHIN_3MONTHS':
        return 'Within 3 months'
      case 'PLANNING':
        return 'Just planning'
      default:
        return timeline
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Request Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Your renovation request has been sent to qualified contractors in your area.
          </p>
        </div>

        {/* Request Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Request Details</span>
              <Badge variant="outline">
                Request #{requestId?.slice(-8).toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Here&apos;s a summary of your renovation request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Project Type</h3>
                <p className="text-gray-600">{formatCategoryName(requestData.category)} Renovation</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Budget Range</h3>
                <p className="text-gray-600">{formatBudgetRange(requestData.budget_range)}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
                <p className="text-gray-600">{formatTimeline(requestData.timeline)}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600">{requestData.postal_code}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Project Description</h3>
              <p className="text-gray-600">{requestData.description}</p>
            </div>

            {requestData.photos && requestData.photos.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Photos ({requestData.photos.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {requestData.photos.slice(0, 4).map((photo: string, index: number) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`Project photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
            <CardDescription>
              Here&apos;s what you can expect in the coming days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Contractor Matching</h4>
                  <p className="text-sm text-gray-600">
                    We&apos;ll notify qualified contractors in your area about your project within 24 hours.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Receive Quotes</h4>
                  <p className="text-sm text-gray-600">
                    Expect to receive detailed quotes from 3-5 contractors within 2-3 business days.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Compare & Choose</h4>
                  <p className="text-sm text-gray-600">
                    Review proposals, check ratings, and select the contractor that best fits your needs.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/my-projects')}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>View My Projects</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/request')}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Submit Another Request</span>
          </Button>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our team is here to assist you throughout your renovation journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <a href="mailto:support@renovateplatform.com" className="text-blue-600 hover:text-blue-500">
                  📧 support@renovateplatform.com
                </a>
                <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-500">
                  📞 (555) 123-4567
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
