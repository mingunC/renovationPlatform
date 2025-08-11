import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createErrorResponse,
  createSuccessResponse,
  requireContractor,
  checkBidOwnership,
  sanitizeBid,
  calculateBidTotal,
  ConflictError,
  NotFoundError,
  checkRateLimit,
  createRateLimitError,
} from '@/lib/api-utils'
import {
  updateBidSchema,
  type UpdateBidData,
} from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { contractor } = await requireContractor()
    const { id } = await params

    // Rate limiting
    if (!checkRateLimit(`bid_get_${contractor.id}`, 50, 60000)) {
      throw createRateLimitError()
    }

    // Check ownership
    await checkBidOwnership(id, contractor.id)

    // Fetch the bid with all related data
    const bid = await prisma.bid.findUnique({
      where: { id },
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

    if (!bid) {
      throw new NotFoundError('Bid not found')
    }

    return createSuccessResponse({
      bid: sanitizeBid(bid),
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { contractor } = await requireContractor()
    const { id } = await params

    // Rate limiting
    if (!checkRateLimit(`bid_patch_${contractor.id}`, 20, 60000)) {
      throw createRateLimitError()
    }

    const body = await request.json()
    
    // Validate update data
    const validatedData: UpdateBidData = updateBidSchema.parse(body)

    // Check ownership and current status
    const existingBid = await checkBidOwnership(id, contractor.id)

    // Only allow editing pending bids (unless it's a status update by customer)
    if (existingBid.status !== 'PENDING' && !validatedData.status) {
      throw new ConflictError(`Cannot edit bid with status: ${existingBid.status}`)
    }

    // Get full bid data for recalculation
    const fullBid = await prisma.bid.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
      },
    })

    if (!fullBid) {
      throw new NotFoundError('Bid not found')
    }

    // Prepare update data
    const updateData: any = {}
    
    // Handle cost updates and recalculation
    const costFields = ['labor_cost', 'material_cost', 'permit_cost', 'disposal_cost']
    const hasCostUpdate = costFields.some(field => validatedData[field as keyof UpdateBidData] !== undefined)
    
    if (hasCostUpdate) {
      updateData.labor_cost = validatedData.labor_cost ?? fullBid.labor_cost
      updateData.material_cost = validatedData.material_cost ?? fullBid.material_cost
      updateData.permit_cost = validatedData.permit_cost ?? fullBid.permit_cost
      updateData.disposal_cost = validatedData.disposal_cost ?? fullBid.disposal_cost
      updateData.total_amount = calculateBidTotal(updateData)
    }
    
    // Handle other fields
    if (validatedData.timeline_weeks !== undefined) {
      updateData.timeline_weeks = validatedData.timeline_weeks
    }
    
    if (validatedData.start_date !== undefined) {
      updateData.start_date = new Date(validatedData.start_date)
    }
    
    if (validatedData.included_items !== undefined) {
      updateData.included_items = validatedData.included_items.trim()
    }
    
    if (validatedData.excluded_items !== undefined) {
      updateData.excluded_items = validatedData.excluded_items?.trim()
    }
    
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes?.trim()
    }

    // Handle status updates (typically done by customers)
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
      
      // If accepting a bid, reject all other bids for the same request
      if (validatedData.status === 'ACCEPTED') {
        await prisma.bid.updateMany({
          where: {
            request_id: fullBid.request_id,
            id: { not: id },
            status: 'PENDING',
          },
          data: {
            status: 'REJECTED',
          },
        })

        // Update request status to closed
        await prisma.renovationRequest.update({
          where: { id: fullBid.request_id },
          data: { status: 'CLOSED' },
        })
      }
    }

    // Update the bid
    const updatedBid = await prisma.bid.update({
      where: { id },
      data: updateData,
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

    // Send notification emails for status changes
    if (validatedData.status && validatedData.status !== existingBid.status) {
      try {
        const emailType = validatedData.status === 'ACCEPTED' ? 'BID_ACCEPTED' : 'BID_REJECTED'
        
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_SECRET_KEY || 'dev-secret'}`,
          },
          body: JSON.stringify({
            type: emailType,
            recipient_email: fullBid.contractor.user.email,
            recipient_name: fullBid.contractor.user.name,
            data: {
              bid: updatedBid,
              request: fullBid.request,
              customer_name: fullBid.request.customer.name,
            },
          }),
        })
      } catch (emailError) {
        console.error('Failed to send status change notification:', emailError)
      }
    }

    return createSuccessResponse({
      message: 'Bid updated successfully',
      bid: sanitizeBid(updatedBid),
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { contractor } = await requireContractor()
    const { id } = await params

    // Rate limiting
    if (!checkRateLimit(`bid_delete_${contractor.id}`, 10, 60000)) {
      throw createRateLimitError()
    }

    // Check ownership and status
    const existingBid = await checkBidOwnership(id, contractor.id)

    if (existingBid.status !== 'PENDING') {
      throw new ConflictError(`Cannot withdraw bid with status: ${existingBid.status}`)
    }

    // Get bid details for notification
    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
      },
    })

    // Delete the bid
    await prisma.bid.delete({
      where: { id },
    })

    // Send notification to customer
    if (bid) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_SECRET_KEY || 'dev-secret'}`,
          },
          body: JSON.stringify({
            type: 'BID_WITHDRAWN',
            recipient_email: bid.request.customer.email,
            recipient_name: bid.request.customer.name,
            data: {
              bid,
              contractor_name: bid.contractor.user.name,
              request: bid.request,
            },
          }),
        })
      } catch (emailError) {
        console.error('Failed to send withdrawal notification:', emailError)
      }
    }

    return createSuccessResponse({
      message: 'Bid withdrawn successfully',
    })
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
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}