'use client'

import { Button } from '@/components/ui/button'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  canGoBack: boolean
  canGoNext: boolean
  isSubmitting?: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export function StepNavigation({
  currentStep,
  totalSteps,
  canGoBack,
  canGoNext,
  isSubmitting = false,
  onPrevious,
  onNext,
  onSubmit,
}: StepNavigationProps) {
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <div>
        {canGoBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {!isLastStep ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isSubmitting}
            className="flex items-center space-x-2"
          >
            <span>Continue</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canGoNext || isSubmitting}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Request</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
