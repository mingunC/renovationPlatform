'use client'

import { useRouter } from 'next/navigation'
import { useContractorOnboarding } from '@/hooks/use-contractor-onboarding'
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress'
import { OnboardingNavigation } from '@/components/onboarding/onboarding-navigation'
import { BusinessInfoStep } from '@/components/onboarding/steps/business-info-step'
import { ServiceAreasStep } from '@/components/onboarding/steps/service-areas-step'
import { CategoriesStep } from '@/components/onboarding/steps/categories-step'
import { VerificationStep } from '@/components/onboarding/steps/verification-step'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'

export default function ContractorOnboardingPage() {
  const router = useRouter()
  const onboarding = useContractorOnboarding()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleComplete = async () => {
    setSubmitError(null)
    
    const result = await onboarding.submitOnboarding()
    
    if (result.success) {
      // Redirect to dashboard with success message
      router.push('/contractor/dashboard?onboarding=complete')
    } else {
      setSubmitError(result.error || 'Failed to complete onboarding')
    }
  }

  const handleSkipToEnd = () => {
    onboarding.skipToEnd()
  }

  const renderCurrentStep = () => {
    switch (onboarding.currentStep) {
      case 1:
        return <BusinessInfoStep {...onboarding} />
      case 2:
        return <ServiceAreasStep {...onboarding} />
      case 3:
        return <CategoriesStep {...onboarding} />
      case 4:
        return <VerificationStep {...onboarding} onComplete={handleComplete} />
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (onboarding.currentStep) {
      case 1:
        return 'Business Information'
      case 2:
        return 'Service Areas'
      case 3:
        return 'Categories & Specializations'
      case 4:
        return 'Verification & Documents'
      default:
        return 'Contractor Onboarding'
    }
  }

  const getStepDescription = () => {
    switch (onboarding.currentStep) {
      case 1:
        return 'Tell us about your business to get started'
      case 2:
        return 'Select the areas where you provide services'
      case 3:
        return 'Choose your areas of expertise'
      case 4:
        return 'Upload verification documents (optional for now)'
      default:
        return 'Complete your contractor profile'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🏗️ Contractor Onboarding
              </h1>
              <p className="text-gray-600 mt-1">
                Set up your contractor profile to start receiving project opportunities
              </p>
            </div>
            
            {/* Skip Option */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleSkipToEnd}
                className="text-gray-600"
              >
                Complete Profile Later
              </Button>
              <div className="text-sm text-gray-500">
                {onboarding.completionPercentage}% Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Progress Indicator */}
          <OnboardingProgress
            currentStep={onboarding.currentStep}
            totalSteps={onboarding.totalSteps}
            completedSteps={onboarding.data.completed_steps}
            onStepClick={onboarding.goToStep}
          />

          {/* Main Content */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    Step {onboarding.currentStep}: {getStepTitle()}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    {getStepDescription()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {onboarding.currentStep}
                  </div>
                  <div className="text-sm text-gray-500">
                    of {onboarding.totalSteps}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {submitError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {renderCurrentStep()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <OnboardingNavigation
            currentStep={onboarding.currentStep}
            totalSteps={onboarding.totalSteps}
            canProceed={onboarding.canProceedToNext(onboarding.currentStep)}
            isSubmitting={onboarding.isSubmitting}
            onNext={onboarding.nextStep}
            onPrev={onboarding.prevStep}
            onComplete={handleComplete}
            onSkip={handleSkipToEnd}
          />
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>
    </div>
  )
}