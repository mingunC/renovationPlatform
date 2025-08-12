'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Calendar, Clock, Info, AlertCircle } from 'lucide-react'

interface InspectionDateStepProps {
  selectedDate: string | null
  preferredTime: string | null
  flexibleDates: boolean
  onUpdate: (data: {
    inspection_date?: string
    preferred_time?: string
    flexible_dates?: boolean
    additional_notes?: string
  }) => void
}

// Generate available dates (excluding weekends)
const generateAvailableDates = () => {
  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Start from 3 business days from now
  let currentDate = new Date(today)
  currentDate.setDate(currentDate.getDate() + 3)
  
  let addedDates = 0
  while (addedDates < 14) { // Show 14 available dates
    const dayOfWeek = currentDate.getDay()
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(new Date(currentDate))
      addedDates++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', koreanLabel: '오전', time: '9:00 AM - 12:00 PM' },
  { value: 'afternoon', label: 'Afternoon', koreanLabel: '오후', time: '12:00 PM - 5:00 PM' },
  { value: 'anytime', label: 'Any Time', koreanLabel: '시간 무관', time: 'Flexible' },
]

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('en-US', options)
}

const formatDateKorean = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${month}월 ${day}일 (${weekday})`
}

export function InspectionDateStep({ 
  selectedDate, 
  preferredTime, 
  flexibleDates,
  onUpdate 
}: InspectionDateStepProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    setAvailableDates(generateAvailableDates())
  }, [])

  const handleDateSelect = (date: Date) => {
    onUpdate({ inspection_date: date.toISOString() })
  }

  const handleTimeSelect = (time: string) => {
    onUpdate({ preferred_time: time })
  }

  const handleFlexibleToggle = () => {
    onUpdate({ flexible_dates: !flexibleDates })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          현장 방문 일정을 선택해주세요
        </h2>
        <p className="text-lg text-gray-600">
          Select your preferred inspection date
        </p>
        <p className="text-sm text-gray-500 mt-2">
          업체들이 직접 방문하여 정확한 견적을 제공합니다
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">현장 방문 안내</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• 최소 3일 전 예약이 필요합니다</li>
              <li>• 방문 시간은 약 30분-1시간 소요됩니다</li>
              <li>• 여러 업체가 함께 방문할 수 있습니다</li>
              <li>• 방문 후 7일간 입찰이 진행됩니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          <Calendar className="w-4 h-4 inline mr-2" />
          방문 희망 날짜 / Preferred Date
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableDates.map((date) => {
            const dateString = date.toISOString()
            const isSelected = selectedDate === dateString
            const isToday = date.toDateString() === new Date().toDateString()
            
            return (
              <Card
                key={dateString}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  isSelected 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'bg-white border-gray-200 hover:border-gray-300',
                  isToday && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !isToday && handleDateSelect(date)}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(date)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDateKorean(date)}
                  </div>
                  {isSelected && (
                    <div className="mt-1">
                      <svg className="w-4 h-4 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Time Preference */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          <Clock className="w-4 h-4 inline mr-2" />
          선호 시간대 / Preferred Time
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIME_SLOTS.map((slot) => {
            const isSelected = preferredTime === slot.value
            return (
              <Card
                key={slot.value}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  isSelected 
                    ? 'bg-green-100 border-green-500' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                )}
                onClick={() => handleTimeSelect(slot.value)}
              >
                <CardContent className="p-4 text-center">
                  <div className="font-medium text-gray-900">
                    {slot.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {slot.koreanLabel}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {slot.time}
                  </div>
                  {isSelected && (
                    <div className="mt-2">
                      <svg className="w-4 h-4 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Flexible Dates Option */}
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200',
          flexibleDates ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'
        )}
        onClick={handleFlexibleToggle}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                일정 조율 가능 / Flexible with dates
              </p>
              <p className="text-sm text-gray-600 mt-1">
                업체와 일정을 조율할 수 있습니다
              </p>
            </div>
            <div className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center',
              flexibleDates ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
            )}>
              {flexibleDates && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <div>
        <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
          추가 요청사항 (선택) / Additional Notes (Optional)
        </Label>
        <textarea
          id="notes"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="예: 애완동물이 있습니다, 주차 공간이 제한적입니다 등..."
          value={additionalNotes}
          onChange={(e) => {
            setAdditionalNotes(e.target.value)
            onUpdate({ additional_notes: e.target.value })
          }}
        />
      </div>

      {/* Summary */}
      {(selectedDate || preferredTime) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900">선택하신 일정</p>
              <div className="mt-2 space-y-1 text-green-700">
                {selectedDate && (
                  <p>날짜: {formatDateKorean(new Date(selectedDate))}</p>
                )}
                {preferredTime && (
                  <p>시간: {TIME_SLOTS.find(s => s.value === preferredTime)?.koreanLabel}</p>
                )}
                {flexibleDates && (
                  <p>✓ 일정 조율 가능</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}