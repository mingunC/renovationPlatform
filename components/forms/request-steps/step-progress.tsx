'use client'

import { cn } from '@/lib/utils'

interface StepProgressProps {
  currentStep: number
  totalSteps: number
  progress: number
  getStepTitle: (step: number) => string
  isStepValid: (step: number) => boolean
  goToStep: (step: number) => void
}

export function StepProgress({ 
  currentStep, 
  totalSteps, 
  progress, 
  getStepTitle, 
  isStepValid, 
  goToStep 
}: StepProgressProps) {
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep || (stepNumber === currentStep && isStepValid(stepNumber))
          const isCurrent = stepNumber === currentStep
          const isPast = stepNumber < currentStep
          
          return (
            <div
              key={stepNumber}
              className="flex flex-col items-center space-y-2 cursor-pointer"
              onClick={() => {
                // Only allow navigation to completed steps or current step
                if (isPast || isCurrent) {
                  goToStep(stepNumber)
                }
              }}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {isCompleted && stepNumber < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < totalSteps && (
                  <div
                    className={cn(
                      'w-16 md:w-24 h-1 ml-2 transition-all duration-200',
                      stepNumber < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-xs text-center hidden md:block',
                  isCurrent ? 'font-medium text-blue-600' : 'text-gray-600'
                )}
              >
                {getStepTitle(stepNumber)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Current Step Title (Mobile) */}
      <div className="md:hidden text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {getStepTitle(currentStep)}
        </h3>
      </div>
    </div>
  )
}
