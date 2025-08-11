'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProfileCompletionProps {
  contractorId?: string
  className?: string
}

interface CompletionData {
  completion_percentage: number
  profile_completed: boolean
  verification_status: {
    insurance_verified: boolean
    wsib_verified: boolean
    skip_verification: boolean
  }
  missing_fields: string[]
  next_steps: string[]
}

export function ProfileCompletion({ contractorId, className = '' }: ProfileCompletionProps) {
  const router = useRouter()
  const [completionData, setCompletionData] = useState<CompletionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCompletionData()
  }, [contractorId])

  const loadCompletionData = async () => {
    try {
      const response = await fetch('/api/contractors/onboarding')
      
      if (!response.ok) {
        throw new Error('Failed to load completion data')
      }

      const data = await response.json()
      
      if (data.onboarding_completed && data.contractor) {
        const contractor = data.contractor
        
        setCompletionData({
          completion_percentage: contractor.completion_percentage || 0,
          profile_completed: contractor.profile_completed || false,
          verification_status: contractor.verification_status || {
            insurance_verified: false,
            wsib_verified: false,
            skip_verification: false,
          },
          missing_fields: getMissingFields(contractor),
          next_steps: getNextSteps(contractor),
        })
      } else {
        // User hasn't completed onboarding
        setCompletionData({
          completion_percentage: 0,
          profile_completed: false,
          verification_status: {
            insurance_verified: false,
            wsib_verified: false,
            skip_verification: false,
          },
          missing_fields: ['Complete onboarding process'],
          next_steps: ['Start contractor onboarding'],
        })
      }
    } catch (err) {
      console.error('Error loading completion data:', err)
      setError('Failed to load profile completion status')
    } finally {
      setLoading(false)
    }
  }

  const getMissingFields = (contractor: any): string[] => {
    const missing: string[] = []
    
    if (!contractor.business_name) missing.push('Business name')
    if (!contractor.service_areas?.length) missing.push('Service areas')
    if (!contractor.categories?.length) missing.push('Categories')
    if (!contractor.verification_status?.insurance_verified && !contractor.verification_status?.skip_verification) {
      missing.push('Insurance verification')
    }
    if (!contractor.verification_status?.wsib_verified && !contractor.verification_status?.skip_verification) {
      missing.push('WSIB verification')
    }
    
    return missing
  }

  const getNextSteps = (contractor: any): string[] => {
    const steps: string[] = []
    
    if (contractor.completion_percentage < 100) {
      if (!contractor.business_name) {
        steps.push('Add business information')
      }
      if (!contractor.service_areas?.length) {
        steps.push('Select service areas')
      }
      if (!contractor.categories?.length) {
        steps.push('Choose specializations')
      }
      if (!contractor.verification_status?.skip_verification && 
          (!contractor.verification_status?.insurance_verified || !contractor.verification_status?.wsib_verified)) {
        steps.push('Upload verification documents')
      }
    } else {
      steps.push('Start bidding on projects!')
    }
    
    return steps
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletionBgColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-100 border-green-200'
    if (percentage >= 75) return 'bg-blue-100 border-blue-200'
    if (percentage >= 50) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  const handleCompleteProfile = () => {
    if (completionData?.completion_percentage === 0) {
      router.push('/contractor-onboarding')
    } else {
      router.push('/contractor/profile/edit')
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>Profile Completion</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!completionData) {
    return null
  }

  const { completion_percentage, profile_completed, verification_status, missing_fields, next_steps } = completionData

  return (
    <Card className={`${className} ${getCompletionBgColor(completion_percentage)}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>Profile Completion</span>
          </CardTitle>
          <Badge 
            variant={profile_completed ? "default" : "secondary"}
            className={profile_completed ? "bg-green-600" : ""}
          >
            {completion_percentage}% Complete
          </Badge>
        </div>
        <CardDescription>
          {profile_completed 
            ? "Your profile is complete and ready for bidding!"
            : "Complete your profile to start receiving project opportunities"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className={`text-sm font-bold ${getCompletionColor(completion_percentage)}`}>
              {completion_percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                completion_percentage >= 100 ? 'bg-green-600' :
                completion_percentage >= 75 ? 'bg-blue-600' :
                completion_percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${completion_percentage}%` }}
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Verification Status</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  verification_status.insurance_verified ? 'bg-green-500' : 
                  verification_status.skip_verification ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-xs text-gray-600">
                  Insurance {verification_status.insurance_verified ? 'Verified' : 
                           verification_status.skip_verification ? 'Skipped' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  verification_status.wsib_verified ? 'bg-green-500' : 
                  verification_status.skip_verification ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-xs text-gray-600">
                  WSIB {verification_status.wsib_verified ? 'Verified' : 
                        verification_status.skip_verification ? 'Skipped' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Profile Health</h4>
            <div className="flex items-center space-x-2">
              {profile_completed ? (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-700 font-medium">Ready for bidding</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm text-yellow-700 font-medium">Needs attention</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Missing Fields */}
        {missing_fields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Missing Information</h4>
            <div className="space-y-1">
              {missing_fields.slice(0, 3).map((field, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">{field}</span>
                </div>
              ))}
              {missing_fields.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{missing_fields.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {next_steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Next Steps</h4>
            <div className="space-y-1">
              {next_steps.slice(0, 2).map((step, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-gray-200">
          {!profile_completed ? (
            <Button 
              onClick={handleCompleteProfile}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              {completion_percentage === 0 ? 'Start Onboarding' : 'Complete Profile'}
            </Button>
          ) : (
            <div className="text-center">
              <div className="text-sm text-green-700 font-medium mb-2">
                🎉 Profile Complete!
              </div>
              <Button 
                onClick={() => router.push('/contractor/dashboard')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                View Opportunities
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
