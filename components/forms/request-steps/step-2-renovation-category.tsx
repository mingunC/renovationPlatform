'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RenovationCategoryStepProps {
  selectedCategories: string[]
  propertyType: string | null
  onSelect: (categories: string[]) => void
}

const RESIDENTIAL_CATEGORIES = [
  {
    id: 'KITCHEN',
    title: 'Kitchen',
    koreanTitle: '주방',
    description: 'Cabinets, countertops, appliances',
    koreanDescription: '캐비닛, 조리대, 가전제품',
    icon: '🍳',
    bgColor: 'bg-orange-50 border-orange-200',
    selectedColor: 'bg-orange-100 border-orange-500',
  },
  {
    id: 'BATHROOM',
    title: 'Bathroom',
    koreanTitle: '욕실',
    description: 'Fixtures, tiles, vanities',
    koreanDescription: '설비, 타일, 세면대',
    icon: '🚿',
    bgColor: 'bg-blue-50 border-blue-200',
    selectedColor: 'bg-blue-100 border-blue-500',
  },
  {
    id: 'BASEMENT',
    title: 'Basement',
    koreanTitle: '지하실',
    description: 'Finishing, recreation rooms',
    koreanDescription: '마감, 레크리에이션 룸',
    icon: '🏠',
    bgColor: 'bg-gray-50 border-gray-200',
    selectedColor: 'bg-gray-100 border-gray-500',
  },
  {
    id: 'FLOORING',
    title: 'Flooring',
    koreanTitle: '바닥재',
    description: 'Hardwood, tile, carpet',
    koreanDescription: '하드우드, 타일, 카펫',
    icon: '🏗️',
    bgColor: 'bg-amber-50 border-amber-200',
    selectedColor: 'bg-amber-100 border-amber-500',
  },
  {
    id: 'PAINTING',
    title: 'Painting',
    koreanTitle: '페인팅',
    description: 'Interior and exterior',
    koreanDescription: '내부 및 외부 도색',
    icon: '🎨',
    bgColor: 'bg-purple-50 border-purple-200',
    selectedColor: 'bg-purple-100 border-purple-500',
  },
  {
    id: 'OTHER',
    title: 'Other',
    koreanTitle: '기타',
    description: 'Custom renovation projects',
    koreanDescription: '맞춤 리노베이션 프로젝트',
    icon: '🔧',
    bgColor: 'bg-green-50 border-green-200',
    selectedColor: 'bg-green-100 border-green-500',
  },
] as const

const COMMERCIAL_CATEGORIES = [
  {
    id: 'OFFICE',
    title: 'Office',
    koreanTitle: '사무실',
    description: 'Office spaces, meeting rooms',
    koreanDescription: '사무 공간, 회의실',
    icon: '🏢',
    bgColor: 'bg-blue-50 border-blue-200',
    selectedColor: 'bg-blue-100 border-blue-500',
  },
  {
    id: 'RETAIL',
    title: 'Retail/Store',
    koreanTitle: '상가/매장',
    description: 'Retail spaces, shops',
    koreanDescription: '소매 공간, 상점',
    icon: '🛍️',
    bgColor: 'bg-green-50 border-green-200',
    selectedColor: 'bg-green-100 border-green-500',
  },
  {
    id: 'CAFE_RESTAURANT',
    title: 'Cafe/Restaurant',
    koreanTitle: '카페/식당',
    description: 'Food service establishments',
    koreanDescription: '음식 서비스 시설',
    icon: '☕',
    bgColor: 'bg-amber-50 border-amber-200',
    selectedColor: 'bg-amber-100 border-amber-500',
  },
  {
    id: 'EDUCATION',
    title: 'Education',
    koreanTitle: '학원/교육',
    description: 'Schools, training centers',
    koreanDescription: '학교, 교육 센터',
    icon: '🎓',
    bgColor: 'bg-purple-50 border-purple-200',
    selectedColor: 'bg-purple-100 border-purple-500',
  },
  {
    id: 'HOSPITALITY_HEALTHCARE',
    title: 'Hospitality/Healthcare',
    koreanTitle: '숙박/병원',
    description: 'Hotels, hospitals, clinics',
    koreanDescription: '호텔, 병원, 클리닉',
    icon: '🏥',
    bgColor: 'bg-red-50 border-red-200',
    selectedColor: 'bg-red-100 border-red-500',
  },
  {
    id: 'OTHER',
    title: 'Other',
    koreanTitle: '기타',
    description: 'Custom commercial projects',
    koreanDescription: '맞춤 상업용 프로젝트',
    icon: '🔧',
    bgColor: 'bg-gray-50 border-gray-200',
    selectedColor: 'bg-gray-100 border-gray-500',
  },
] as const

export function RenovationCategoryStep({ selectedCategories, propertyType, onSelect }: RenovationCategoryStepProps) {
  const isCommercial = propertyType === 'COMMERCIAL'
  const categories = isCommercial ? COMMERCIAL_CATEGORIES : RESIDENTIAL_CATEGORIES

  const handleCategoryToggle = (categoryId: string) => {
    
    let newSelectedCategories: string[]
    
    if (isCommercial) {
      // Commercial: single selection only
      newSelectedCategories = selectedCategories.includes(categoryId) ? [] : [categoryId]
    } else {
      // Residential: multiple selection
      newSelectedCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]
    }
    
    onSelect(newSelectedCategories)
  }

  const isSelected = (categoryId: string) => selectedCategories.includes(categoryId)
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          어떤 리노베이션을 계획하고 계신가요?
        </h2>
        <p className="text-base md:text-lg text-sm text-gray-600">
          What type of renovation are you planning?
        </p>
        {propertyType && (
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {isCommercial ? '상업용 부동산 / Commercial Property' : '주거용 부동산 / Residential Property'}
          </p>
        )}
        <p className="text-sm md:text-base text-blue-600 font-medium mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
          {isCommercial 
            ? '하나의 카테고리만 선택 가능합니다 (Single selection only)' 
            : '여러 개를 선택할 수 있습니다 (Multiple selections allowed)'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const selected = isSelected(category.id)
          return (
            <Card
              key={category.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md relative',
                selected ? category.selectedColor : category.bgColor
              )}
              onClick={() => handleCategoryToggle(category.id)}
            >
              {/* Selection indicator */}
              {selected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-3xl md:text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-base md:text-lg text-gray-900">
                  {category.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">
                  {category.koreanTitle}
                </p>
                <p className="text-xs text-gray-500">
                  {category.description}
                </p>
                <p className="text-xs text-gray-500 italic">
                  {category.koreanDescription}
                </p>
                {selected && (
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center text-sm font-medium text-blue-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      선택됨
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium text-sm md:text-base">
            {isCommercial 
              ? `선택 완료! ${categories.find(c => c.id === selectedCategories[0])?.koreanTitle} 리노베이션을 위한 완벽한 업체를 찾아드리겠습니다.`
              : `${selectedCategories.length}개 카테고리가 선택되었습니다! ${selectedCategories.map(id => categories.find(c => c.id === id)?.koreanTitle).join(', ')} 리노베이션을 위한 완벽한 업체를 찾아드리겠습니다.`
            }
          </p>
          <p className="text-blue-600 text-xs md:text-sm mt-1">
            {isCommercial 
              ? `Selection complete! We'll help you find the perfect contractors for your ${categories.find(c => c.id === selectedCategories[0])?.title.toLowerCase()} renovation.`
              : `${selectedCategories.length} categories selected! We'll help you find the perfect contractors for your renovation.`
            }
          </p>
        </div>
      )}
    </div>
  )
}