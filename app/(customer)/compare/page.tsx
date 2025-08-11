import { Metadata } from 'next'
import { BidsComparisonTable } from '@/components/tables/bids-comparison-table'

export const metadata: Metadata = {
  title: 'Compare Bids | Renovate Platform',
  description: 'Compare bids from different contractors',
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Compare Contractor Bids
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Review and compare bids from contractors to make an informed decision
          </p>
        </div>
        
        <BidsComparisonTable />
      </div>
    </div>
  )
}
