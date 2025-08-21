import { Metadata, Viewport } from 'next'
import { MyBidsList } from '@/components/contractor/my-bids-list'

export const metadata: Metadata = {
  title: 'My Bids | Renovate Platform - Contractors',
  description: 'Manage your submitted bids and track their status',
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark'
}

export default function MyBidsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Bids
          </h1>
          <p className="mt-2 text-gray-600">
            Track the status of your submitted bids and manage your proposals
          </p>
        </div>

        {/* Bids List */}
        <MyBidsList />

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bidding Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Total Bids</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">6</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">33%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-green-900 mb-2">✅ Improve Your Success Rate</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Follow up on pending bids with additional information or clarifications</li>
                <li>• Update your bids if the customer asks questions or requests changes</li>
                <li>• Maintain professional communication throughout the bidding process</li>
                <li>• Learn from rejected bids by asking for feedback when appropriate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}