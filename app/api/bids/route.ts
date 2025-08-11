import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createErrorResponse,
  createSuccessResponse,
  authenticateUser,
  getCurrentUser,
  requireContractor,
  createPaginationParams,
  createPaginationMeta,
  createOrderBy,
  sanitizeBid,
  calculateBidTotal,
  ConflictError,
  NotFoundError,
  checkRateLimit,
  createRateLimitError,
} from '@/lib/api-utils'
import {
  createBidSchema,
  bidFiltersSchema,
  type CreateBidData,
  type BidFilters,
} from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser()
    
    // Rate limiting
    if (!checkRateLimit(`bids_get_${user.id}`, 100, 60000)) {
      throw createRateLimitError()
    }

    const { searchParams } = new URL(request.url)
    const rawFilters = Object.fromEntries(searchParams.entries())
    
    // Validate filters
    const filters: BidFilters = bidFiltersSchema.parse(rawFilters)
    
    // Build where clause
    const where: any = {}
    
    if (filters.status) where.status = filters.status
    if (filters.request_id) where.request_id = filters.request_id
    if (filters.contractor_id) where.contractor_id = filters.contractor_id

    // Handle contractor=me query
    if (filters.contractor === 'me') {
      const currentUser = await getCurrentUser()
      if (!currentUser.contractor) {
        throw new NotFoundError('Contractor profile not found')
      }
      where.contractor_id = currentUser.contractor.id
    }

    // Pagination
    const { skip, take } = createPaginationParams(filters.page, filters.limit)
    
    // Sorting
    const orderBy = createOrderBy(filters.sort_by, filters.sort_order)

    // Get total count for pagination
    const total = await prisma.bid.count({ where })

    // Fetch bids
    const bids = await prisma.bid.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        contractor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        request: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    // Sanitize data
    const sanitizedBids = bids.map(sanitizeBid)

    // Create pagination metadata
    const pagination = createPaginationMeta(total, filters.page, filters.limit)

    return createSuccessResponse({
      bids: sanitizedBids,
      pagination,
      filters,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contractor } = await requireContractor()

    // Rate limiting
    if (!checkRateLimit(`bids_post_${contractor.id}`, 20, 60000)) {
      throw createRateLimitError()
    }

    const body = await request.json()
    
    // Validate bid data
    const validatedData: CreateBidData = createBidSchema.parse(body)

    // Check if request exists and is open
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: { id: validatedData.request_id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!renovationRequest) {
      throw new NotFoundError('Renovation request not found')
    }

    if (renovationRequest.status !== 'OPEN') {
      throw new ConflictError('Cannot bid on closed requests')
    }

    // Check if contractor already has a bid for this request
    const existingBid = await prisma.bid.findFirst({
      where: {
        request_id: validatedData.request_id,
        contractor_id: contractor.id,
      },
    })

    if (existingBid) {
      throw new ConflictError('You have already submitted a bid for this request')
    }

    // Calculate total amount
    const total_amount = calculateBidTotal(validatedData)

    // Create the bid
    const newBid = await prisma.bid.create({
      data: {
        request_id: validatedData.request_id,
        contractor_id: contractor.id,
        labor_cost: validatedData.labor_cost,
        material_cost: validatedData.material_cost,
        permit_cost: validatedData.permit_cost,
        disposal_cost: validatedData.disposal_cost,
        total_amount,
        timeline_weeks: validatedData.timeline_weeks,
        start_date: new Date(validatedData.start_date),
        included_items: validatedData.included_items.trim(),
        excluded_items: validatedData.excluded_items?.trim(),
        notes: validatedData.notes?.trim(),
        status: 'PENDING',
      },
      include: {
        contractor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        request: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    // Send notification email to customer
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_SECRET_KEY || 'dev-secret'}`,
        },
        body: JSON.stringify({
          type: 'NEW_BID',
          recipient_email: renovationRequest.customer.email,
          recipient_name: renovationRequest.customer.name,
          data: {
            bid: newBid,
            request: renovationRequest,
            contractor_name: contractor.business_name || newBid.contractor.user.name,
          },
        }),
      })
    } catch (emailError) {
      console.error('Failed to send bid notification:', emailError)
      // Don't fail the bid creation if email fails
    }

    return createSuccessResponse({
      message: 'Bid submitted successfully',
      bid: sanitizeBid(newBid),
    }, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
}

// Options handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}