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
    koreanTitle: '즉시 시작',
    subtitle: 'Start immediately',
    koreanSubtitle: '즉시 시작',
    description: 'Ready to begin within 1-2 weeks',
    koreanDescription: '1-2주 내에 시작할 준비가 됨',
    icon: '⚡',
    bgColor: 'bg-red-50 border-red-200',
    selectedColor: 'bg-red-100 border-red-500',
    textColor: 'text-red-700',
    urgent: true,
  },
  {
    id: 'WITHIN_1MONTH',
    title: 'Within 1 Month',
    koreanTitle: '1개월 내',
    subtitle: 'Start soon',
    koreanSubtitle: '곧 시작',
    description: 'Ready to begin in the next 2-4 weeks',
    koreanDescription: '다음 2-4주 내에 시작할 준비가 됨',
    icon: '📅',
    bgColor: 'bg-orange-50 border-orange-200',
    selectedColor: 'bg-orange-100 border-orange-500',
    textColor: 'text-orange-700',
    urgent: false,
  },
  {
    id: 'WITHIN_3MONTHS',
    title: 'Within 3 Months',
    koreanTitle: '3개월 내',
    subtitle: 'Planning ahead',
    koreanSubtitle: '미리 계획',
    description: 'Flexible start date in the next quarter',
    koreanDescription: '다음 분기에 유연한 시작일',
    icon: '📆',
    bgColor: 'bg-blue-50 border-blue-200',
    selectedColor: 'bg-blue-100 border-blue-500',
    textColor: 'text-blue-700',
    urgent: false,
  },
  {
    id: 'PLANNING',
    title: 'Just Planning',
    koreanTitle: '계획 단계',
    subtitle: 'Exploring options',
    koreanSubtitle: '옵션 탐색',
    description: 'Gathering information and quotes',
    koreanDescription: '정보와 견적 수집',
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
          언제 시작하고 싶으신가요?
        </h2>
        <p className="text-lg text-gray-600">
          When would you like to start?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          타임라인은 업체들이 프로젝트를 계획하고 우선순위를 정하는 데 도움이 됩니다
        </p>
        <p className="text-xs text-gray-500">
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
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {option.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {option.koreanTitle}
                        </p>
                      </div>
                      {option.urgent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Priority
                        </span>
                      )}
                    </div>
                    <p className={cn('font-medium mb-2', option.textColor)}>
                      {option.subtitle}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {option.koreanSubtitle}
                    </p>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      {option.koreanDescription}
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
              완벽합니다! 업체들은 귀하가{' '}
              {selectedTimeline === 'ASAP' ? '즉시 시작하기를 원한다는 것을 알게 됩니다' :
               selectedTimeline === 'WITHIN_1MONTH' ? '1개월 내에 시작하기를 원한다는 것을 알게 됩니다' :
               selectedTimeline === 'WITHIN_3MONTHS' ? '3개월 내에 시작하기를 원한다는 것을 알게 됩니다' :
               '옵션을 탐색하기를 원한다는 것을 알게 됩니다'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Perfect! Contractors will know you want to{' '}
            {selectedTimeline === 'ASAP' ? 'start immediately' :
             selectedTimeline === 'WITHIN_1MONTH' ? 'start within a month' :
             selectedTimeline === 'WITHIN_3MONTHS' ? 'start within 3 months' :
             'explore your options'}
          </p>
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
            <h4 className="font-medium text-blue-800 mb-1">알면 좋은 정보 / Good to Know</h4>
            <p className="text-sm text-blue-700 mb-2">
              즉시 가능한 업체들은 긴급한 프로젝트에 대해 경쟁력 있는 요금을 제공할 수 있으며, 
              유연한 타임라인은 더 나은 계획과 잠재적으로 더 낮은 비용을 허용합니다.
            </p>
            <p className="text-xs text-blue-600 italic">
              Contractors with immediate availability may offer competitive rates for urgent projects, 
              while flexible timelines allow for better planning and potentially lower costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
