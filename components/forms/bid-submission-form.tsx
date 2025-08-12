'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

const bidSchema = z.object({
  labor_cost: z.number().min(0, 'Labor cost must be positive'),
  material_cost: z.number().min(0, 'Material cost must be positive'),
  permit_cost: z.number().min(0, 'Permit cost must be zero or positive'),
  disposal_cost: z.number().min(0, 'Disposal cost must be zero or positive'),
  timeline_weeks: z.number().min(1, 'Timeline must be at least 1 week').max(52, 'Timeline cannot exceed 52 weeks'),
  start_date: z.string().min(1, 'Start date is required'),
  included_items: z.string().min(10, 'Please describe what is included (minimum 10 characters)'),
  excluded_items: z.string().optional(),
  notes: z.string().optional(),
})

type BidFormData = z.infer<typeof bidSchema>

interface BidSubmissionFormProps {
  requestId: string
  requestData?: {
    category: string
    budget_range: string
    postal_code: string
    description: string
  }
}

export function BidSubmissionForm({ requestId, requestData }: BidSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      labor_cost: 0,
      material_cost: 0,
      permit_cost: 0,
      disposal_cost: 0,
      timeline_weeks: 4,
      start_date: '',
      included_items: '',
      excluded_items: '',
      notes: '',
    },
  })

  // Watch cost fields for auto-calculation
  const laborCost = watch('labor_cost')
  const materialCost = watch('material_cost')
  const permitCost = watch('permit_cost')
  const disposalCost = watch('disposal_cost')

  const totalAmount = laborCost + materialCost + permitCost + disposalCost

  // Set minimum start date to tomorrow
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minDate = tomorrow.toISOString().split('T')[0]
    setValue('start_date', minDate)
  }, [setValue])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleCostChange = (field: keyof BidFormData, value: string) => {
    const numericValue = parseFloat(value) || 0
    setValue(field, numericValue)
  }

  const onSubmit = async (data: BidFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const bidData = {
        ...data,
        request_id: requestId,
        total_amount: totalAmount,
      }

      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bidData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit bid')
      }

      const result = await response.json()
      
      // Redirect to bids page with success message
      router.push(`/contractor/bids?submitted=${result.bid.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit bid')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'KITCHEN': return '🍳'
      case 'BATHROOM': return '🚿'
      case 'BASEMENT': return '🏠'
      case 'FLOORING': return '🏗️'
      case 'PAINTING': return '🎨'
      case 'OTHER': return '🔧'
      default: return '📋'
    }
  }

  const formatCategoryName = (category: string): string => {
    return category.charAt(0) + category.slice(1).toLowerCase()
  }

  const formatBudgetRange = (range: string): string => {
    switch (range) {
      case 'UNDER_50K': return 'Under $50,000'
      case 'RANGE_50_100K': return '$50,000 - $100,000'
      case 'OVER_100K': return 'Over $100,000'
      default: return range
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Request Summary */}
      {requestData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">{getCategoryIcon(requestData.category)}</span>
              <span>{formatCategoryName(requestData.category)} Renovation</span>
            </CardTitle>
            <CardDescription>
              Budget: {formatBudgetRange(requestData.budget_range)} • Location: {requestData.postal_code}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{requestData.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Bid Submission Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>
              Provide a detailed breakdown of your project costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="labor_cost">Labor Cost *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="labor_cost"
                    type="number"
                    step="0.01"
                    className="pl-8"
                    placeholder="0.00"
                    onChange={(e) => handleCostChange('labor_cost', e.target.value)}
                  />
                </div>
                {errors.labor_cost && (
                  <p className="text-sm text-red-600">{errors.labor_cost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="material_cost">Materials Cost *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="material_cost"
                    type="number"
                    step="0.01"
                    className="pl-8"
                    placeholder="0.00"
                    onChange={(e) => handleCostChange('material_cost', e.target.value)}
                  />
                </div>
                {errors.material_cost && (
                  <p className="text-sm text-red-600">{errors.material_cost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="permit_cost">Permits & Fees</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="permit_cost"
                    type="number"
                    step="0.01"
                    className="pl-8"
                    placeholder="0.00"
                    onChange={(e) => handleCostChange('permit_cost', e.target.value)}
                  />
                </div>
                {errors.permit_cost && (
                  <p className="text-sm text-red-600">{errors.permit_cost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="disposal_cost">Disposal & Cleanup</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="disposal_cost"
                    type="number"
                    step="0.01"
                    className="pl-8"
                    placeholder="0.00"
                    onChange={(e) => handleCostChange('disposal_cost', e.target.value)}
                  />
                </div>
                {errors.disposal_cost && (
                  <p className="text-sm text-red-600">{errors.disposal_cost.message}</p>
                )}
              </div>
            </div>

            {/* Total Amount Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-blue-900">Total Project Cost:</span>
                <span className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline & Schedule</CardTitle>
            <CardDescription>
              Specify your project timeline and availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="timeline_weeks">Project Duration (weeks) *</Label>
                <Select onValueChange={(value) => setValue('timeline_weeks', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((weeks) => (
                      <SelectItem key={weeks} value={weeks.toString()}>
                        {weeks} {weeks === 1 ? 'week' : 'weeks'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timeline_weeks && (
                  <p className="text-sm text-red-600">{errors.timeline_weeks.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Earliest Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date')}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-600">{errors.start_date.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Describe what&apos;s included and excluded in your bid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="included_items">What&apos;s Included *</Label>
              <Textarea
                id="included_items"
                placeholder="Describe all work, materials, and services included in your bid..."
                rows={4}
                {...register('included_items')}
              />
              {errors.included_items && (
                <p className="text-sm text-red-600">{errors.included_items.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excluded_items">What&apos;s Not Included</Label>
              <Textarea
                id="excluded_items"
                placeholder="List any work or materials not included in this bid..."
                rows={3}
                {...register('excluded_items')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information, terms, or special considerations..."
                rows={3}
                {...register('notes')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || totalAmount === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Bid...
              </>
            ) : (
              `Submit Bid for ${formatCurrency(totalAmount)}`
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
