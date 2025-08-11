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
const mockBids = [
  {
    id: '1',
    contractor: {
      business_name: 'Elite Renovations',
      rating: 4.8,
      review_count: 24
    },
    labor_cost: 20000,
    material_cost: 12000,
    permit_cost: 1500,
    disposal_cost: 500,
    total_amount: 34000,
    timeline_weeks: 8,
    status: 'PENDING',
  },
  {
    id: '2',
    contractor: {
      business_name: 'Pro Home Builders',
      rating: 4.6,
      review_count: 18
    },
    labor_cost: 22000,
    material_cost: 15000,
    permit_cost: 2000,
    disposal_cost: 800,
    total_amount: 39800,
    timeline_weeks: 6,
    status: 'PENDING',
  },
  {
    id: '3',
    contractor: {
      business_name: 'Quality Construction',
      rating: 4.9,
      review_count: 31
    },
    labor_cost: 18000,
    material_cost: 10000,
    permit_cost: 1200,
    disposal_cost: 300,
    total_amount: 29500,
    timeline_weeks: 10,
    status: 'PENDING',
  },
]

export function BidsComparisonTable() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)
  }

  const getLowestBid = () => {
    return Math.min(...mockBids.map(bid => bid.total_amount))
  }

  const lowestAmount = getLowestBid()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Contractor Bids</CardTitle>
        <CardDescription>
          Review and compare bids from different contractors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contractor</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Labor Cost</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead>Permits</TableHead>
              <TableHead>Disposal</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBids.map((bid) => (
              <TableRow key={bid.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{bid.contractor.business_name}</div>
                    <div className="text-sm text-muted-foreground">
                      ⭐ {bid.contractor.rating} ({bid.contractor.review_count} reviews)
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {bid.contractor.rating}/5
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(bid.labor_cost)}</TableCell>
                <TableCell>{formatCurrency(bid.material_cost)}</TableCell>
                <TableCell>{formatCurrency(bid.permit_cost)}</TableCell>
                <TableCell>{formatCurrency(bid.disposal_cost)}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {formatCurrency(bid.total_amount)}
                    {bid.total_amount === lowestAmount && (
                      <Badge variant="default">Lowest</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{bid.timeline_weeks} weeks</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Accept Bid
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {mockBids.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No bids available for comparison.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
