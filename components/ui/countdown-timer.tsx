'use client'

import { useState, useEffect } from 'react'
import { Badge } from './badge'
import { Clock, AlertTriangle } from 'lucide-react'

interface CountdownTimerProps {
  deadline: Date
  className?: string
}

export function CountdownTimer({ deadline, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const deadlineTime = new Date(deadline).getTime()
      const difference = deadlineTime - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    // 초기 계산
    calculateTimeLeft()

    // 1초마다 업데이트
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 text-red-600 font-semibold ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span>입찰 마감됨</span>
      </div>
    )
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24
  const isVeryUrgent = timeLeft.days === 0 && timeLeft.hours < 6

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Badge 
        variant={isUrgent ? "destructive" : "secondary"}
        className={`font-mono text-2xl ${isUrgent ? 'animate-pulse' : ''}`}
      >
        {String(timeLeft.days * 24 + timeLeft.hours).padStart(3, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </Badge>
      
      {isVeryUrgent && (
        <span className="text-red-600 text-xs font-medium animate-pulse">
          긴급!
        </span>
      )}
    </div>
  )
}
