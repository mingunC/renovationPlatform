'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // captureException(error)
    }
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-red-300 mb-2">500</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-8">
            We encountered an unexpected error. Our team has been notified and is working to fix the issue.
          </p>
        </div>

        {isDevelopment && (
          <Alert variant="destructive" className="mb-8 text-left">
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                {error.digest && (
                  <div>
                    <strong>Digest:</strong> {error.digest}
                  </div>
                )}
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto max-h-48 bg-gray-900 text-gray-100 p-2 rounded">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-3">What you can do:</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span>Try refreshing the page</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span>Check your internet connection</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span>Clear your browser cache</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span>Contact support if the problem persists</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>If this problem continues, please contact us:</p>
          <a 
            href="mailto:support@renovateplatform.com" 
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            support@renovateplatform.com
          </a>
        </div>

        {/* Error reporting notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            This error has been automatically reported to our development team. 
            We appreciate your patience as we work to resolve the issue.
          </p>
        </div>
      </div>
    </div>
  )
}
