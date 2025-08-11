import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email-service'
import {
  createErrorResponse,
  createSuccessResponse,
  AuthenticationError,
  checkRateLimit,
  createRateLimitError,
} from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`email_${clientIP}`, 50, 60000)) {
      throw createRateLimitError()
    }

    // Basic API authentication (in production, use proper authentication)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.API_SECRET_KEY || 'dev-secret'}`
    
    if (authHeader !== expectedAuth) {
      throw new AuthenticationError('Invalid API authentication')
    }

    const body = await request.json()
    
    // Handle different email types
    switch (body.type) {
      case 'NEW_REQUEST':
        return await handleNewRequestNotification(body.data)
      case 'NEW_BID':
        return await handleNewBidNotification(body)
      case 'BID_ACCEPTED':
        return await handleBidAcceptedNotification(body)
      case 'BID_REJECTED':
        return await handleBidRejectedNotification(body)
      default:
        throw new Error(`Unknown email type: ${body.type}`)
    }
  } catch (error) {
    return createErrorResponse(error)
  }
}

async function handleNewRequestNotification(data: any) {
  try {
    // Find contractors in the same postal code area (first 3 characters)
    const postalPrefix = data.postal_code?.substring(0, 3).toUpperCase()
    
    if (!postalPrefix) {
      throw new Error('Invalid postal code provided')
    }

    const contractors = await prisma.contractor.findMany({
      where: {
        AND: [
          // Match contractors who service this area
          {
            OR: [
              {
                service_areas: {
                  has: postalPrefix,
                },
              },
              {
                service_areas: {
                  isEmpty: true, // Contractors with no specific areas get all requests
                },
              },
            ],
          },
          // Match category if contractor has specialization
          {
            OR: [
              {
                categories: {
                  has: data.category,
                },
              },
              {
                categories: {
                  isEmpty: true, // Contractors with no specific categories get all requests
                },
              },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 50, // Limit to prevent spam
    })

    const emailResults = []
    
    for (const contractor of contractors) {
      try {
        // Check if contractor has email notifications enabled
        const emailPreference = await checkEmailPreferences(contractor.user.id, 'new_requests')
        if (!emailPreference) {
          continue
        }

        // Queue email for reliable delivery
        const emailId = await emailService.queueEmail(
          'NEW_REQUEST',
          contractor.user.email,
          {
            contractorName: contractor.user.name,
            request: data.request,
          }
        )
        
        emailResults.push({ 
          contractor_id: contractor.id, 
          success: true, 
          email_id: emailId 
        })
      } catch (emailError) {
        console.error(`Failed to queue email for contractor ${contractor.id}:`, emailError)
        emailResults.push({ 
          contractor_id: contractor.id, 
          success: false, 
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        })
      }
    }

    return createSuccessResponse({
      message: `Queued notifications for ${contractors.length} contractors`,
      results: emailResults,
      queue_status: emailService.getQueueStatus(),
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

async function handleNewBidNotification(data: any) {
  try {
    const { recipient_email, recipient_name, data: emailData } = data

    // Check if customer has email notifications enabled
    const customer = await prisma.user.findUnique({
      where: { email: recipient_email },
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    const emailPreference = await checkEmailPreferences(customer.id, 'new_bids')
    if (!emailPreference) {
      return createSuccessResponse({
        message: 'Email not sent - user has disabled bid notifications',
        skipped: true,
      })
    }

    // Queue email for reliable delivery
    const emailId = await emailService.queueEmail(
      'NEW_BID',
      recipient_email,
      {
        customerName: recipient_name,
        bid: emailData.bid,
        contractor: emailData.contractor,
        request: emailData.request,
      }
    )

    return createSuccessResponse({
      message: 'New bid email queued successfully',
      email_id: emailId,
      recipient: recipient_email,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

async function handleBidAcceptedNotification(data: any) {
  try {
    const { recipient_email, recipient_name, data: emailData } = data

    // Check if contractor has email notifications enabled
    const contractor = await prisma.user.findUnique({
      where: { email: recipient_email },
    })

    if (!contractor) {
      throw new Error('Contractor not found')
    }

    const emailPreference = await checkEmailPreferences(contractor.id, 'bid_updates')
    if (!emailPreference) {
      return createSuccessResponse({
        message: 'Email not sent - user has disabled bid update notifications',
        skipped: true,
      })
    }

    // Queue email for reliable delivery
    const emailId = await emailService.queueEmail(
      'BID_ACCEPTED',
      recipient_email,
      {
        contractorName: recipient_name,
        bid: emailData.bid,
        customer: emailData.customer,
        request: emailData.request,
      }
    )

    return createSuccessResponse({
      message: 'Bid accepted email queued successfully',
      email_id: emailId,
      recipient: recipient_email,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

async function handleBidRejectedNotification(data: any) {
  try {
    const { recipient_email, recipient_name, data: emailData } = data

    // Check if contractor has email notifications enabled
    const contractor = await prisma.user.findUnique({
      where: { email: recipient_email },
    })

    if (!contractor) {
      throw new Error('Contractor not found')
    }

    const emailPreference = await checkEmailPreferences(contractor.id, 'bid_updates')
    if (!emailPreference) {
      return createSuccessResponse({
        message: 'Email not sent - user has disabled bid update notifications',
        skipped: true,
      })
    }

    // For rejected bids, use a simpler notification (not the full template)
    const result = await emailService.sendSimpleNotification(
      recipient_email,
      'Bid Update - Thank You for Your Proposal',
      `Hello ${recipient_name},

Thank you for submitting a bid for the ${emailData.request.category.toLowerCase()} renovation project. While your bid wasn't selected this time, we appreciate your participation.

Continue bidding on new projects to grow your business on Renovate Platform!

Best regards,
The Renovate Platform Team`
    )

    return createSuccessResponse({
      message: 'Bid rejection notification sent',
      success: result.success,
      error: result.error,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// Check user email preferences
async function checkEmailPreferences(userId: string, type: string): Promise<boolean> {
  try {
    // In a full implementation, you'd have a user_preferences table
    // For now, assume all notifications are enabled
    // TODO: Implement proper email preferences system
    return true
  } catch (error) {
    console.error('Error checking email preferences:', error)
    // Default to enabled if we can't check preferences
    return true
  }
}

// Queue status endpoint
export async function GET() {
  try {
    const status = emailService.getQueueStatus()
    
    return createSuccessResponse({
      queue_status: status,
      queue_health: status.failed === 0 ? 'healthy' : 'degraded',
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// Retry failed emails endpoint
export async function PATCH() {
  try {
    emailService.retryFailedEmails()
    
    return createSuccessResponse({
      message: 'Failed emails queued for retry',
      queue_status: emailService.getQueueStatus(),
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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}