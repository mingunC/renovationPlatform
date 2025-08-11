import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OnboardingData } from '@/hooks/use-contractor-onboarding'

interface BusinessInfoStepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

export function BusinessInfoStep({ data, updateData }: BusinessInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1]?[\s\-\.]?\(?[0-9]{3}\)?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    updateData({ [field]: value })
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Real-time validation
    if (field === 'phone' && value && !validatePhone(value)) {
      setErrors(prev => ({ 
        ...prev, 
        phone: 'Please enter a valid phone number' 
      }))
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    } else if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    }
    return cleaned
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    handleInputChange('phone', formatted)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Renovate Platform! 🏗️
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Let&apos;s start by setting up your business profile. This information will help customers 
          learn about your company and contact you for projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Information Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🏢</span>
                <span>Business Details</span>
              </CardTitle>
              <CardDescription>
                Enter your business information as it appears on official documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="business_name" className="text-sm font-medium">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="business_name"
                  type="text"
                  placeholder="e.g., Smith Construction Ltd."
                  value={data.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  className={errors.business_name ? 'border-red-500' : ''}
                />
                {errors.business_name && (
                  <p className="text-sm text-red-600">{errors.business_name}</p>
                )}
                <p className="text-xs text-gray-500">
                  This is how your business will appear to customers
                </p>
              </div>

              {/* Business Number */}
              <div className="space-y-2">
                <Label htmlFor="business_number" className="text-sm font-medium">
                  Business Number
                  <span className="text-gray-500 ml-1">(Optional)</span>
                </Label>
                <Input
                  id="business_number"
                  type="text"
                  placeholder="e.g., 123456789RC0001"
                  value={data.business_number}
                  onChange={(e) => handleInputChange('business_number', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Your 15-digit Canada Revenue Agency business number
                </p>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Business Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(416) 555-0123"
                  value={data.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
                <p className="text-xs text-gray-500">
                  Customers will use this number to contact you about projects
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center space-x-2">
                <span>💡</span>
                <span>Why we need this information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-blue-800">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Professional Profile</h4>
                  <p className="text-sm text-blue-700">
                    Your business name helps customers identify and trust your services
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Easy Communication</h4>
                  <p className="text-sm text-blue-700">
                    Customers can quickly contact you when interested in your bids
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Future Verification</h4>
                  <p className="text-sm text-blue-700">
                    Business numbers help with verification and tax reporting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <AlertDescription>
              <strong>Privacy Note:</strong> Your information is secure and will only be shared 
              with customers when you submit bids on their projects.
            </AlertDescription>
          </Alert>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center space-x-2">
                <span>🚀</span>
                <span>Quick Setup Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-green-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Use your official business name</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Provide a phone number customers can reach</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Business number can be added later</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Business Information</h3>
              <p className="text-sm text-gray-600">Essential details about your company</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {data.business_name && data.phone ? (
              <div className="flex items-center space-x-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Ready to continue</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">
                Complete required fields to continue
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
