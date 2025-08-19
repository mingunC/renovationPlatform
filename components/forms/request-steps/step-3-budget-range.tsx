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
  koreanTitle: string
  description: string
  koreanDescription: string
  examples: string
  koreanExamples: string
  icon: string
  popular: boolean
}> = [
  {
    id: 'UNDER_50K',
    title: 'Under $50,000',
    koreanTitle: '5천만원 미만',
    description: 'Small to moderate renovations',
    koreanDescription: '소규모에서 중간 규모의 리노베이션',
    examples: 'Bathroom refresh, minor kitchen updates, flooring',
    koreanExamples: '욕실 리프레시, 주방 소규모 업데이트, 바닥재',
    icon: '🔨',
    popular: false,
  },
  {
    id: 'RANGE_50_100K',
    title: '$50,000 - $100,000',
    koreanTitle: '5천만원 - 1억원',
    description: 'Major renovations',
    koreanDescription: '대규모 리노베이션',
    examples: 'Full kitchen remodel, multiple rooms, basement finish',
    koreanExamples: '주방 전체 리모델링, 다중 공간, 지하실 마감',
    icon: '🏗️',
    popular: true,
  },
  {
    id: 'OVER_100K',
    title: 'Over $100,000',
    koreanTitle: '1억원 이상',
    description: 'Premium renovations and additions',
    koreanDescription: '프리미엄 리노베이션 및 증축',
    examples: 'Whole home renovation, additions, luxury finishes',
    koreanExamples: '전체 주택 리노베이션, 증축, 럭셔리 마감',
    icon: '✨',
    popular: false,
  },
] as const

export function BudgetRangeStep({ selectedBudget, onSelect }: BudgetRangeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          예산 범위는 어떻게 되시나요?
        </h2>
        <p className="text-base md:text-lg text-gray-600">
          What's your budget range?
        </p>
        <p className="text-xs md:text-sm text-gray-500 mt-2">
          이는 업체들이 정확한 견적을 제공하는 데 도움이 됩니다
        </p>
        <p className="text-xs text-gray-500">
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
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start space-x-4">
                <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl md:text-2xl">{option.icon}</span>
                    <div>
                      <Label htmlFor={option.id} className="text-base md:text-lg font-semibold cursor-pointer">
                        {option.title}
                      </Label>
                      <p className="text-xs md:text-sm text-gray-600 font-medium">
                        {option.koreanTitle}
                      </p>
                    </div>
                    {option.popular && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2 text-sm md:text-base">
                    {option.description}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {option.koreanDescription}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Examples:</span> {option.examples}
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    {option.koreanExamples}
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
            <h4 className="font-medium text-amber-800 mb-1 text-sm md:text-base">도움말 / Helpful Tip</h4>
            <p className="text-sm text-amber-700 mb-2">
              예산 범위는 업체들이 귀하의 기대치를 이해하고 더 정확한 견적을 제공하는 데 도움이 됩니다.
            </p>
            <p className="text-xs text-amber-600 italic">
              Your budget range helps contractors understand your expectations and provide more accurate quotes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
