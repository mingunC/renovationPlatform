'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mock data - replace with actual data fetching
const mockRequests = [
  {
    id: '1',
    category: 'KITCHEN',
    budget_range: 'RANGE_50_100K',
    timeline: 'WITHIN_3MONTHS',
    postal_code: 'M5V 3A8',
    description: 'Complete kitchen renovation with new cabinets and appliances',
    created_at: '2024-01-15',
    distance: '2.3 km',
  },
  {
    id: '2',
    category: 'BATHROOM',
    budget_range: 'UNDER_50K',
    timeline: 'WITHIN_1MONTH',
    postal_code: 'M4C 1B5',
    description: 'Master bathroom renovation - new tile, vanity, and fixtures',
    created_at: '2024-01-10',
    distance: '5.7 km',
  },
  {
    id: '3',
    category: 'BASEMENT',
    budget_range: 'OVER_100K',
    timeline: 'WITHIN_3MONTHS',
    postal_code: 'M2N 6K1',
    description: 'Basement finishing - family room, bathroom, and storage',
    created_at: '2024-01-08',
    distance: '8.1 km',
  },
]

export function RecentRequestsTable() {
  const formatBudgetRange = (range: string) => {
    switch (range) {
      case 'UNDER_50K':
        return 'Under $50,000'
      case 'RANGE_50_100K':
        return '$50,000 - $100,000'
      case 'OVER_100K':
        return 'Over $100,000'
      default:
        return range
    }
  }

  const formatTimeline = (timeline: string) => {
    switch (timeline) {
      case 'ASAP':
        return 'ASAP'
      case 'WITHIN_1MONTH':
        return 'Within 1 month'
      case 'WITHIN_3MONTHS':
        return 'Within 3 months'
      case 'PLANNING':
        return 'Still planning'
      default:
        return timeline
    }
  }

  const getTimelineBadge = (timeline: string) => {
    switch (timeline) {
      case 'ASAP':
        return <Badge variant="destructive">ASAP</Badge>
      case 'WITHIN_1MONTH':
        return <Badge variant="default">1 Month</Badge>
      case 'WITHIN_3MONTHS':
        return <Badge variant="secondary">3 Months</Badge>
      case 'PLANNING':
        return <Badge variant="outline">Planning</Badge>
      default:
        return <Badge variant="secondary">{timeline}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {mockRequests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {request.category.charAt(0) + request.category.slice(1).toLowerCase()} Renovation
                </CardTitle>
                <CardDescription className="mt-1">
                  {request.postal_code} • {request.distance} away
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {getTimelineBadge(request.timeline)}
                <Badge variant="outline">
                  {formatBudgetRange(request.budget_range)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {request.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Posted {request.created_at}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button size="sm">
                  Submit Bid
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {mockRequests.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No recent requests found in your service areas.
        </div>
      )}
    </div>
  )
}
