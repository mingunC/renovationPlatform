'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type BudgetId = 'UNDER_50K' | 'RANGE_50_100K' | 'OVER_100K'

interface BudgetRangeStepProps {
  selectedBudget: string | null
  onSelect: (budget: BudgetId) => void
}

const BUDGET_OPTIONS: ReadonlyArray<{
  id: BudgetId
  title: string
  description: string
  examples: string
  icon: string
  popular: boolean
}> = [
  {
    id: 'UNDER_50K',
    title: 'Under $50,000',
    description: 'Small to moderate renovations',
    examples: 'Bathroom refresh, minor kitchen updates, flooring',
    icon: '🔨',
    popular: false,
  },
  {
    id: 'RANGE_50_100K',
    title: '$50,000 - $100,000',
    description: 'Major renovations',
    examples: 'Full kitchen remodel, multiple rooms, basement finish',
    icon: '🏗️',
    popular: true,
  },
  {
    id: 'OVER_100K',
    title: 'Over $100,000',
    description: 'Premium renovations and additions',
    examples: 'Whole home renovation, additions, luxury finishes',
    icon: '✨',
    popular: false,
  },
] as const

export function BudgetRangeStep({ selectedBudget, onSelect }: BudgetRangeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What&apos;s your budget range?
        </h2>
        <p className="text-gray-600">
          This helps contractors provide accurate quotes for your project
        </p>
      </div>

      <RadioGroup
        value={selectedBudget || ''}
        onValueChange={onSelect}
        className="space-y-4"
      >
        {BUDGET_OPTIONS.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedBudget === option.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(option.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{option.icon}</span>
                    <Label htmlFor={option.id} className="text-lg font-semibold cursor-pointer">
                      {option.title}
                    </Label>
                    {option.popular && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{option.description}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Examples:</span> {option.examples}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-amber-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-amber-800 mb-1">Helpful Tip</h4>
            <p className="text-sm text-amber-700">
              Your budget range helps contractors understand your expectations and provide more accurate quotes. 
              You can always adjust based on the proposals you receive.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
