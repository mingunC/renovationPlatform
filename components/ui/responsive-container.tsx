import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  }

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

// Mobile-first grid component
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md',
  className 
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  }

  const gridCols = `grid-cols-${cols.default}`
  const smCols = cols.sm ? `sm:grid-cols-${cols.sm}` : ''
  const mdCols = cols.md ? `md:grid-cols-${cols.md}` : ''
  const lgCols = cols.lg ? `lg:grid-cols-${cols.lg}` : ''
  const xlCols = cols.xl ? `xl:grid-cols-${cols.xl}` : ''

  return (
    <div className={cn(
      'grid',
      gridCols,
      smCols,
      mdCols,
      lgCols,
      xlCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Mobile navigation wrapper
interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function MobileDrawer({ isOpen, onClose, children, title }: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  )
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode
  size?: {
    default: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  }
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  className?: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div'
}

export function ResponsiveText({ 
  children, 
  size = { default: 'base' },
  weight = 'normal',
  className,
  as: Component = 'p'
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  const defaultSize = sizeClasses[size.default]
  const smSize = size.sm ? `sm:${sizeClasses[size.sm]}` : ''
  const mdSize = size.md ? `md:${sizeClasses[size.md]}` : ''
  const lgSize = size.lg ? `lg:${sizeClasses[size.lg]}` : ''

  return (
    <Component className={cn(
      defaultSize,
      smSize,
      mdSize,
      lgSize,
      weightClasses[weight],
      className
    )}>
      {children}
    </Component>
  )
}

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: boolean
  rounded?: boolean
}

export function MobileCard({ 
  children, 
  className,
  padding = 'md',
  shadow = true,
  rounded = true
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <div className={cn(
      'bg-white border border-gray-200',
      rounded && 'rounded-lg sm:rounded-xl',
      shadow && 'shadow-sm hover:shadow-md transition-shadow',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive spacing component
interface ResponsiveSpacingProps {
  children: React.ReactNode
  y?: {
    default: number
    sm?: number
    md?: number
    lg?: number
  }
  className?: string
}

export function ResponsiveSpacing({ 
  children, 
  y = { default: 4, sm: 6, lg: 8 },
  className 
}: ResponsiveSpacingProps) {
  const defaultSpacing = `space-y-${y.default}`
  const smSpacing = y.sm ? `sm:space-y-${y.sm}` : ''
  const mdSpacing = y.md ? `md:space-y-${y.md}` : ''
  const lgSpacing = y.lg ? `lg:space-y-${y.lg}` : ''

  return (
    <div className={cn(
      defaultSpacing,
      smSpacing,
      mdSpacing,
      lgSpacing,
      className
    )}>
      {children}
    </div>
  )
}
