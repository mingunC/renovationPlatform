'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ProjectTypeStepProps {
  selectedType: string | null
  onSelect: (type: 'KITCHEN' | 'BATHROOM' | 'BASEMENT' | 'FLOORING' | 'PAINTING' | 'OTHER') => void
}

const PROJECT_TYPES = [
  {
    id: 'KITCHEN',
    title: 'Kitchen',
    description: 'Cabinets, countertops, appliances',
    icon: '🍳',
    bgColor: 'bg-orange-50 border-orange-200',
    selectedColor: 'bg-orange-100 border-orange-500',
  },
  {
    id: 'BATHROOM',
    title: 'Bathroom',
    description: 'Fixtures, tiles, vanities',
    icon: '🚿',
    bgColor: 'bg-blue-50 border-blue-200',
    selectedColor: 'bg-blue-100 border-blue-500',
  },
  {
    id: 'BASEMENT',
    title: 'Basement',
    description: 'Finishing, recreation rooms',
    icon: '🏠',
    bgColor: 'bg-gray-50 border-gray-200',
    selectedColor: 'bg-gray-100 border-gray-500',
  },
  {
    id: 'FLOORING',
    title: 'Flooring',
    description: 'Hardwood, tile, carpet',
    icon: '🏗️',
    bgColor: 'bg-amber-50 border-amber-200',
    selectedColor: 'bg-amber-100 border-amber-500',
  },
  {
    id: 'PAINTING',
    title: 'Painting',
    description: 'Interior and exterior',
    icon: '🎨',
    bgColor: 'bg-purple-50 border-purple-200',
    selectedColor: 'bg-purple-100 border-purple-500',
  },
  {
    id: 'OTHER',
    title: 'Other',
    description: 'Custom renovation projects',
    icon: '🔧',
    bgColor: 'bg-green-50 border-green-200',
    selectedColor: 'bg-green-100 border-green-500',
  },
] as const

export function ProjectTypeStep({ selectedType, onSelect }: ProjectTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What type of renovation are you planning?
        </h2>
        <p className="text-gray-600">
          Select the category that best describes your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROJECT_TYPES.map((type) => {
          const isSelected = selectedType === type.id
          return (
            <Card
              key={type.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                isSelected ? type.selectedColor : type.bgColor
              )}
              onClick={() => onSelect(type.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {type.description}
                </p>
                {isSelected && (
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center text-sm font-medium text-blue-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Selected
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedType && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">
            Great choice! We&apos;ll help you find the perfect contractors for your{' '}
            {PROJECT_TYPES.find(t => t.id === selectedType)?.title.toLowerCase()} renovation.
          </p>
        </div>
      )}
    </div>
  )
}
