import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createErrorResponse,
  createSuccessResponse,
  authenticateUser,
  getCurrentUser,
  sanitizeRequest,
  checkRequestOwnership,
  NotFoundError,
  AuthorizationError,
  checkRateLimit,
  createRateLimitError,
} from '@/lib/api-utils'
import {
  updateRequestSchema,
  type UpdateRequestData,
} from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser()
    const { id } = await params

    // Rate limiting
    if (!checkRateLimit(`request_get_${user.id}`, 50, 60000)) {
      throw createRateLimitError()
    }

    // Fetch the request with all related data
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: { id },
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
          },
          orderBy: {
            created_at: 'desc',
          },
        },
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
            contractor: {
              include: {
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

    if (!renovationRequest) {
      throw new NotFoundError('Renovation request not found')
    }

    // Check access permissions
    const currentUser = await getCurrentUser()
    const isOwner = renovationRequest.customer_id === currentUser.id
    const isContractorWithBid = currentUser.contractor && 
      renovationRequest.bids.some(bid => bid.contractor_id === currentUser.contractor?.id)
    
    // Customers can see their own requests, contractors can see requests they've bid on
    if (!isOwner && !isContractorWithBid && renovationRequest.status !== 'OPEN') {
      throw new AuthorizationError('Access denied to this request')
    }

    // If not the owner, limit bid visibility to only their own bid
    if (!isOwner && currentUser.contractor) {
      renovationRequest.bids = renovationRequest.bids.filter(
        bid => bid.contractor_id === currentUser.contractor?.id
      )
    }

    return createSuccessResponse({
      request: sanitizeRequest(renovationRequest),
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
    const user = await getCurrentUser()
    const { id } = await params

    // Rate limiting
    if (!checkRateLimit(`request_patch_${user.id}`, 20, 60000)) {
      throw createRateLimitError()
    }

    const body = await request.json()
    
    // Validate update data
    const validatedData: UpdateRequestData = updateRequestSchema.parse(body)

    // Check if request exists and user owns it
    const existingRequest = await checkRequestOwnership(id, user.id)

    // Prevent status changes if there are accepted bids
    if (validatedData.status && validatedData.status !== existingRequest.status) {
      const acceptedBids = await prisma.bid.count({
        where: {
          request_id: id,
          status: 'ACCEPTED',
        },
      })

      if (acceptedBids > 0 && validatedData.status === 'OPEN') {
        throw new AuthorizationError('Cannot reopen request with accepted bids')
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
      
      // If closing the request, reject all pending bids
      if (validatedData.status === 'CLOSED') {
        await prisma.bid.updateMany({
          where: {
            request_id: id,
            status: 'PENDING',
          },
          data: {
            status: 'REJECTED',
          },
        })
      }
    }
    
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description.trim()
    }
    
    if (validatedData.photos !== undefined) {
      updateData.photos = validatedData.photos
    }

    // Update the request
    const updatedRequest = await prisma.renovationRequest.update({
      where: { id },
      data: updateData,
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
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
    })

    // Send notifications if status changed
    if (validatedData.status && validatedData.status !== existingRequest.status) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_SECRET_KEY || 'dev-secret'}`,
          },
          body: JSON.stringify({
            type: 'REQUEST_STATUS_CHANGED',
            data: {
              request: updatedRequest,
              oldStatus: existingRequest.status,
              newStatus: validatedData.status,
            },
          }),
        })
      } catch (emailError) {
        console.error('Failed to send status change notifications:', emailError)
      }
    }

    return createSuccessResponse({
      message: 'Request updated successfully',
      request: sanitizeRequest(updatedRequest),
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
    const user = await getCurrentUser()
    const { id } = await params

    // Rate limiting
    if (!checkRateLimit(`request_delete_${user.id}`, 10, 60000)) {
      throw createRateLimitError()
    }

    // Check if request exists and user owns it
    await checkRequestOwnership(id, user.id)

    // Check if there are any accepted bids
    const acceptedBids = await prisma.bid.count({
      where: {
        request_id: id,
        status: 'ACCEPTED',
      },
    })

    if (acceptedBids > 0) {
      throw new AuthorizationError('Cannot delete request with accepted bids')
    }

    // Delete the request (this will cascade to bids due to foreign key)
    await prisma.renovationRequest.delete({
      where: { id },
    })

    return createSuccessResponse({
      message: 'Request deleted successfully',
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