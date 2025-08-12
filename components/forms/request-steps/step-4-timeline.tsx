'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TimelineStepProps {
  selectedTimeline: string | null
  onSelect: (timeline: 'ASAP' | 'WITHIN_1MONTH' | 'WITHIN_3MONTHS' | 'PLANNING') => void
}

const TIMELINE_OPTIONS = [
  {
    id: 'ASAP',
    title: 'ASAP',
    subtitle: 'Start immediately',
    description: 'Ready to begin within 1-2 weeks',
    icon: '⚡',
    bgColor: 'bg-red-50 border-red-200',
    selectedColor: 'bg-red-100 border-red-500',
    textColor: 'text-red-700',
    urgent: true,
  },
  {
    id: 'WITHIN_1MONTH',
    title: 'Within 1 Month',
    subtitle: 'Start soon',
    description: 'Ready to begin in the next 2-4 weeks',
    icon: '📅',
    bgColor: 'bg-orange-50 border-orange-200',
    selectedColor: 'bg-orange-100 border-orange-500',
    textColor: 'text-orange-700',
    urgent: false,
  },
  {
    id: 'WITHIN_3MONTHS',
    title: 'Within 3 Months',
    subtitle: 'Planning ahead',
    description: 'Flexible start date in the next quarter',
    icon: '📆',
    bgColor: 'bg-blue-50 border-blue-200',
    selectedColor: 'bg-blue-100 border-blue-500',
    textColor: 'text-blue-700',
    urgent: false,
  },
  {
    id: 'PLANNING',
    title: 'Just Planning',
    subtitle: 'Exploring options',
    description: 'Gathering information and quotes',
    icon: '💭',
    bgColor: 'bg-gray-50 border-gray-200',
    selectedColor: 'bg-gray-100 border-gray-500',
    textColor: 'text-gray-700',
    urgent: false,
  },
] as const

export function TimelineStep({ selectedTimeline, onSelect }: TimelineStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          When would you like to start?
        </h2>
        <p className="text-gray-600">
          Your timeline helps contractors plan and prioritize your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TIMELINE_OPTIONS.map((option) => {
          const isSelected = selectedTimeline === option.id
          return (
            <Card
              key={option.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                isSelected ? option.selectedColor : option.bgColor
              )}
              onClick={() => onSelect(option.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{option.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {option.title}
                      </h3>
                      {option.urgent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Priority
                        </span>
                      )}
                    </div>
                    <p className={cn('font-medium mb-2', option.textColor)}>
                      {option.subtitle}
                    </p>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                    {isSelected && (
                      <div className="mt-4 flex items-center text-sm font-medium text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Timeline selected
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedTimeline && (
        <div className="text-center">
          <div className={cn(
            'inline-flex items-center space-x-2 px-4 py-2 rounded-lg',
            TIMELINE_OPTIONS.find(opt => opt.id === selectedTimeline)?.bgColor
          )}>
            <span className="text-2xl">
              {TIMELINE_OPTIONS.find(opt => opt.id === selectedTimeline)?.icon}
            </span>
            <span className="font-medium">
              Perfect! Contractors will know you want to{' '}
              {selectedTimeline === 'ASAP' ? 'start immediately' :
               selectedTimeline === 'WITHIN_1MONTH' ? 'start within a month' :
               selectedTimeline === 'WITHIN_3MONTHS' ? 'start within 3 months' :
               'explore your options'}
            </span>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Good to Know</h4>
            <p className="text-sm text-blue-700">
              Contractors with immediate availability may offer competitive rates for urgent projects, 
              while flexible timelines allow for better planning and potentially lower costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
