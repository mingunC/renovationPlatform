import { Metadata } from 'next'
import { MetricsCards } from '@/components/dashboard/metrics-cards'
import { RequestList } from '@/components/dashboard/request-list'
import { ContractorDashboardTabs } from '@/components/dashboard/contractor-dashboard-tabs'

export const metadata: Metadata = {
  title: 'Dashboard | Renovate Platform - Contractors',
  description: 'View new renovation requests and manage your bids',
}

// This would come from API in production
async function getDashboardMetrics() {
  // Simulate API call
  return {
    newRequestsThisWeek: 12,
    activeBids: 8,
    estimatedRevenue: 47500,
  }
}

export default async function ContractorDashboard() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Contractor Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor your performance and find new renovation opportunities
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="mb-8">
          <MetricsCards data={metrics} />
        </div>

        {/* Dashboard Tabs */}
        <div className="space-y-6">
          <ContractorDashboardTabs />
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/contractor/bids"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">My Bids</h4>
                <p className="text-sm text-gray-600">Manage submitted bids</p>
              </div>
            </a>

            <a
              href="/contractor/profile"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Profile</h4>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
            </a>

            <a
              href="/contractor/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-600">View performance metrics</p>
              </div>
            </a>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">💡 Tips for Success</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Submit competitive bids within 24 hours for better visibility</li>
                <li>• Include detailed breakdowns to build customer trust</li>
                <li>• Respond quickly to customer questions to build strong relationships</li>
                <li>• Update your profile with recent work photos and certifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}