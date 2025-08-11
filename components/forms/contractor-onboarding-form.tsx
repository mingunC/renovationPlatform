'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const contractorSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  business_number: z.string().optional(),
  service_areas: z.array(z.string()).min(1, 'Please select at least one service area'),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
})

type ContractorFormData = z.infer<typeof contractorSchema>

const RENOVATION_CATEGORIES = [
  'KITCHEN',
  'BATHROOM', 
  'BASEMENT',
  'FLOORING',
  'PAINTING',
  'OTHER'
]

const SERVICE_AREAS = [
  'Toronto',
  'Mississauga',
  'Brampton',
  'Markham',
  'Vaughan',
  'Richmond Hill',
  'Oakville',
  'Burlington'
]

export function ContractorOnboardingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContractorFormData>({
    resolver: zodResolver(contractorSchema),
  })

  const onSubmit = async (data: ContractorFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/contractors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_name: data.business_name,
          business_number: data.business_number,
          service_areas: selectedAreas,
          categories: selectedCategories,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create contractor profile')
      }

      // Redirect to contractor dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Contractor onboarding error:', error)
      setError(error instanceof Error ? error.message : 'Setup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCategory = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    setSelectedCategories(updated)
    setValue('categories', updated)
  }

  const toggleArea = (area: string) => {
    const updated = selectedAreas.includes(area)
      ? selectedAreas.filter(a => a !== area)
      : [...selectedAreas, area]
    setSelectedAreas(updated)
    setValue('service_areas', updated)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="business_name">Business Name</Label>
        <Input
          id="business_name"
          placeholder="ABC Renovations Inc."
          {...register('business_name')}
        />
        {errors.business_name && (
          <p className="text-sm text-red-600">{errors.business_name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="business_number">Business Registration Number (Optional)</Label>
        <Input
          id="business_number"
          placeholder="123456789"
          {...register('business_number')}
        />
        {errors.business_number && (
          <p className="text-sm text-red-600">{errors.business_number.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Service Categories</Label>
        <p className="text-sm text-gray-600 mb-3">
          Select the types of renovation work you specialize in
        </p>
        <div className="grid grid-cols-2 gap-2">
          {RENOVATION_CATEGORIES.map((category) => (
            <Button
              key={category}
              type="button"
              variant={selectedCategories.includes(category) ? "default" : "outline"}
              onClick={() => toggleCategory(category)}
              className="justify-start"
            >
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        {errors.categories && (
          <p className="text-sm text-red-600">{errors.categories.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Service Areas</Label>
        <p className="text-sm text-gray-600 mb-3">
          Select the areas where you provide services
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SERVICE_AREAS.map((area) => (
            <Button
              key={area}
              type="button"
              variant={selectedAreas.includes(area) ? "default" : "outline"}
              onClick={() => toggleArea(area)}
              className="justify-start"
            >
              {area}
            </Button>
          ))}
        </div>
        {errors.service_areas && (
          <p className="text-sm text-red-600">{errors.service_areas.message}</p>
        )}
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Completing setup...' : 'Complete Setup & Start Bidding'}
        </Button>
      </div>
    </form>
  )
}