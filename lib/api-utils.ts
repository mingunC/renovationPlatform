import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createServerActionClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends APIError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

// Response utilities
export function createErrorResponse(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: {
          issues: error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    )
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code?: string; meta?: Record<string, unknown> }
    
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: 'Unique constraint violation',
            details: { field: prismaError.meta?.target },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: 'Record not found',
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          {
            error: 'Foreign key constraint violation',
            details: { field: prismaError.meta?.field_name },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
    }
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  )
}

export function createSuccessResponse<T extends Record<string, unknown>>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      ...data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

// Authentication utilities
export async function authenticateUser() {
  try {
    const supabase = await createServerActionClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Supabase auth error:', error)
      throw new AuthenticationError(`Authentication failed: ${error.message}`)
    }
    
    if (!user) {
      throw new AuthenticationError('User not found in session')
    }
    
    return user
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error
    }
    console.error('Unexpected authentication error:', error)
    throw new AuthenticationError('Authentication service unavailable')
  }
}

export async function getCurrentUser() {
  const user = await authenticateUser()
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      contractor: true,
    },
  })

  if (!dbUser) {
    throw new NotFoundError('User profile not found')
  }

  return dbUser
}

export async function requireContractor() {
  const user = await getCurrentUser()
  
  if (user.type !== 'CONTRACTOR') {
    throw new AuthorizationError('Contractor access required')
  }
  
  // 업체 프로필이 없으면 자동으로 생성
  if (!user.contractor) {
    console.log('⚠️ Contractor profile not found for user:', user.id, '- Creating automatic profile');
    
    try {
      const contractor = await prisma.contractor.create({
        data: {
          user_id: user.id,
          business_name: `업체_${user.email?.split('@')[0] || 'Unknown'}`,
          phone: '',
          service_categories: [],
          service_areas: [],
          years_experience: 0,
          license_number: null,
          insurance_info: null,
          website: null,
          bio: null,
          hourly_rate: null,
          profile_completed: false,
          verified: false
        }
      });
      
      console.log('✅ Auto-created contractor profile:', contractor.id);
      
      // 사용자 객체에 contractor 정보 추가
      user.contractor = contractor;
    } catch (createError) {
      console.error('❌ Failed to create contractor profile:', createError);
      throw new AuthorizationError('Failed to create contractor profile')
    }
  }
  
  return { user, contractor: user.contractor }
}

export async function requireCustomer() {
  const user = await getCurrentUser()
  
  if (user.type !== 'CUSTOMER') {
    throw new AuthorizationError('Customer access required')
  }
  
  return user
}

// Pagination utilities
export function createPaginationParams(page: number, limit: number) {
  const skip = (page - 1) * limit
  return { skip, take: limit }
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit)
  const hasNext = page < totalPages
  const hasPrev = page > 1

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
  }
}

// Sorting utilities
export function createOrderBy(sortBy: string, sortOrder: 'asc' | 'desc') {
  return { [sortBy]: sortOrder }
}

// Data transformation utilities
export function sanitizeUser<T extends Record<string, unknown> & { password?: unknown }>(user: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...sanitized } = user
  return sanitized as Omit<T, 'password'>
}

export function sanitizeRequest<T extends Record<string, unknown> & { customer?: Record<string, unknown> | null }>(request: T) {
  return {
    ...request,
    customer: request.customer ? sanitizeUser(request.customer as Record<string, unknown> & { password?: unknown }) : null,
  }
}

export function sanitizeBid<T extends Record<string, unknown> & { contractor?: { user: Record<string, unknown> & { password?: unknown } } | null; request?: Record<string, unknown> | null }>(bid: T) {
  return {
    ...bid,
    contractor: bid.contractor ? {
      ...bid.contractor,
      user: sanitizeUser(bid.contractor.user),
    } : null,
    request: bid.request ? sanitizeRequest(bid.request as Record<string, unknown> & { customer?: Record<string, unknown> | null }) : null,
  }
}

// Business logic utilities
export function calculateBidTotal(bid: {
  total_amount: number
}) {
  return bid.total_amount
}

export async function checkBidOwnership(bidId: string, contractorId: string) {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    select: { contractor_id: true, status: true },
  })

  if (!bid) {
    throw new NotFoundError('Bid not found')
  }

  if (bid.contractor_id !== contractorId) {
    throw new AuthorizationError('Access denied: Not your bid')
  }

  return bid
}

export async function checkRequestOwnership(requestId: string, customerId: string) {
  const request = await prisma.renovationRequest.findUnique({
    where: { id: requestId },
    select: { customer_id: true, status: true },
  })

  if (!request) {
    throw new NotFoundError('Request not found')
  }

  if (request.customer_id !== customerId) {
    throw new AuthorizationError('Access denied: Not your request')
  }

  return request
}

// Rate limiting utilities (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const userRequests = requestCounts.get(identifier)

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userRequests.count >= maxRequests) {
    return false
  }

  userRequests.count++
  return true
}

export function createRateLimitError() {
  return new APIError('Rate limit exceeded. Please try again later.', 429)
}

// Enhanced authentication validation
export async function validateUser() {
  try {
    const user = await authenticateUser()
    
    if (!user || !user.id) {
      return { success: false, error: 'Invalid user session' }
    }
    
    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, type: true, created_at: true }
    })
    
    if (!dbUser) {
      return { success: false, error: 'User profile not found in database' }
    }
    
    return { 
      success: true, 
      user: dbUser,
      message: 'User authenticated successfully' 
    }
  } catch (error) {
    console.error('User validation error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown authentication error' 
    }
  }
}

// Session check utility
export function checkUserSession() {
  try {
    // This would need to be implemented based on your session management
    // For now, we'll use the existing authenticateUser function
    return true
  } catch (error) {
    console.error('Session check error:', error)
    return false
  }
}

// Redirect utility for API routes
export function redirectToLogin() {
  return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
}
