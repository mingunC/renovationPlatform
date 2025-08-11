import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OnboardingData } from '@/hooks/use-contractor-onboarding'

interface VerificationStepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  onComplete: () => void
}

export function VerificationStep({ data, updateData, onComplete }: VerificationStepProps) {
  const [uploadStatus, setUploadStatus] = useState<{
    insurance: 'idle' | 'uploading' | 'success' | 'error'
    wsib: 'idle' | 'uploading' | 'success' | 'error'
  }>({
    insurance: 'idle',
    wsib: 'idle'
  })

  const insuranceInputRef = useRef<HTMLInputElement>(null)
  const wsibInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (type: 'insurance' | 'wsib', file: File) => {
    setUploadStatus(prev => ({ ...prev, [type]: 'uploading' }))

    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF, JPEG, or PNG file')
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Update data
      updateData({
        [type === 'insurance' ? 'insurance_document' : 'wsib_certificate']: file
      })

      setUploadStatus(prev => ({ ...prev, [type]: 'success' }))
    } catch (error) {
      console.error(`Error uploading ${type} document:`, error)
      setUploadStatus(prev => ({ ...prev, [type]: 'error' }))
    }
  }

  const handleFileInputChange = (type: 'insurance' | 'wsib', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(type, file)
    }
  }

  const removeFile = (type: 'insurance' | 'wsib') => {
    updateData({
      [type === 'insurance' ? 'insurance_document' : 'wsib_certificate']: null
    })
    setUploadStatus(prev => ({ ...prev, [type]: 'idle' }))
    
    // Clear the input
    if (type === 'insurance' && insuranceInputRef.current) {
      insuranceInputRef.current.value = ''
    }
    if (type === 'wsib' && wsibInputRef.current) {
      wsibInputRef.current.value = ''
    }
  }

  const getFileDisplayName = (file: File | null | undefined) => {
    if (!file) return ''
    const name = file.name
    if (name.length > 30) {
      return name.substring(0, 27) + '...'
    }
    return name
  }

  const getUploadStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return (
          <svg className="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      case 'success':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const isDocumentUploaded = (type: 'insurance' | 'wsib') => {
    return type === 'insurance' ? !!data.insurance_document : !!data.wsib_certificate
  }

  const allDocumentsUploaded = isDocumentUploaded('insurance') && isDocumentUploaded('wsib')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verification Documents ✅
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your business verification documents to build trust with customers. 
          <span className="font-medium text-blue-600"> This step is optional</span> and can be 
          completed later from your dashboard.
        </p>
      </div>

      {/* Optional Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <AlertDescription className="text-blue-800">
          <strong>Verification is optional:</strong> You can start receiving projects immediately and 
          complete verification later. Verified contractors typically receive more bids and build 
          greater customer trust.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Documents Upload */}
        <div className="space-y-6">
          {/* Insurance Document */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>Insurance Certificate</span>
                </div>
                <Badge variant="secondary">Optional</Badge>
              </CardTitle>
              <CardDescription>
                Upload your general liability insurance certificate (PDF, JPEG, or PNG)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isDocumentUploaded('insurance') ? (
                <div>
                  <input
                    ref={insuranceInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileInputChange('insurance', e)}
                    className="hidden"
                    id="insurance-upload"
                  />
                  <label
                    htmlFor="insurance-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> insurance certificate
                      </p>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 5MB)</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getUploadStatusIcon(uploadStatus.insurance)}
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {getFileDisplayName(data.insurance_document)}
                      </p>
                      <p className="text-xs text-green-700">Insurance certificate uploaded</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('insurance')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* WSIB Certificate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>⚡</span>
                  <span>WSIB Certificate</span>
                </div>
                <Badge variant="secondary">Optional</Badge>
              </CardTitle>
              <CardDescription>
                Upload your WSIB (Workplace Safety Insurance Board) certificate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isDocumentUploaded('wsib') ? (
                <div>
                  <input
                    ref={wsibInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileInputChange('wsib', e)}
                    className="hidden"
                    id="wsib-upload"
                  />
                  <label
                    htmlFor="wsib-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> WSIB certificate
                      </p>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 5MB)</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getUploadStatusIcon(uploadStatus.wsib)}
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {getFileDisplayName(data.wsib_certificate)}
                      </p>
                      <p className="text-xs text-green-700">WSIB certificate uploaded</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('wsib')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business License Number */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Business License</span>
                </div>
                <Badge variant="secondary">Optional</Badge>
              </CardTitle>
              <CardDescription>
                Enter your municipal business license number if you have one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="business_license_number" className="text-sm font-medium">
                  License Number
                </Label>
                <Input
                  id="business_license_number"
                  type="text"
                  placeholder="e.g., BL-2024-001234"
                  value={data.business_license_number || ''}
                  onChange={(e) => updateData({ business_license_number: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  Your municipal business license number (varies by city)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center space-x-2">
                <span>🌟</span>
                <span>Benefits of Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-green-800">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">Increased Trust</h4>
                  <p className="text-sm text-green-700">
                    Verified contractors get 3x more bid acceptances from customers
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">📈</span>
                </div>
                <div>
                  <h4 className="font-medium">Higher Project Values</h4>
                  <p className="text-sm text-green-700">
                    Verified contractors can bid on premium projects with higher budgets
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">🛡️</span>
                </div>
                <div>
                  <h4 className="font-medium">Professional Image</h4>
                  <p className="text-sm text-green-700">
                    Display verification badges on your profile and bids
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">🚀</span>
                </div>
                <div>
                  <h4 className="font-medium">Priority Matching</h4>
                  <p className="text-sm text-green-700">
                    Get notified about new projects before unverified contractors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center space-x-2">
                <span>📄</span>
                <span>Document Requirements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-blue-800">
              <div>
                <h4 className="font-medium">Insurance Certificate:</h4>
                <p className="text-sm text-blue-700">
                  General liability insurance with minimum $2M coverage
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">WSIB Certificate:</h4>
                <p className="text-sm text-blue-700">
                  Current workplace safety insurance coverage
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Business License:</h4>
                <p className="text-sm text-blue-700">
                  Municipal business license (if required in your area)
                </p>
              </div>

              <div className="pt-2 border-t border-blue-300">
                <p className="text-xs text-blue-700">
                  All documents are reviewed within 24-48 hours by our verification team
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <AlertDescription>
              <strong>Document Security:</strong> All uploaded documents are encrypted and stored 
              securely. They are only used for verification purposes and are never shared with 
              third parties.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Completion Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">4</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Verification & Documents</h3>
              <p className="text-sm text-gray-600">
                {allDocumentsUploaded ? 
                  'All documents uploaded - ready for verification' : 
                  'Optional - can be completed later'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {allDocumentsUploaded ? (
              <div className="flex items-center space-x-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Documents uploaded</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">
                Ready to complete setup
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
