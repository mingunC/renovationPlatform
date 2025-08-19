import { Metadata } from 'next'
import { MultiStepRequestForm } from '@/components/forms/multi-step-request-form'

export const metadata: Metadata = {
  title: 'Submit Request | Renovate Platform',
  description: 'Submit your renovation request to get quotes from contractors',
}

export default function RequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Submit Your Renovation Request
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your project and get connected with verified contractors 
            who will provide detailed quotes tailored to your needs.
          </p>
        </div>
        
        <MultiStepRequestForm />
      </div>
    </div>
  )
}