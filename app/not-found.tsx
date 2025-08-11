'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. 
            The page may have been moved, deleted, or you may have entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-3">Quick Links</h2>
            <div className="space-y-2">
              <Link 
                href="/" 
                className="block text-blue-600 hover:text-blue-700 transition-colors"
              >
                → Home Page
              </Link>
              <Link 
                href="/contractor/dashboard" 
                className="block text-blue-600 hover:text-blue-700 transition-colors"
              >
                → Contractor Dashboard
              </Link>
              <Link 
                href="/customer/request" 
                className="block text-blue-600 hover:text-blue-700 transition-colors"
              >
                → Submit Project Request
              </Link>
              <Link 
                href="/login" 
                className="block text-blue-600 hover:text-blue-700 transition-colors"
              >
                → Login
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              Return Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Need help? Contact our support team</p>
          <a 
            href="mailto:support@renovateplatform.com" 
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            support@renovateplatform.com
          </a>
        </div>
      </div>
    </div>
  )
}
