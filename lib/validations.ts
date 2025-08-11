import { z } from 'zod'

// User and Authentication Schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  type: z.enum(['CUSTOMER', 'CONTRACTOR']),
})

// Request Schemas
export const createRequestSchema = z.object({
  category: z.enum(['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING', 'OTHER']),
  budget_range: z.enum(['UNDER_50K', 'RANGE_50_100K', 'OVER_100K']),
  timeline: z.enum(['ASAP', 'WITHIN_1MONTH', 'WITHIN_3MONTHS', 'PLANNING']),
  postal_code: z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Invalid Canadian postal code'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed').optional(),
})

export const updateRequestSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'COMPLETED']).optional(),
  description: z.string().min(50).optional(),
  photos: z.array(z.string()).max(5).optional(),
})

export const requestFiltersSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'COMPLETED']).optional(),
  category: z.enum(['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING', 'OTHER']).optional(),
  budget_range: z.enum(['UNDER_50K', 'RANGE_50_100K', 'OVER_100K']).optional(),
  timeline: z.enum(['ASAP', 'WITHIN_1MONTH', 'WITHIN_3MONTHS', 'PLANNING']).optional(),
  postal_code: z.string().optional(),
  customer_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'budget_range', 'timeline']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Bid Schemas
export const createBidSchema = z.object({
  request_id: z.string().uuid(),
  labor_cost: z.number().min(0, 'Labor cost must be positive'),
  material_cost: z.number().min(0, 'Material cost must be positive'),
  permit_cost: z.number().min(0, 'Permit cost must be non-negative').default(0),
  disposal_cost: z.number().min(0, 'Disposal cost must be non-negative').default(0),
  timeline_weeks: z.number().int().min(1, 'Timeline must be at least 1 week').max(52, 'Timeline cannot exceed 52 weeks'),
  start_date: z.string().refine((date) => {
    const startDate = new Date(date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return startDate >= tomorrow
  }, 'Start date must be at least tomorrow'),
  included_items: z.string().min(10, 'Please describe what is included (minimum 10 characters)'),
  excluded_items: z.string().optional(),
  notes: z.string().optional(),
})

export const updateBidSchema = z.object({
  labor_cost: z.number().min(0).optional(),
  material_cost: z.number().min(0).optional(),
  permit_cost: z.number().min(0).optional(),
  disposal_cost: z.number().min(0).optional(),
  timeline_weeks: z.number().int().min(1).max(52).optional(),
  start_date: z.string().refine((date) => {
    const startDate = new Date(date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return startDate >= tomorrow
  }, 'Start date must be at least tomorrow').optional(),
  included_items: z.string().min(10).optional(),
  excluded_items: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
})

export const bidFiltersSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  request_id: z.string().uuid().optional(),
  contractor_id: z.string().uuid().optional(),
  contractor: z.enum(['me']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'total_amount', 'timeline_weeks']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Email Schemas
export const emailNotificationSchema = z.object({
  type: z.enum(['NEW_REQUEST', 'NEW_BID', 'BID_ACCEPTED', 'BID_REJECTED']),
  recipient_email: z.string().email(),
  recipient_name: z.string().min(1),
  data: z.record(z.string(), z.any()),
})

// Error Response Schema
export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().datetime(),
})

// Success Response Schemas
export const successResponseSchema = z.object({
  message: z.string(),
  data: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().datetime(),
})

// Type exports
export type CreateRequestData = z.infer<typeof createRequestSchema>
export type UpdateRequestData = z.infer<typeof updateRequestSchema>
export type RequestFilters = z.infer<typeof requestFiltersSchema>
export type CreateBidData = z.infer<typeof createBidSchema>
export type UpdateBidData = z.infer<typeof updateBidSchema>
export type BidFilters = z.infer<typeof bidFiltersSchema>
export type EmailNotificationData = z.infer<typeof emailNotificationSchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type SuccessResponse = z.infer<typeof successResponseSchema>
