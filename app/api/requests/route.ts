import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createErrorResponse,
  createSuccessResponse,
  authenticateUser,
  getCurrentUser,
  createPaginationParams,
  createPaginationMeta,
  createOrderBy,
  sanitizeRequest,
  checkRateLimit,
  createRateLimitError,
} from '@/lib/api-utils'
import {
  createRequestSchema,
  requestFiltersSchema,
  type CreateRequestData,
  type RequestFilters,
} from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser()
    
    // Rate limiting
    if (!checkRateLimit(`requests_get_${user.id}`, 100, 60000)) {
      throw createRateLimitError()
    }

    const { searchParams } = new URL(request.url)
    const rawFilters = Object.fromEntries(searchParams.entries())
    
    // Validate filters
    const filters: RequestFilters = requestFiltersSchema.parse(rawFilters)
    
    // Build where clause
    const where: any = {}
    
    if (filters.status) where.status = filters.status
    if (filters.category) where.category = filters.category
    if (filters.budget_range) where.budget_range = filters.budget_range
    if (filters.timeline) where.timeline = filters.timeline
    if (filters.postal_code) {
      where.postal_code = {
        contains: filters.postal_code,
        mode: 'insensitive',
      }
    }
    if (filters.customer_id) where.customer_id = filters.customer_id

    // Pagination
    const { skip, take } = createPaginationParams(filters.page, filters.limit)
    
    // Sorting
    const orderBy = createOrderBy(filters.sort_by, filters.sort_order)

    // Get total count for pagination
    const total = await prisma.renovationRequest.count({ where })

    // Fetch requests
    const requests = await prisma.renovationRequest.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        bids: {
          select: {
            id: true,
            total_amount: true,
            status: true,
            contractor: {
              select: {
                id: true,
                business_name: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
    })

    // Sanitize data
    const sanitizedRequests = requests.map(sanitizeRequest)

    // Create pagination metadata
    const pagination = createPaginationMeta(total, filters.page, filters.limit)

    return createSuccessResponse({
      requests: sanitizedRequests,
      pagination,
      filters,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    // Only customers can create requests
    if (user.type !== 'CUSTOMER') {
      return createErrorResponse(new Error('Only customers can create renovation requests'))
    }

    // Rate limiting
    if (!checkRateLimit(`requests_post_${user.id}`, 10, 60000)) {
      throw createRateLimitError()
    }

    const body = await request.json()
    
    // Validate request data
    const validatedData: CreateRequestData = createRequestSchema.parse(body)

    // Create the request
    const newRequest = await prisma.renovationRequest.create({
      data: {
        customer_id: user.id,
        category: validatedData.category,
        budget_range: validatedData.budget_range,
        timeline: validatedData.timeline,
        postal_code: validatedData.postal_code.toUpperCase().replace(/\s+/g, ' '),
        address: validatedData.address.trim(),
        description: validatedData.description.trim(),
        photos: validatedData.photos || [],
        status: 'OPEN',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
    })

    // Send notification emails to contractors in the area
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_SECRET_KEY || 'dev-secret'}`,
        },
        body: JSON.stringify({
          type: 'NEW_REQUEST',
          data: {
            request: newRequest,
            postal_code: validatedData.postal_code,
            category: validatedData.category,
          },
        }),
      })
    } catch (emailError) {
      console.error('Failed to send contractor notifications:', emailError)
      // Don't fail the request creation if email fails
    }

    return createSuccessResponse({
      message: 'Renovation request created successfully',
      request: sanitizeRequest(newRequest),
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