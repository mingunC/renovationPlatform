import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  fullPage?: boolean
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  text,
  fullPage = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const spinner = (
    <div className={cn(
      "relative inline-block",
      fullPage ? "mx-auto" : "",
      className
    )}>
      <div className={cn(
        "border-gray-200 rounded-full animate-spin border-t-blue-600",
        sizeClasses[size]
      )}></div>
      {(size === 'lg' || size === 'xl') && (
        <div className={cn(
          "absolute inset-0 border-transparent rounded-full animate-ping border-t-blue-400 opacity-30",
          sizeClasses[size]
        )}></div>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        {spinner}
        {text && (
          <p className={cn(
            "mt-4 text-gray-600 font-medium",
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    )
  }

  if (text) {
    return (
      <div className="flex flex-col items-center space-y-2">
        {spinner}
        <p className={cn(
          "text-gray-600 font-medium",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      </div>
    )
  }

  return spinner
}

// Page-specific loading components
export function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FormLoading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Form Header */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Form Actions */}
      <div className="flex space-x-4">
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
    </div>
  )
}

export function TableLoading({ rows = 5, columns = 4 }: { rows?: number, columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        ))}
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, j) => (
              <div key={j} className="h-6 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
