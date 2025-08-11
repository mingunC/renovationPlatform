import { Button } from '@/components/ui/button'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

export function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  completedSteps, 
  onStepClick 
}: OnboardingProgressProps) {
  const steps = [
    {
      number: 1,
      title: 'Business Info',
      icon: '🏢',
      description: 'Company details',
    },
    {
      number: 2,
      title: 'Service Areas',
      icon: '📍',
      description: 'Coverage zones',
    },
    {
      number: 3,
      title: 'Categories',
      icon: '🔧',
      description: 'Specializations',
    },
    {
      number: 4,
      title: 'Verification',
      icon: '✅',
      description: 'Documents (optional)',
    },
  ]

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed'
    if (stepNumber === currentStep) return 'current'
    if (stepNumber < currentStep) return 'accessible'
    return 'upcoming'
  }

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white border-green-600'
      case 'current':
        return 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-200'
      case 'accessible':
        return 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
      default:
        return 'bg-gray-100 text-gray-400 border-gray-300'
    }
  }

  const canClickStep = (stepNumber: number, status: string) => {
    return status === 'completed' || status === 'accessible' || status === 'current'
  }

  return (
    <div className="w-full">
      {/* Mobile Progress Bar */}
      <div className="block sm:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((completedSteps.length / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-center">
          <h3 className="font-medium text-gray-900">
            {steps[currentStep - 1]?.icon} {steps[currentStep - 1]?.title}
          </h3>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.number)
              const isClickable = canClickStep(step.number, status)
              
              return (
                <li key={step.number} className="relative flex-1">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-300 -z-10">
                      <div 
                        className={`h-full bg-blue-600 transition-all duration-300 ${
                          completedSteps.includes(step.number) ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                  
                  {/* Step Content */}
                  <div className="flex flex-col items-center group">
                    <Button
                      variant="ghost"
                      className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                        transition-all duration-200 p-0
                        ${getStepClasses(status)}
                        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                      `}
                      onClick={() => isClickable && onStepClick(step.number)}
                      disabled={!isClickable}
                    >
                      {status === 'completed' ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-lg">{step.icon}</span>
                      )}
                    </Button>
                    
                    <div className="mt-3 text-center">
                      <h3 className={`
                        text-sm font-medium transition-colors duration-200
                        ${status === 'current' ? 'text-blue-600' : 
                          status === 'completed' ? 'text-green-600' : 
                          status === 'accessible' ? 'text-gray-900' : 'text-gray-500'}
                      `}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      {/* Overall Progress Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {completedSteps.length} Completed
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {totalSteps - currentStep} Remaining
              </span>
            </div>
          </div>
          
          <div className="text-sm font-medium text-gray-900">
            {Math.round(((completedSteps.length + (currentStep > completedSteps.length ? 0.5 : 0)) / totalSteps) * 100)}% Complete
          </div>
        </div>
      </div>
    </div>
  )
}
