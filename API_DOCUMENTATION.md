# API Documentation - Renovate Platform

This document provides comprehensive documentation for the Renovate Platform API system, including all endpoints, validation schemas, error handling, and email notifications.

## Overview

The API system provides robust, type-safe endpoints for managing renovation requests, contractor bids, and email notifications. All endpoints include proper authentication, validation, error handling, and rate limiting.

## Features

### 🔒 **Security & Authentication**
- ✅ **Supabase Authentication**: JWT-based user authentication
- ✅ **Role-Based Access Control**: Customer vs. Contractor permissions
- ✅ **Ownership Verification**: Users can only access their own resources
- ✅ **Rate Limiting**: Prevents abuse with configurable limits
- ✅ **Input Validation**: Zod schema validation for all inputs
- ✅ **CORS Support**: Proper cross-origin resource sharing

### 📊 **Data Validation**
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Zod Schemas**: Runtime validation for all inputs
- ✅ **Custom Validators**: Canadian postal codes, date validation
- ✅ **Sanitization**: Data cleaning and normalization
- ✅ **Error Mapping**: Detailed validation error responses

### 🚀 **Performance & Reliability**
- ✅ **Pagination**: Efficient data loading with metadata
- ✅ **Sorting & Filtering**: Flexible query options
- ✅ **Error Handling**: Comprehensive error classification
- ✅ **Database Optimization**: Efficient queries with proper indexing
- ✅ **Response Caching**: Optimized for performance

## API Structure

```
/api/
├── requests/
│   ├── route.ts                    # GET, POST - List/Create requests
│   └── [id]/route.ts              # GET, PATCH, DELETE - Individual requests
├── bids/
│   ├── route.ts                    # GET, POST - List/Create bids
│   └── [id]/route.ts              # GET, PATCH, DELETE - Individual bids
└── email/
    └── route.ts                    # POST - Send notifications

lib/
├── validations.ts                  # Zod schemas and types
└── api-utils.ts                   # Utilities and error handling
```

## Validation Schemas

### 🔧 **Request Validation**

```typescript
// Create Request Schema
export const createRequestSchema = z.object({
  category: z.enum(['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING', 'OTHER']),
  budget_range: z.enum(['UNDER_10K', 'RANGE_10_25K', 'RANGE_25_50K', 'OVER_50K']),
  timeline: z.enum(['ASAP', 'WITHIN_1MONTH', 'WITHIN_3MONTHS', 'PLANNING']),
  postal_code: z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Invalid Canadian postal code'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed').optional(),
})

// Update Request Schema
export const updateRequestSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'COMPLETED']).optional(),
  description: z.string().min(50).optional(),
  photos: z.array(z.string()).max(5).optional(),
})

// Request Filters Schema
export const requestFiltersSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'COMPLETED']).optional(),
  category: z.enum(['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING', 'OTHER']).optional(),
  budget_range: z.enum(['UNDER_10K', 'RANGE_10_25K', 'RANGE_25_50K', 'OVER_50K']).optional(),
  timeline: z.enum(['ASAP', 'WITHIN_1MONTH', 'WITHIN_3MONTHS', 'PLANNING']).optional(),
  postal_code: z.string().optional(),
  customer_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'budget_range', 'timeline']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})
```

### 💰 **Bid Validation**

```typescript
// Create Bid Schema
export const createBidSchema = z.object({
  request_id: z.string().uuid(),
  labor_cost: z.number().min(0, 'Labor cost must be positive'),
  material_cost: z.number().min(0, 'Material cost must be positive'),
  permit_cost: z.number().min(0, 'Permit cost must be non-negative').default(0),
  disposal_cost: z.number().min(0, 'Disposal cost must be non-negative').default(0),
  timeline_weeks: z.number().int().min(1).max(52),
  start_date: z.string().refine((date) => {
    const startDate = new Date(date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return startDate >= tomorrow
  }, 'Start date must be at least tomorrow'),
  included_items: z.string().min(10),
  excluded_items: z.string().optional(),
  notes: z.string().optional(),
})

// Update Bid Schema
export const updateBidSchema = z.object({
  labor_cost: z.number().min(0).optional(),
  material_cost: z.number().min(0).optional(),
  permit_cost: z.number().min(0).optional(),
  disposal_cost: z.number().min(0).optional(),
  timeline_weeks: z.number().int().min(1).max(52).optional(),
  start_date: z.string().refine(...).optional(),
  included_items: z.string().min(10).optional(),
  excluded_items: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
})
```

## API Endpoints

### 📋 **Requests API**

#### `GET /api/requests`
List renovation requests with filtering and pagination.

**Query Parameters:**
```typescript
{
  status?: 'OPEN' | 'CLOSED' | 'COMPLETED'
  category?: 'KITCHEN' | 'BATHROOM' | 'BASEMENT' | 'FLOORING' | 'PAINTING' | 'OTHER'
  budget_range?: 'UNDER_10K' | 'RANGE_10_25K' | 'RANGE_25_50K' | 'OVER_50K'
  timeline?: 'ASAP' | 'WITHIN_1MONTH' | 'WITHIN_3MONTHS' | 'PLANNING'
  postal_code?: string
  customer_id?: string
  page?: number (default: 1)
  limit?: number (default: 20, max: 100)
  sort_by?: 'created_at' | 'budget_range' | 'timeline' (default: 'created_at')
  sort_order?: 'asc' | 'desc' (default: 'desc')
}
```

**Response:**
```typescript
{
  requests: RenovationRequest[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: RequestFilters
  timestamp: string
}
```

**Features:**
- ✅ Flexible filtering by all major fields
- ✅ Pagination with metadata
- ✅ Sorting by multiple criteria
- ✅ Rate limiting (100 requests/minute)
- ✅ Includes bid count and customer info

#### `POST /api/requests`
Create a new renovation request (customers only).

**Request Body:**
```typescript
{
  category: 'KITCHEN' | 'BATHROOM' | 'BASEMENT' | 'FLOORING' | 'PAINTING' | 'OTHER'
  budget_range: 'UNDER_10K' | 'RANGE_10_25K' | 'RANGE_25_50K' | 'OVER_50K'
  timeline: 'ASAP' | 'WITHIN_1MONTH' | 'WITHIN_3MONTHS' | 'PLANNING'
  postal_code: string  // Canadian format: A1A 1A1
  address: string      // Min 10 characters
  description: string  // Min 50 characters
  photos?: string[]    // Max 5 photos
}
```

**Response:**
```typescript
{
  message: "Renovation request created successfully"
  request: RenovationRequest
  timestamp: string
}
```

**Features:**
- ✅ Customer-only access control
- ✅ Canadian postal code validation
- ✅ Auto-notification to contractors
- ✅ Photo upload support
- ✅ Rate limiting (10 requests/minute)

#### `GET /api/requests/[id]`
Get a specific request with all bids and reviews.

**Response:**
```typescript
{
  request: RenovationRequest & {
    customer: User
    bids: Bid[]
    reviews: Review[]
    _count: { bids: number }
  }
  timestamp: string
}
```

**Access Control:**
- ✅ Request owners see all bids
- ✅ Contractors see only their own bids
- ✅ Public requests visible to all authenticated users

#### `PATCH /api/requests/[id]`
Update request status or details (owners only).

**Request Body:**
```typescript
{
  status?: 'OPEN' | 'CLOSED' | 'COMPLETED'
  description?: string  // Min 50 characters
  photos?: string[]     // Max 5 photos
}
```

**Business Rules:**
- ✅ Cannot reopen requests with accepted bids
- ✅ Closing request rejects all pending bids
- ✅ Status change notifications sent
- ✅ Ownership verification required

#### `DELETE /api/requests/[id]`
Delete a request (owners only, no accepted bids).

**Features:**
- ✅ Ownership verification
- ✅ Prevents deletion with accepted bids
- ✅ Cascades to related bids

### 💼 **Bids API**

#### `GET /api/bids`
List bids with filtering and pagination.

**Query Parameters:**
```typescript
{
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  request_id?: string
  contractor_id?: string
  contractor?: 'me'  // Special filter for current contractor
  page?: number (default: 1)
  limit?: number (default: 20, max: 100)
  sort_by?: 'created_at' | 'total_amount' | 'timeline_weeks'
  sort_order?: 'asc' | 'desc' (default: 'desc')
}
```

**Response:**
```typescript
{
  bids: Bid[]
  pagination: PaginationMeta
  filters: BidFilters
  timestamp: string
}
```

**Features:**
- ✅ Contractor-specific filtering (`contractor=me`)
- ✅ Request-specific bid lists
- ✅ Status-based filtering
- ✅ Sort by cost or timeline

#### `POST /api/bids`
Submit a new bid (contractors only).

**Request Body:**
```typescript
{
  request_id: string
  labor_cost: number     // >= 0
  material_cost: number  // >= 0
  permit_cost: number    // >= 0, default: 0
  disposal_cost: number  // >= 0, default: 0
  timeline_weeks: number // 1-52 weeks
  start_date: string     // Must be tomorrow or later
  included_items: string // Min 10 characters
  excluded_items?: string
  notes?: string
}
```

**Response:**
```typescript
{
  message: "Bid submitted successfully"
  bid: Bid
  timestamp: string
}
```

**Business Rules:**
- ✅ One bid per contractor per request
- ✅ Can only bid on open requests
- ✅ Auto-calculates total amount
- ✅ Customer notification sent
- ✅ Start date validation

#### `GET /api/bids/[id]`
Get detailed bid information.

**Access Control:**
- ✅ Bid owner can view
- ✅ Request owner can view
- ✅ Full relational data included

#### `PATCH /api/bids/[id]`
Update bid details or status.

**Request Body:**
```typescript
{
  // Cost updates (pending bids only)
  labor_cost?: number
  material_cost?: number
  permit_cost?: number
  disposal_cost?: number
  
  // Timeline updates (pending bids only)
  timeline_weeks?: number
  start_date?: string
  
  // Content updates (pending bids only)
  included_items?: string
  excluded_items?: string
  notes?: string
  
  // Status updates (customers only)
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}
```

**Business Rules:**
- ✅ Only pending bids can be edited
- ✅ Auto-recalculates total on cost changes
- ✅ Accepting bid rejects all others
- ✅ Status change notifications
- ✅ Request closure on acceptance

#### `DELETE /api/bids/[id]`
Withdraw a bid (pending only).

**Features:**
- ✅ Pending bids only
- ✅ Ownership verification
- ✅ Customer notification
- ✅ Audit trail maintenance

### 📧 **Email API**

#### `POST /api/email`
Send notification emails with professional templates.

**Authentication:**
- ✅ API key authentication
- ✅ Internal service calls
- ✅ Rate limiting protection

**Email Types:**

1. **NEW_REQUEST** - Contractor notifications
```typescript
{
  type: 'NEW_REQUEST'
  data: {
    request: RenovationRequest
    postal_code: string
    category: string
  }
}
```

2. **NEW_BID** - Customer notifications
```typescript
{
  type: 'NEW_BID'
  recipient_email: string
  recipient_name: string
  data: {
    bid: Bid
    request: RenovationRequest
    contractor_name: string
  }
}
```

3. **BID_ACCEPTED** - Contractor success notification
```typescript
{
  type: 'BID_ACCEPTED'
  recipient_email: string
  recipient_name: string
  data: {
    bid: Bid
    request: RenovationRequest
    customer_name: string
  }
}
```

4. **BID_REJECTED** - Contractor feedback
```typescript
{
  type: 'BID_REJECTED'
  recipient_email: string
  recipient_name: string
  data: {
    bid: Bid
    request: RenovationRequest
  }
}
```

**Email Features:**
- ✅ **HTML Templates**: Professional, responsive design
- ✅ **Text Fallbacks**: Plain text versions for all emails
- ✅ **Dynamic Content**: Personalized data injection
- ✅ **Brand Consistency**: Unified styling and messaging
- ✅ **Call-to-Action**: Direct links to relevant platform pages

## Error Handling

### 🛡️ **Error Classification**

```typescript
// Custom Error Classes
class APIError extends Error {
  constructor(message: string, statusCode: number = 500, details?: Record<string, any>)
}

class ValidationError extends APIError {    // 400
class AuthenticationError extends APIError { // 401
class AuthorizationError extends APIError {  // 403
class NotFoundError extends APIError {       // 404
class ConflictError extends APIError {       // 409
```

### 📋 **Error Response Format**

```typescript
{
  error: string
  details?: {
    issues?: ValidationIssue[]  // Zod validation errors
    field?: string              // Prisma constraint errors
  }
  timestamp: string
}
```

### 🔍 **Validation Error Details**

```typescript
// Zod Validation Errors
{
  error: "Validation failed"
  details: {
    issues: [
      {
        path: "postal_code"
        message: "Invalid Canadian postal code"
        code: "invalid_string"
      }
    ]
  }
  timestamp: "2024-01-15T10:30:00Z"
}
```

### 🗄️ **Database Error Handling**

```typescript
// Prisma Error Mapping
P2002 -> 409 Conflict (Unique constraint)
P2025 -> 404 Not Found (Record not found)
P2003 -> 400 Bad Request (Foreign key constraint)
```

## Security Features

### 🔐 **Authentication & Authorization**

**JWT Token Validation:**
```typescript
export async function authenticateUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new AuthenticationError('Invalid or missing authentication')
  }
  
  return user
}
```

**Role-Based Access:**
```typescript
export async function requireContractor() {
  const user = await getCurrentUser()
  
  if (user.type !== 'CONTRACTOR' || !user.contractor) {
    throw new AuthorizationError('Contractor access required')
  }
  
  return { user, contractor: user.contractor }
}
```

**Ownership Verification:**
```typescript
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
```

### 🚦 **Rate Limiting**

```typescript
// Basic Rate Limiting Implementation
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
```

**Rate Limits by Endpoint:**
- GET requests: 100/minute
- POST requests: 10-20/minute
- DELETE requests: 10/minute
- Email API: 50/minute

### 🧹 **Data Sanitization**

```typescript
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
```

## Performance Optimizations

### 📊 **Database Queries**

**Efficient Includes:**
```typescript
// Only include necessary fields
include: {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      // Don't include sensitive data
    },
  },
  _count: {
    select: {
      bids: true,
    },
  },
}
```

**Pagination:**
```typescript
export function createPaginationParams(page: number, limit: number) {
  const skip = (page - 1) * limit
  return { skip, take: limit }
}
```

**Optimized Sorting:**
```typescript
export function createOrderBy(sortBy: string, sortOrder: 'asc' | 'desc') {
  return { [sortBy]: sortOrder }
}
```

### 🔄 **Business Logic Utilities**

```typescript
export function calculateBidTotal(bid: {
  labor_cost: number
  material_cost: number
  permit_cost: number
  disposal_cost: number
}) {
  return bid.labor_cost + bid.material_cost + bid.permit_cost + bid.disposal_cost
}
```

## Development Features

### 🛠️ **Type Safety**

**Full TypeScript Coverage:**
```typescript
export type CreateRequestData = z.infer<typeof createRequestSchema>
export type UpdateRequestData = z.infer<typeof updateRequestSchema>
export type RequestFilters = z.infer<typeof requestFiltersSchema>
export type CreateBidData = z.infer<typeof createBidSchema>
export type UpdateBidData = z.infer<typeof updateBidSchema>
export type BidFilters = z.infer<typeof bidFiltersSchema>
```

**Runtime Validation:**
```typescript
// All API endpoints use Zod for runtime validation
const validatedData: CreateRequestData = createRequestSchema.parse(body)
```

### 📝 **Logging & Monitoring**

**Error Logging:**
```typescript
export function createErrorResponse(error: unknown) {
  console.error('API Error:', error)
  // Structured error logging with context
}
```

**Performance Monitoring:**
- Database query performance
- API response times
- Rate limiting metrics
- Error frequency tracking

## Testing Strategy

### 🧪 **API Testing**

**Endpoint Testing:**
- Authentication flow testing
- Validation error testing
- Business rule enforcement
- Rate limiting verification

**Data Integrity:**
- Foreign key constraints
- Cascade operations
- Transaction consistency
- Concurrent access handling

**Security Testing:**
- Unauthorized access attempts
- SQL injection prevention
- XSS attack mitigation
- Rate limit bypass attempts

This API system provides a robust, secure, and scalable foundation for the Renovate Platform with comprehensive error handling, validation, and email notifications! 🚀
