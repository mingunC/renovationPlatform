'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Home, Building2, Building, Store } from 'lucide-react'

interface PropertyTypeStepProps {
  selectedType: string | null
  onSelect: (type: 'DETACHED_HOUSE' | 'TOWNHOUSE' | 'CONDO' | 'COMMERCIAL') => void
}

const RESIDENTIAL_TYPES = [
  {
    id: 'DETACHED_HOUSE',
    title: 'House',
    koreanTitle: '단독주택',
    description: '독립된 단독 주택',
    englishDescription: 'Detached single-family home',
    icon: Home,
    bgColor: 'bg-blue-50 border-blue-200',
    selectedColor: 'bg-blue-100 border-blue-500',
  },
  {
    id: 'TOWNHOUSE',
    title: 'Townhouse',
    koreanTitle: '타운하우스',
    description: '연결된 타운하우스',
    englishDescription: 'Connected townhouse',
    icon: Building2,
    bgColor: 'bg-green-50 border-green-200',
    selectedColor: 'bg-green-100 border-green-500',
  },
  {
    id: 'CONDO',
    title: 'Condo',
    koreanTitle: '콘도',
    description: '아파트/콘도미니엄',
    englishDescription: 'Apartment or condominium',
    icon: Building,
    bgColor: 'bg-purple-50 border-purple-200',
    selectedColor: 'bg-purple-100 border-purple-500',
  },
] as const

const COMMERCIAL_TYPE = {
  id: 'COMMERCIAL',
  title: 'Commercial Property',
  koreanTitle: '상업용 부동산',
  description: '상업용 건물, 사무실, 매장',
  englishDescription: 'Commercial buildings, offices, retail spaces',
  icon: Store,
  bgColor: 'bg-orange-50 border-orange-200',
  selectedColor: 'bg-orange-100 border-orange-500',
} as const

export function PropertyTypeStep({ selectedType, onSelect }: PropertyTypeStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          어떤 건물을 리노베이션 하실건가요?
        </h2>
        <p className="text-lg text-gray-600">
          What type of property are you renovating?
        </p>
      </div>

      {/* Residential Properties */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-4 text-center">
          주거용 부동산 / Residential Property
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RESIDENTIAL_TYPES.map((type) => {
            const isSelected = selectedType === type.id
            const Icon = type.icon
            return (
              <Card
                key={type.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105',
                  isSelected ? type.selectedColor : type.bgColor
                )}
                onClick={() => onSelect(type.id as any)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Icon className="w-12 h-12 text-gray-700" />
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {type.koreanTitle}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>{type.description}</p>
                      <p className="italic">{type.englishDescription}</p>
                    </div>
                    {isSelected && (
                      <div className="mt-2">
                        <div className="inline-flex items-center text-sm font-medium text-blue-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          선택됨 / Selected
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">또는 / OR</span>
        </div>
      </div>

      {/* Commercial Property */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-4 text-center">
          상업용 부동산 / Commercial Property
        </p>
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105',
            selectedType === COMMERCIAL_TYPE.id 
              ? COMMERCIAL_TYPE.selectedColor 
              : COMMERCIAL_TYPE.bgColor
          )}
          onClick={() => onSelect(COMMERCIAL_TYPE.id as any)}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Store className="w-16 h-16 text-gray-700" />
              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  {COMMERCIAL_TYPE.title}
                </h3>
                <p className="text-base text-gray-600 font-medium mt-1">
                  {COMMERCIAL_TYPE.koreanTitle}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <p>{COMMERCIAL_TYPE.description}</p>
                <p className="italic mt-1">{COMMERCIAL_TYPE.englishDescription}</p>
              </div>
              {selectedType === COMMERCIAL_TYPE.id && (
                <div className="mt-2">
                  <div className="inline-flex items-center text-sm font-medium text-orange-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    선택됨 / Selected
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedType && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">
            좋습니다! 다음 단계에서 리노베이션 유형을 선택해주세요.
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Great! Let's continue to select your renovation type.
          </p>
        </div>
      )}
    </div>
  )
}
