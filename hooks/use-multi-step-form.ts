import { useState, useCallback } from 'react'
import { PropertyType } from '@/types'

export interface RenovationFormData {
  // Step 1 - Property Type
  property_type: PropertyType | null
  
  // Step 2 - Renovation Category
  category: 'KITCHEN' | 'BATHROOM' | 'BASEMENT' | 'FLOORING' | 'PAINTING' | 'OTHER' | 'OFFICE' | 'RETAIL' | 'CAFE_RESTAURANT' | 'EDUCATION' | 'HOSPITALITY_HEALTHCARE' | null
  
  // Step 3 - Budget Range
  budget_range: 'UNDER_50K' | 'RANGE_50_100K' | 'OVER_100K' | null
  
  // Step 4 - Timeline
  timeline: 'ASAP' | 'WITHIN_1MONTH' | 'WITHIN_3MONTHS' | 'PLANNING' | null
  
  // Step 5 - Location
  postal_code: string
  address: string
  city: string
  inspection_date: string
  
  // Step 6 - Details
  description: string
  photos: File[]
}

const initialFormData: RenovationFormData = {
  property_type: null,
  category: null,
  budget_range: null,
  timeline: null,
  postal_code: '',
  address: '',
  city: '',
  description: '',
  photos: [],
  inspection_date: '',
}

export const useMultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<RenovationFormData>(initialFormData)

  const totalSteps = 6

  const updateFormData = useCallback((updates: Partial<RenovationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  }, [totalSteps])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, totalSteps)))
  }, [totalSteps])

  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return formData.property_type !== null
      case 2:
        return formData.category !== null
      case 3:
        return formData.budget_range !== null
      case 4:
        return formData.timeline !== null
      case 5:
        return formData.postal_code.length >= 6 && formData.address.length >= 10 && formData.inspection_date !== ''
      case 6:
        return formData.description.length >= 10
      default:
        return false
    }
  }, [formData])

  const canGoNext = isStepValid(currentStep)
  const canGoBack = currentStep > 1

  const reset = useCallback(() => {
    setCurrentStep(1)
    setFormData(initialFormData)
  }, [])

  const getStepTitle = useCallback((step: number): string => {
    switch (step) {
      case 1:
        return 'Property Type'
      case 2:
        return 'Renovation Category'
      case 3:
        return 'Budget Range'
      case 4:
        return 'Timeline'
      case 5:
        return 'Location'
      case 6:
        return 'Details'
      default:
        return ''
    }
  }, [])

  const progress = (currentStep / totalSteps) * 100

  return {
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
    reset,
    getStepTitle,
    progress,
  }
}
