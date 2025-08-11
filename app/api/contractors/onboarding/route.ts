import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentUser,
  AuthorizationError,
  ConflictError,
  checkRateLimit,
  createRateLimitError,
} from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    // Only allow users who don't already have a contractor profile
    if (user.type !== 'CONTRACTOR') {
      throw new AuthorizationError('Only contractor accounts can complete onboarding')
    }

    // Check if contractor profile already exists
    const existingContractor = await prisma.contractor.findUnique({
      where: { user_id: user.id },
    })

    if (existingContractor) {
      throw new ConflictError('Contractor profile already exists')
    }

    // Rate limiting
    if (!checkRateLimit(`contractor_onboarding_${user.id}`, 5, 300000)) { // 5 requests per 5 minutes
      throw createRateLimitError()
    }

    const formData = await request.formData()
    
    // Extract form data
    const business_name = formData.get('business_name') as string
    const business_number = formData.get('business_number') as string
    const phone = formData.get('phone') as string
    const service_areas = JSON.parse(formData.get('service_areas') as string || '[]')
    const categories = JSON.parse(formData.get('categories') as string || '[]')
    const business_license_number = formData.get('business_license_number') as string
    const skip_verification = formData.get('skip_verification') === 'true'

    // Validate required fields
    if (!business_name || !phone) {
      throw new Error('Business name and phone are required')
    }

    if (!Array.isArray(service_areas) || service_areas.length === 0) {
      throw new Error('At least one service area is required')
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error('At least one category is required')
    }

    // Handle file uploads
    const insurance_document = formData.get('insurance_document') as File | null
    const wsib_certificate = formData.get('wsib_certificate') as File | null

    let insurance_document_url: string | null = null
    let wsib_certificate_url: string | null = null

    // Process file uploads (simplified - in production, upload to cloud storage)
    if (insurance_document && insurance_document.size > 0) {
      // Convert to base64 for storage (temporary solution)
      const arrayBuffer = await insurance_document.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      insurance_document_url = `data:${insurance_document.type};base64,${base64}`
    }

    if (wsib_certificate && wsib_certificate.size > 0) {
      // Convert to base64 for storage (temporary solution)
      const arrayBuffer = await wsib_certificate.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      wsib_certificate_url = `data:${wsib_certificate.type};base64,${base64}`
    }

    // Calculate completion percentage
    let completion_percentage = 75 // Base for required fields (business info, service areas, categories)
    
    if (insurance_document_url || wsib_certificate_url || business_license_number) {
      completion_percentage = 100
    } else if (skip_verification) {
      completion_percentage = 100 // Full completion if they explicitly skip verification
    }

    // Create contractor profile
    const contractor = await prisma.contractor.create({
      data: {
        user_id: user.id,
        business_name: business_name.trim(),
        business_number: business_number?.trim() || null,
        phone: phone.trim(),
        service_areas,
        categories,
        business_license_number: business_license_number?.trim() || null,
        insurance_document_url,
        wsib_certificate_url,
        insurance_verified: false,
        wsib_verified: false,
        profile_completed: completion_percentage === 100,
        completion_percentage,
        skip_verification,
        onboarding_completed_at: new Date(),
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
    })

    // Send welcome email (optional)
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_SECRET_KEY || 'dev-secret'}`,
        },
        body: JSON.stringify({
          type: 'CONTRACTOR_WELCOME',
          recipient_email: user.email,
          recipient_name: user.name,
          data: {
            contractor,
            completion_percentage,
            skip_verification,
          },
        }),
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the onboarding if email fails
    }

    return createSuccessResponse({
      message: 'Contractor onboarding completed successfully',
      contractor: {
        id: contractor.id,
        business_name: contractor.business_name,
        completion_percentage: contractor.completion_percentage,
        profile_completed: contractor.profile_completed,
        verification_status: {
          insurance_verified: contractor.insurance_verified,
          wsib_verified: contractor.wsib_verified,
          has_insurance_document: !!contractor.insurance_document_url,
          has_wsib_certificate: !!contractor.wsib_certificate_url,
          skip_verification: contractor.skip_verification,
        },
        service_areas: contractor.service_areas,
        categories: contractor.categories,
      },
    }, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
}

// GET method to check onboarding status
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (user.type !== 'CONTRACTOR') {
      throw new AuthorizationError('Only contractor accounts can check onboarding status')
    }

    const contractor = await prisma.contractor.findUnique({
      where: { user_id: user.id },
      select: {
        id: true,
        business_name: true,
        completion_percentage: true,
        profile_completed: true,
        insurance_verified: true,
        wsib_verified: true,
        service_areas: true,
        categories: true,
        skip_verification: true,
        onboarding_completed_at: true,
        created_at: true,
      },
    })

    if (!contractor) {
      return createSuccessResponse({
        onboarding_completed: false,
        contractor: null,
      })
    }

    return createSuccessResponse({
      onboarding_completed: true,
      contractor: {
        ...contractor,
        verification_status: {
          insurance_verified: contractor.insurance_verified,
          wsib_verified: contractor.wsib_verified,
          skip_verification: contractor.skip_verification,
        },
      },
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
