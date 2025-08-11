import { User, Contractor, RenovationRequest, Bid, Review } from '@prisma/client'

export type UserWithContractor = User & {
  contractor?: Contractor
}

export type ContractorWithUser = Contractor & {
  user: User
}

export type RenovationRequestWithDetails = RenovationRequest & {
  customer: User
  bids: (Bid & {
    contractor: ContractorWithUser
  })[]
  _count: {
    bids: number
  }
}

export type BidWithDetails = Bid & {
  request: RenovationRequest & {
    customer: User
  }
  contractor: ContractorWithUser
}

export type ReviewWithDetails = Review & {
  contractor: ContractorWithUser
  customer: User
  request: RenovationRequest
}

export interface CreateRenovationRequestData {
  category: string
  budget_range: string
  timeline: string
  postal_code: string
  address: string
  description: string
  photos: string[]
}

export interface CreateBidData {
  request_id: string
  labor_cost: number
  material_cost: number
  permit_cost?: number
  disposal_cost?: number
  timeline_weeks: number
  start_date?: Date
  included_items?: string
  excluded_items?: string
  notes?: string
}

export interface CreateReviewData {
  contractor_id: string
  request_id: string
  rating: number
  comment?: string
}

export interface DashboardStats {
  totalRequests: number
  activeRequests: number
  completedRequests: number
  totalBids: number
  acceptedBids: number
  averageRating: number
  reviewCount: number
}

export interface SearchFilters {
  category?: string
  budget_range?: string
  timeline?: string
  postal_code?: string
  status?: string
}
