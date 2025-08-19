import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BidSubmissionForm } from '@/components/forms/bid-submission-form'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Submit Bid | Renovate Platform - Contractors',
  description: 'Submit your bid for this renovation request',
}

interface BidPageProps {
  params: Promise<{ requestId: string }>
}

async function getRequestData(requestId: string) {
  try {
    const request = await prisma.renovationRequest.findUnique({
      where: { id: requestId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        bids: {
          include: {
            contractor: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            bids: true
          }
        }
      }
    })

    if (!request || (request.status !== 'OPEN' && request.status !== 'BIDDING_OPEN')) {
      return null
    }

    return request
  } catch (error) {
    console.error('Error fetching request:', error)
    return null
  }
}

export default async function BidSubmissionPage({ params }: BidPageProps) {
  const { requestId } = await params
  const requestData = await getRequestData(requestId)

  if (!requestData) {
    notFound()
  }

  const formatBudgetRange = (range: string): string => {
    switch (range) {
      case 'UNDER_50K': return 'Under $50,000'
      case 'RANGE_50_100K': return '$50,000 - $100,000'
      case 'OVER_100K': return 'Over $100,000'
      default: return range
    }
  }

  const formatCategoryName = (category: string): string => {
    return category.charAt(0) + category.slice(1).toLowerCase()
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Submit Bid for {formatCategoryName(requestData.category)} Project
          </h1>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <span>Posted {getTimeAgo(requestData.created_at.toISOString())}</span>
            <span>•</span>
            <span>{requestData._count.bids} {requestData._count.bids === 1 ? 'bid' : 'bids'} submitted</span>
            <span>•</span>
            <span>Budget: {formatBudgetRange(requestData.budget_range)}</span>
          </div>
        </div>

        {/* Competition Alert */}
        {requestData._count.bids > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-amber-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-amber-800">
                  {requestData._count.bids} {requestData._count.bids === 1 ? 'contractor has' : 'contractors have'} already submitted bids
                </h4>
                <p className="text-sm text-amber-700">
                  Make your bid competitive and detailed to stand out from the competition.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bid Submission Form */}
        <BidSubmissionForm 
          requestId={requestId} 
          requestData={requestData}
        />

        {/* Bidding Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">💡 Bidding Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about what&apos;s included in your labor and materials costs</li>
                <li>• Include realistic timelines - customers value reliability over speed</li>
                <li>• Mention your relevant experience or certifications in the notes</li>
                <li>• Be transparent about potential additional costs or change orders</li>
                <li>• Consider offering a warranty or guarantee for your work</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
