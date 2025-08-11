'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const renovationRequestSchema = z.object({
  category: z.enum(['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING', 'OTHER']),
  budget_range: z.enum(['UNDER_50K', 'RANGE_50_100K', 'OVER_100K']),
  timeline: z.enum(['ASAP', 'WITHIN_1MONTH', 'WITHIN_3MONTHS', 'PLANNING']),
  postal_code: z.string().min(6, 'Please enter a valid postal code'),
  address: z.string().min(10, 'Please enter a complete address'),
  description: z.string().min(50, 'Please provide a detailed description (at least 50 characters)'),
})

type RenovationRequestFormData = z.infer<typeof renovationRequestSchema>

export function RenovationRequestForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RenovationRequestFormData>({
    resolver: zodResolver(renovationRequestSchema),
  })

  const onSubmit = async (data: RenovationRequestFormData) => {
    setIsLoading(true)
    try {
      // TODO: Implement renovation request submission
      console.log('Renovation request data:', data)
      // Add your submission logic here
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Renovation Category</Label>
          <Select onValueChange={(value) => setValue('category', value as 'KITCHEN' | 'BATHROOM' | 'BASEMENT' | 'FLOORING' | 'PAINTING' | 'OTHER')}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KITCHEN">Kitchen</SelectItem>
              <SelectItem value="BATHROOM">Bathroom</SelectItem>
              <SelectItem value="BASEMENT">Basement</SelectItem>
              <SelectItem value="FLOORING">Flooring</SelectItem>
              <SelectItem value="PAINTING">Painting</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget_range">Budget Range</Label>
          <Select onValueChange={(value) => setValue('budget_range', value as 'UNDER_50K' | 'RANGE_50_100K' | 'OVER_100K')}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNDER_50K">Under $50,000</SelectItem>
              <SelectItem value="RANGE_50_100K">$50,000 - $100,000</SelectItem>
              <SelectItem value="OVER_100K">Over $100,000</SelectItem>
            </SelectContent>
          </Select>
          {errors.budget_range && (
            <p className="text-sm text-red-600">{errors.budget_range.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline</Label>
          <Select onValueChange={(value) => setValue('timeline', value as 'ASAP' | 'WITHIN_1MONTH' | 'WITHIN_3MONTHS' | 'PLANNING')}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASAP">ASAP</SelectItem>
              <SelectItem value="WITHIN_1MONTH">Within 1 month</SelectItem>
              <SelectItem value="WITHIN_3MONTHS">Within 3 months</SelectItem>
              <SelectItem value="PLANNING">Still planning</SelectItem>
            </SelectContent>
          </Select>
          {errors.timeline && (
            <p className="text-sm text-red-600">{errors.timeline.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            placeholder="M5V 3A8"
            {...register('postal_code')}
          />
          {errors.postal_code && (
            <p className="text-sm text-red-600">{errors.postal_code.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="123 Main Street, Toronto, ON"
          {...register('address')}
        />
        {errors.address && (
          <p className="text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Project Description</Label>
        <Textarea
          id="description"
          placeholder="Please provide a detailed description of your renovation project, including any specific requirements, preferences, or constraints..."
          rows={6}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Submitting request...' : 'Submit Renovation Request'}
      </Button>
    </form>
  )
}
