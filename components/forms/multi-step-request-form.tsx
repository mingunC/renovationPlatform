'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMultiStepForm } from '@/hooks/use-multi-step-form'

// Step Components
import { ProjectTypeStep } from './request-steps/step-1-project-type'
import { BudgetRangeStep } from './request-steps/step-2-budget-range'
import { TimelineStep } from './request-steps/step-3-timeline'
import { LocationStep } from './request-steps/step-4-location'
import { DetailsStep } from './request-steps/step-5-details'
import { StepProgress } from './request-steps/step-progress'
import { StepNavigation } from './request-steps/step-navigation'

export function MultiStepRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()

  const {
    currentStep,
    totalSteps,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    canGoNext,
    canGoBack,
    isStepValid,
    getStepTitle,
    progress,
  } = useMultiStepForm()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
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
        category: formData.category,
        budget_range: formData.budget_range,
        timeline: formData.timeline,
        postal_code: formData.postal_code,
        address: formData.address,
        description: formData.description,
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
        throw new Error(errorData.error || 'Failed to submit request')
      }

      const result = await response.json()
      
      // Redirect to success page with request ID
      router.push(`/request/success?id=${result.request.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectTypeStep
            selectedType={formData.category}
            onSelect={(type) => updateFormData({ category: type })}
          />
        )
      case 2:
        return (
          <BudgetRangeStep
            selectedBudget={formData.budget_range}
            onSelect={(budget) => updateFormData({ budget_range: budget })}
          />
        )
      case 3:
        return (
          <TimelineStep
            selectedTimeline={formData.timeline}
            onSelect={(timeline) => updateFormData({ timeline: timeline })}
          />
        )
      case 4:
        return (
          <LocationStep
            postalCode={formData.postal_code}
            address={formData.address}
            city={formData.city}
            onUpdate={(data) => updateFormData(data)}
          />
        )
      case 5:
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Section */}
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

      {/* Error Display */}
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
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
          <StepNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            canGoBack={canGoBack}
            canGoNext={canGoNext}
            isSubmitting={isSubmitting}
            onPrevious={prevStep}
            onNext={nextStep}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      {/* Form Data Debug (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-600 mb-2">
                Form Data (Development Only)
              </summary>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(
                  {
                    ...formData,
                    photos: formData.photos.map(photo => ({
                      name: photo.name,
                      size: photo.size,
                      type: photo.type,
                    })),
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
