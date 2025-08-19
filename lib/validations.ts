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
  property_type: z.enum(['DETACHED_HOUSE', 'TOWNHOUSE', 'CONDO', 'COMMERCIAL']),
  category: z.array(z.enum(['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING', 'OTHER', 'OFFICE', 'RETAIL', 'CAFE_RESTAURANT', 'EDUCATION', 'HOSPITALITY_HEALTHCARE'])).min(1, 'At least one category must be selected'),
  budget_range: z.enum(['UNDER_50K', 'RANGE_50_100K', 'OVER_100K']),
  timeline: z.enum(['ASAP', 'WITHIN_1MONTH', 'WITHIN_3MONTHS', 'PLANNING']),
  postal_code: z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Invalid Canadian postal code'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed').optional(),
  inspection_date: z.string().min(1, 'Inspection date is required'),
})

export const updateRequestSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'COMPLETED']).optional(),
  description: z.string().min(50).optional(),
  photos: z.array(z.string()).max(5).optional(),
})

export const requestFiltersSchema = z.object({
  property_type: z.enum(['DETACHED_HOUSE', 'TOWNHOUSE', 'CONDO', 'COMMERCIAL']).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'COMPLETED']).optional(),
  category: z.array(z.enum(['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING', 'OTHER', 'OFFICE', 'RETAIL', 'CAFE_RESTAURANT', 'EDUCATION', 'HOSPITALITY_HEALTHCARE'])).optional(),
  budget_range: z.enum(['UNDER_50K', 'RANGE_50_100K', 'OVER_100K']).optional(),
  timeline: z.enum(['ASAP', 'WITHIN_1MONTH', 'WITHIN_3MONTHS', 'PLANNING']).optional(),
  postal_code: z.string().optional(),
  customer_id: z.string().uuid().optional(),
  inspection_date: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'budget_range', 'timeline']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Bid Schemas
export const createBidSchema = z.object({
  project_id: z.string().min(1, "Project ID is required"),
  total_amount: z.number().min(1, "Total amount must be greater than 0"),
  timeline_weeks: z.number().min(1, "Timeline must be at least 1 week"),
  start_date: z.string().optional(),
  labor_cost: z.number().default(0),
  material_cost: z.number().default(0),
  permit_cost: z.number().default(0),
  disposal_cost: z.number().default(0),
  included_items: z.string().optional(),
  excluded_items: z.string().optional(),
  estimate_file_url: z.string().optional(), // URL 검증 제거, 선택사항으로 변경
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
