import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createErrorResponse,
  createSuccessResponse,
  authenticateUser,
  getCurrentUser,
  requireContractor,
  createPaginationParams,
  createPaginationMeta,
  createOrderBy,
  sanitizeBid,
  calculateBidTotal,
  ConflictError,
  NotFoundError,
  checkRateLimit,
  createRateLimitError,
} from '@/lib/api-utils'
import {
  createBidSchema,
  bidFiltersSchema,
  type CreateBidData,
  type BidFilters,
} from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractor = searchParams.get('contractor')
    const status = searchParams.get('status')
    
    // Return mock bid data for demo purposes
    const mockBids = getMockBidsByContractor(contractor, status)
    
    return createSuccessResponse({
      bids: mockBids,
      pagination: {
        total: mockBids.length,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      filters: { contractor, status },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

function getMockBidsByContractor(contractor: string | null, status: string | null) {
  // 내 입찰 샘플 데이터
  const mockBids = [
    {
      id: 'mock-bid-1',
      request_id: 'mock-inspection-1',
      contractor_id: 'contractor-1',
      labor_cost: 15000,
      material_cost: 25000,
      permit_cost: 2000,
      disposal_cost: 1000,
      total_amount: 43000,
      timeline_weeks: 6,
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2주 후 시작
      included_items: '캐비닛 제작 및 설치, 카운터탑 설치, 싱크대 교체, 전기 작업, 페인팅',
      excluded_items: '가전제품, 바닥재',
      notes: '고품질 자재 사용, 5년 보증 제공',
      status: 'PENDING',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
      contractor: {
        id: 'contractor-1',
        business_name: '김씨 리노베이션',
        user: {
          id: 'user-contractor-1',
          name: '김철수',
          email: 'kim@renovation.com'
        }
      },
      request: {
        id: 'mock-inspection-1',
        category: 'KITCHEN',
        budget_range: 'RANGE_50_100K',
        postal_code: 'M5V 3A8',
        address: '123 King Street West, Toronto, ON',
        description: '완전한 주방 리모델링이 필요합니다.',
        status: 'INSPECTION_SCHEDULED',
        customer: {
          id: 'customer-1',
          name: '김민수',
          email: 'minsu@example.com',
          phone: '416-555-0101'
        }
      }
    },
    {
      id: 'mock-bid-2',
      request_id: 'mock-bidding-1',
      contractor_id: 'contractor-1',
      labor_cost: 45000,
      material_cost: 65000,
      permit_cost: 5000,
      disposal_cost: 3000,
      total_amount: 118000,
      timeline_weeks: 12,
      start_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3주 후 시작
      included_items: '지하실 완전 finishing, 드라이월 설치, 바닥재 설치, 전기 및 배관 작업, 페인팅',
      excluded_items: '가구, 가전제품',
      notes: '습기 방지 처리 포함, 10년 구조 보증',
      status: 'PENDING',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
      contractor: {
        id: 'contractor-1',
        business_name: '김씨 리노베이션',
        user: {
          id: 'user-contractor-1',
          name: '김철수',
          email: 'kim@renovation.com'
        }
      },
      request: {
        id: 'mock-bidding-1',
        category: 'BASEMENT',
        budget_range: 'OVER_100K',
        postal_code: 'M2N 6K1',
        address: '789 Yonge Street, North York, ON',
        description: '지하실 완전 finishing 프로젝트.',
        status: 'BIDDING_OPEN',
        customer: {
          id: 'customer-3',
          name: '박영희',
          email: 'younghee@example.com',
          phone: '416-555-0103'
        }
      }
    },
    {
      id: 'mock-bid-3',
      request_id: 'mock-bidding-3',
      contractor_id: 'contractor-1',
      labor_cost: 8000,
      material_cost: 12000,
      permit_cost: 0,
      disposal_cost: 500,
      total_amount: 20500,
      timeline_weeks: 2,
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1주 후 시작
      included_items: '전체 집 interior painting, 프라이머 작업, 2회 페인팅',
      excluded_items: '외부 페인팅, 천장 텍스처 작업',
      notes: '친환경 페인트 사용, 3년 보증',
      status: 'ACCEPTED',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
      contractor: {
        id: 'contractor-1',
        business_name: '김씨 리노베이션',
        user: {
          id: 'user-contractor-1',
          name: '김철수',
          email: 'kim@renovation.com'
        }
      },
      request: {
        id: 'mock-bidding-3',
        category: 'PAINTING',
        budget_range: 'UNDER_50K',
        postal_code: 'M5V 3A8',
        address: '654 Adelaide Street, Toronto, ON',
        description: '집 전체 interior painting.',
        status: 'BIDDING_OPEN',
        customer: {
          id: 'customer-5',
          name: 'Emily Davis',
          email: 'emily@example.com',
          phone: '416-555-0105'
        }
      }
    }
  ]

  // contractor=me 쿼리가 있으면 해당 contractor의 입찰만 반환
  if (contractor === 'me') {
    return mockBids
  }

  // 상태별 필터링
  if (status) {
    return mockBids.filter(bid => bid.status === status)
  }
  
  return mockBids
}

export async function POST(request: NextRequest) {
  try {
    const { contractor } = await requireContractor()

    // Rate limiting
    if (!checkRateLimit(`bids_post_${contractor.id}`, 20, 60000)) {
      throw createRateLimitError()
    }

    const body = await request.json()
    
    // Validate bid data
    const validatedData: CreateBidData = createBidSchema.parse(body)

    // Check if request exists and is open
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: { id: validatedData.request_id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!renovationRequest) {
      throw new NotFoundError('Renovation request not found')
    }

    if (renovationRequest.status !== 'OPEN') {
      throw new ConflictError('Cannot bid on closed requests')
    }

    // Check if contractor already has a bid for this request
    const existingBid = await prisma.bid.findFirst({
      where: {
        request_id: validatedData.request_id,
        contractor_id: contractor.id,
      },
    })

    if (existingBid) {
      throw new ConflictError('You have already submitted a bid for this request')
    }

    // Calculate total amount
    const total_amount = calculateBidTotal(validatedData)

    // Create the bid
    const newBid = await prisma.bid.create({
      data: {
        request_id: validatedData.request_id,
        contractor_id: contractor.id,
        labor_cost: validatedData.labor_cost,
        material_cost: validatedData.material_cost,
        permit_cost: validatedData.permit_cost,
        disposal_cost: validatedData.disposal_cost,
        total_amount,
        timeline_weeks: validatedData.timeline_weeks,
        start_date: new Date(validatedData.start_date),
        included_items: validatedData.included_items.trim(),
        excluded_items: validatedData.excluded_items?.trim(),
        notes: validatedData.notes?.trim(),
        status: 'PENDING',
      },
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

    // Send notification email to customer
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_SECRET_KEY || 'dev-secret'}`,
        },
        body: JSON.stringify({
          type: 'NEW_BID',
          recipient_email: renovationRequest.customer.email,
          recipient_name: renovationRequest.customer.name,
          data: {
            bid: newBid,
            request: renovationRequest,
            contractor_name: contractor.business_name || newBid.contractor.user.name,
          },
        }),
      })
    } catch (emailError) {
      console.error('Failed to send bid notification:', emailError)
      // Don't fail the bid creation if email fails
    }

    return createSuccessResponse({
      message: 'Bid submitted successfully',
      bid: sanitizeBid(newBid),
    }, 201)
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