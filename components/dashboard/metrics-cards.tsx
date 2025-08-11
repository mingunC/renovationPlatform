'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricsData {
  newRequestsThisWeek: number
  activeBids: number
  winRate: number
  estimatedRevenue: number
}

interface MetricsCardsProps {
  data: MetricsData
}

export function MetricsCards({ data }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const metrics = [
    {
      title: 'New Requests This Week',
      value: data.newRequestsThisWeek.toString(),
      icon: '📋',
      description: 'Fresh opportunities',
      trend: data.newRequestsThisWeek > 0 ? 'positive' : 'neutral',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Active Bids',
      value: data.activeBids.toString(),
      icon: '💼',
      description: 'Awaiting response',
      trend: 'neutral',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Win Rate',
      value: `${data.winRate}%`,
      icon: '🎯',
      description: 'Success percentage',
      trend: data.winRate >= 50 ? 'positive' : data.winRate >= 30 ? 'neutral' : 'negative',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Estimated Revenue',
      value: formatCurrency(data.estimatedRevenue),
      icon: '💰',
      description: 'From active bids',
      trend: data.estimatedRevenue > 0 ? 'positive' : 'neutral',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'negative':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className={`${metric.bgColor} border-0 hover:shadow-md transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`text-2xl ${metric.iconColor}`}>
              {metric.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </div>
                <p className="text-xs text-gray-500">
                  {metric.description}
                </p>
              </div>
              <div className="flex items-center">
                {getTrendIcon(metric.trend)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
