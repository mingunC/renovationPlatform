import { Button } from '@/components/ui/button'

interface OnboardingNavigationProps {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  isSubmitting: boolean
  onNext: () => void
  onPrev: () => void
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isSubmitting,
  onNext,
  onPrev,
  onComplete,
  onSkip,
}: OnboardingNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Left side - Back button */}
      <div className="flex items-center space-x-4">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onPrev}
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

      {/* Center - Step indicator */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Step {currentStep} of {totalSteps}</span>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center space-x-4">
        {/* Skip button (not on last step) */}
        {!isLastStep && (
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isSubmitting}
            className="text-gray-600 hover:text-gray-900"
          >
            Complete Profile Later
          </Button>
        )}

        {/* Main action button */}
        {isLastStep ? (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onSkip}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Skip Verification</span>
            </Button>
            
            <Button
              onClick={onComplete}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Complete Setup</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 min-w-[120px]"
          >
            <span>Next Step</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>

      {/* Validation hint */}
      {!canProceed && !isLastStep && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800">
            Please complete the required fields to continue
          </div>
        </div>
      )}
    </div>
  )
}
