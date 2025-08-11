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

interface RequestsTableProps {
  status?: string
}

// Mock data - replace with actual data fetching
const mockRequests = [
  {
    id: '1',
    category: 'KITCHEN',
    budget_range: 'RANGE_50_100K',
    timeline: 'WITHIN_3MONTHS',
    postal_code: 'M5V 3A8',
    status: 'OPEN',
    created_at: '2024-01-15',
    bids_count: 3,
  },
  {
    id: '2',
    category: 'BATHROOM',
    budget_range: 'UNDER_50K',
    timeline: 'WITHIN_1MONTH',
    postal_code: 'M4C 1B5',
    status: 'OPEN',
    created_at: '2024-01-10',
    bids_count: 5,
  },
]

export function RequestsTable({ status }: RequestsTableProps) {
  const filteredRequests = status 
    ? mockRequests.filter(req => req.status === status)
    : mockRequests

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="default">Open</Badge>
      case 'CLOSED':
        return <Badge variant="secondary">Closed</Badge>
      case 'COMPLETED':
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renovation Requests</CardTitle>
        <CardDescription>
          {status ? `Showing ${status.toLowerCase()} requests` : 'All renovation requests'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Budget Range</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.category.charAt(0) + request.category.slice(1).toLowerCase()}
                </TableCell>
                <TableCell>{formatBudgetRange(request.budget_range)}</TableCell>
                <TableCell>{formatTimeline(request.timeline)}</TableCell>
                <TableCell>{request.postal_code}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>{request.bids_count}</TableCell>
                <TableCell>{request.created_at}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No requests found.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
