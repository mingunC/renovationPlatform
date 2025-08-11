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

interface BidsTableProps {
  status?: string
}

// Mock data - replace with actual data fetching
const mockBids = [
  {
    id: '1',
    request: {
      id: '1',
      category: 'KITCHEN',
      customer: { name: 'John Doe' }
    },
    total_amount: 35000,
    timeline_weeks: 8,
    status: 'PENDING',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    request: {
      id: '2',
      category: 'BATHROOM',
      customer: { name: 'Jane Smith' }
    },
    total_amount: 18000,
    timeline_weeks: 4,
    status: 'ACCEPTED',
    created_at: '2024-01-10',
  },
]

export function BidsTable({ status }: BidsTableProps) {
  const filteredBids = status 
    ? mockBids.filter(bid => bid.status === status)
    : mockBids

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="default">Pending</Badge>
      case 'ACCEPTED':
        return <Badge variant="outline">Accepted</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bids</CardTitle>
        <CardDescription>
          {status ? `Showing ${status.toLowerCase()} bids` : 'All submitted bids'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBids.map((bid) => (
              <TableRow key={bid.id}>
                <TableCell className="font-medium">
                  {bid.request.category.charAt(0) + bid.request.category.slice(1).toLowerCase()}
                </TableCell>
                <TableCell>{bid.request.customer.name}</TableCell>
                <TableCell>{formatCurrency(bid.total_amount)}</TableCell>
                <TableCell>{bid.timeline_weeks} weeks</TableCell>
                <TableCell>{getStatusBadge(bid.status)}</TableCell>
                <TableCell>{bid.created_at}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredBids.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No bids found.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
