import { useState, useCallback } from 'react'

export interface OnboardingData {
  // Step 1 - Business Info
  business_name: string
  business_number: string
  phone: string
  
  // Step 2 - Service Areas
  service_areas: string[]
  
  // Step 3 - Categories
  categories: string[]
  
  // Step 4 - Verification (optional)
  insurance_document?: File | null
  wsib_certificate?: File | null
  business_license_number?: string
  
  // Completion tracking
  completed_steps: number[]
  skip_verification: boolean
}

const initialData: OnboardingData = {
  business_name: '',
  business_number: '',
  phone: '',
  service_areas: [],
  categories: [],
  insurance_document: null,
  wsib_certificate: null,
  business_license_number: '',
  completed_steps: [],
  skip_verification: false,
}

export function useContractorOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 4

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  const markStepCompleted = useCallback((step: number) => {
    setData(prev => ({
      ...prev,
      completed_steps: [...new Set([...prev.completed_steps, step])]
    }))
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      markStepCompleted(currentStep)
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps, markStepCompleted])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
    }
  }, [totalSteps])

  const skipToEnd = useCallback(() => {
    markStepCompleted(currentStep)
    setCurrentStep(totalSteps)
    updateData({ skip_verification: true })
  }, [currentStep, totalSteps, markStepCompleted, updateData])

  const getCompletionPercentage = useCallback(() => {
    let completed = 0
    
    // Step 1 - Business Info (required)
    if (data.business_name && data.phone) completed += 25
    
    // Step 2 - Service Areas (required)
    if (data.service_areas.length > 0) completed += 25
    
    // Step 3 - Categories (required)
    if (data.categories.length > 0) completed += 25
    
    // Step 4 - Verification (optional, but adds to completion)
    if (data.skip_verification || 
        (data.insurance_document && data.wsib_certificate) ||
        data.completed_steps.includes(4)) {
      completed += 25
    }
    
    return completed
  }, [data])

  const canProceedToNext = useCallback((step: number) => {
    switch (step) {
      case 1:
        return data.business_name.trim() !== '' && data.phone.trim() !== ''
      case 2:
        return data.service_areas.length > 0
      case 3:
        return data.categories.length > 0
      case 4:
        return true // Verification is optional
      default:
        return false
    }
  }, [data])

  const isStepCompleted = useCallback((step: number) => {
    return data.completed_steps.includes(step)
  }, [data.completed_steps])

  const submitOnboarding = useCallback(async () => {
    setIsSubmitting(true)
    
    try {
      // Create FormData for file uploads
      const formData = new FormData()
      
      // Add basic data
      formData.append('business_name', data.business_name)
      formData.append('business_number', data.business_number)
      formData.append('phone', data.phone)
      formData.append('service_areas', JSON.stringify(data.service_areas))
      formData.append('categories', JSON.stringify(data.categories))
      formData.append('business_license_number', data.business_license_number || '')
      formData.append('skip_verification', data.skip_verification.toString())
      
      // Add files if present
      if (data.insurance_document) {
        formData.append('insurance_document', data.insurance_document)
      }
      if (data.wsib_certificate) {
        formData.append('wsib_certificate', data.wsib_certificate)
      }

      const response = await fetch('/api/contractors/onboarding', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to submit onboarding')
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (error) {
      console.error('Onboarding submission error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [data])

  return {
    currentStep,
    data,
    totalSteps,
    isSubmitting,
    
    // Actions
    updateData,
    nextStep,
    prevStep,
    goToStep,
    skipToEnd,
    submitOnboarding,
    
    // Status checks
    canProceedToNext,
    isStepCompleted,
    getCompletionPercentage,
    
    // Computed properties
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    completionPercentage: getCompletionPercentage(),
  }
}
