import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, any>) {
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
    const prismaError = error as any
    
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

export function createSuccessResponse(data: any, status: number = 200) {
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
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new AuthenticationError('Invalid or missing authentication')
  }
  
  return user
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
  
  if (user.type !== 'CONTRACTOR' || !user.contractor) {
    throw new AuthorizationError('Contractor access required')
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
export function sanitizeUser(user: any) {
  const { password, ...sanitized } = user
  return sanitized
}

export function sanitizeRequest(request: any) {
  return {
    ...request,
    customer: request.customer ? sanitizeUser(request.customer) : null,
  }
}

export function sanitizeBid(bid: any) {
  return {
    ...bid,
    contractor: bid.contractor ? {
      ...bid.contractor,
      user: sanitizeUser(bid.contractor.user),
    } : null,
    request: bid.request ? sanitizeRequest(bid.request) : null,
  }
}

// Business logic utilities
export function calculateBidTotal(bid: {
  labor_cost: number
  material_cost: number
  permit_cost: number
  disposal_cost: number
}) {
  return bid.labor_cost + bid.material_cost + bid.permit_cost + bid.disposal_cost
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
