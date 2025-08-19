'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMultiStepForm } from '@/hooks/use-multi-step-form'
import { createClient } from '@/lib/supabase'

// Step Components
import { PropertyTypeStep } from './request-steps/step-1-property-type'
import { RenovationCategoryStep } from './request-steps/step-2-renovation-category'
import { BudgetRangeStep } from './request-steps/step-3-budget-range'
import { TimelineStep } from './request-steps/step-4-timeline'
import { LocationStep } from './request-steps/step-5-location'
import { DetailsStep } from './request-steps/step-6-details'
import { StepProgress } from './request-steps/step-progress'
import { StepNavigation } from './request-steps/step-navigation'

export function MultiStepRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  const { formData, updateFormData, isStepValid, goToNextStep, goToPreviousStep, currentStep, totalSteps, canGoNext, canGoBack, getStepTitle, progress, goToStep } = useMultiStepForm()
  
  // Auto-scroll to top when step changes
  useEffect(() => {
    const scrollToTop = () => {
      try {
        // Multiple scroll methods for better compatibility
        if (typeof window !== 'undefined') {
          // Method 1: Smooth scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' })
          
          // Method 2: Direct scroll for immediate effect
          setTimeout(() => {
            window.scrollTo(0, 0)
          }, 100)
        }
        
        // Method 3: Scroll form container into view
        if (typeof document !== 'undefined') {
          const formContainer = document.querySelector('[data-form-container]')
          if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      } catch (error) {
        console.log('Auto-scroll error:', error)
      }
    }

    // Scroll to top when step changes (except for initial load)
    if (currentStep > 1) {
      scrollToTop()
    }
  }, [currentStep])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Get current user from Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setSubmitError('로그인이 필요합니다. 다시 로그인해주세요.')
        router.push('/login?redirectTo=/request')
        return
      }

      // Check authentication status with user ID
      console.log('Calling /api/auth/profile with user ID:', user.id)
      const authResponse = await fetch(`/api/auth/profile?id=${user.id}`)
      console.log('Auth response status:', authResponse.status)
      
      if (!authResponse.ok) {
        const errorText = await authResponse.text()
        console.error('Auth API error response:', errorText)
        
        if (authResponse.status === 401) {
          setSubmitError('로그인이 필요합니다. 다시 로그인해주세요.')
          router.push('/login?redirectTo=/request')
          return
        }
        
        // If it's not an auth error, log it but continue with submission
        console.warn('Auth check failed, but continuing with request submission:', errorText)
      }

      // Convert photos to base64 for API submission
      const photoPromises = formData.photos.map(photo => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(photo)
        })
      })

      const photoData = await Promise.all(photoPromises)

      // Prepare the request data
      const requestData = {
        property_type: formData.property_type,
        category: formData.category,
        budget_range: formData.budget_range,
        timeline: formData.timeline,
        postal_code: formData.postal_code,
        address: formData.address,
        description: formData.description,
        inspection_date: formData.inspection_date,
        photos: photoData, // Send as base64 strings
      }

      // Submit to API
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to submit request'
        
        // Handle specific error cases
        if (response.status === 401) {
          setSubmitError('로그인이 필요합니다. 다시 로그인해주세요.')
          router.push('/login?redirectTo=/request')
          return
        } else if (response.status === 403) {
          setSubmitError('고객 계정만 리노베이션 요청을 생성할 수 있습니다.')
          return
        } else if (response.status === 429) {
          setSubmitError('너무 많은 요청이 있습니다. 잠시 후 다시 시도해주세요.')
          return
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('API response received:', result)
      
      // Check if response has the expected structure
      if (!result.request || !result.request.id) {
        console.error('Unexpected API response structure:', result)
        setSubmitError('API 응답 형식이 올바르지 않습니다.')
        return
      }
      
      // Redirect to success page with actual database ID
      router.push(`/request/success?id=${result.request.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyTypeStep
            selectedType={formData.property_type}
            onSelect={(type) => updateFormData({ property_type: type })}
          />
        )
      case 2:
        return (
          <RenovationCategoryStep
            selectedCategories={formData.category}
            propertyType={formData.property_type}
            onSelect={(categories) => updateFormData({ category: categories })}
          />
        )
      case 3:
        return (
          <BudgetRangeStep
            selectedBudget={formData.budget_range}
            onSelect={(budget) => updateFormData({ budget_range: budget })}
          />
        )
      case 4:
        return (
          <TimelineStep
            selectedTimeline={formData.timeline}
            onSelect={(timeline) => updateFormData({ timeline: timeline })}
          />
        )
      case 5:
        return (
          <LocationStep
            postalCode={formData.postal_code}
            address={formData.address}
            city={formData.city}
            inspectionDate={formData.inspection_date}
            onUpdate={(data) => updateFormData(data)}
          />
        )
      case 6:
        return (
          <DetailsStep
            description={formData.description}
            photos={formData.photos}
            onUpdate={(data) => updateFormData(data)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-form-container>
      {/* Progress Section - Compact from Step 2 */}
      {currentStep === 1 ? (
        <Card>
          <CardContent className="p-6">
            <StepProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
              progress={progress}
              getStepTitle={getStepTitle}
              isStepValid={isStepValid}
              goToStep={goToStep}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="md:hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Step {currentStep} of {totalSteps}</span>
              <span className="text-gray-700 font-medium">{getStepTitle(currentStep)}</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription className="text-center">
            <div className="font-medium mb-2">제출 중 오류가 발생했습니다</div>
            <div className="text-sm">{submitError}</div>
            {submitError.includes('로그인') && (
              <div className="text-xs mt-2 text-red-600">
                로그인 페이지로 이동합니다...
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
            <div>Debug: currentStep={currentStep}, canGoNext={canGoNext.toString()}</div>
            <div>Property Type: {formData.property_type || 'null'}</div>
            <div>Step 1 Valid: {isStepValid(1).toString()}</div>
          </div>
          
          <StepNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            canGoBack={canGoBack}
            canGoNext={canGoNext}
            isSubmitting={isSubmitting}
            onPrevious={goToPreviousStep}
            onNext={goToNextStep}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}
