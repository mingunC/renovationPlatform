import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createErrorResponse,
  createSuccessResponse,
  authenticateUser,
  getCurrentUser,
  createPaginationParams,
  createPaginationMeta,
  createOrderBy,
  sanitizeRequest,
  checkRateLimit,
  createRateLimitError,
} from '@/lib/api-utils'
import {
  createRequestSchema,
  requestFiltersSchema,
  type CreateRequestData,
  type RequestFilters,
} from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    // Return mock data for demo purposes
    const mockRequests = getMockRequestsByStatus(status)
    
    return createSuccessResponse({
      requests: mockRequests,
      pagination: {
        total: mockRequests.length,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      filters: { status },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

function getMockRequestsByStatus(status: string | null) {
  const baseRequests = [
    // 현장방문 대기 샘플 데이터
    {
      id: 'mock-inspection-1',
      category: 'KITCHEN',
      budget_range: 'RANGE_50_100K',
      timeline: 'WITHIN_3_MONTHS',
      postal_code: 'M5V 3A8',
      address: '123 King Street West, Toronto, ON',
      description: '완전한 주방 리모델링이 필요합니다. 기존 캐비닛 교체, 카운터탑 설치, 새로운 appliance 설치를 원합니다.',
      status: 'INSPECTION_SCHEDULED',
      inspection_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 후
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
      customer: {
        id: 'customer-1',
        name: '김민수',
        email: 'minsu@example.com',
        phone: '416-555-0101'
      },
      _count: { bids: 3 },
      inspection_interest: null // 아직 참여 의사 미표시
    },
    {
      id: 'mock-inspection-2',
      category: 'BATHROOM',
      budget_range: 'UNDER_50K',
      timeline: 'WITHIN_1_MONTH',
      postal_code: 'M4C 1B5',
      address: '456 Queen Street East, Toronto, ON',
      description: '마스터 욕실 리노베이션. 샤워부스 교체와 바닥 타일 교체가 주요 작업입니다.',
      status: 'INSPECTION_SCHEDULED',
      inspection_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 후
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
      customer: {
        id: 'customer-2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '416-555-0102'
      },
      _count: { bids: 2 },
      inspection_interest: null
    },
    
    // 입찰 진행중 샘플 데이터
    {
      id: 'mock-bidding-1',
      category: 'BASEMENT',
      budget_range: 'OVER_100K',
      timeline: 'WITHIN_6_MONTHS',
      postal_code: 'M2N 6K1',
      address: '789 Yonge Street, North York, ON',
      description: '지하실 완전 finishing 프로젝트. 가족실, 홈오피스, 저장공간 조성이 목표입니다.',
      status: 'BIDDING_OPEN',
      bidding_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 마감
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
      customer: {
        id: 'customer-3',
        name: '박영희',
        email: 'younghee@example.com',
        phone: '416-555-0103'
      },
      _count: { bids: 5 }
    },
    {
      id: 'mock-bidding-2',
      category: 'FLOORING',
      budget_range: 'RANGE_50_100K',
      timeline: 'WITHIN_2_MONTHS',
      postal_code: 'L5A 2B3',
      address: '321 Main Street, Mississauga, ON',
      description: '전체 집 바닥재 교체. 하드우드 플로어링으로 교체 희망합니다.',
      status: 'BIDDING_OPEN',
      bidding_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 후 마감
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4일 전
      customer: {
        id: 'customer-4',
        name: 'Michael Chen',
        email: 'michael@example.com',
        phone: '905-555-0104'
      },
      _count: { bids: 2 }
    },
    {
      id: 'mock-bidding-3',
      category: 'PAINTING',
      budget_range: 'UNDER_50K',
      timeline: 'WITHIN_1_MONTH',
      postal_code: 'M5V 3A8',
      address: '654 Adelaide Street, Toronto, ON',
      description: '집 전체 interior painting. 거실, 침실, 주방 포함하여 전문적인 페인팅 서비스가 필요합니다.',
      status: 'BIDDING_OPEN',
      bidding_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 후 마감
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
      customer: {
        id: 'customer-5',
        name: 'Emily Davis',
        email: 'emily@example.com',
        phone: '416-555-0105'
      },
      _count: { bids: 1 }
    },
    
    // 일반 OPEN 상태 데이터
    {
      id: 'mock-open-1',
      category: 'OTHER',
      budget_range: 'RANGE_50_100K',
      timeline: 'WITHIN_3_MONTHS',
      postal_code: 'K1A 0A6',
      address: '987 Sparks Street, Ottawa, ON',
      description: '데크 건설 및 outdoor living space 조성. 내구성 있는 자재 사용 희망.',
      status: 'OPEN',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
      customer: {
        id: 'customer-6',
        name: 'David Wilson',
        email: 'david@example.com',
        phone: '613-555-0106'
      },
      _count: { bids: 0 }
    }
  ]

  // 상태별 필터링
  if (status === 'INSPECTION_SCHEDULED') {
    return baseRequests.filter(req => req.status === 'INSPECTION_SCHEDULED')
  } else if (status === 'BIDDING_OPEN') {
    return baseRequests.filter(req => req.status === 'BIDDING_OPEN')
  } else if (status === 'OPEN') {
    return baseRequests.filter(req => req.status === 'OPEN')
  }
  
  // 상태 지정이 없으면 모든 데이터 반환
  return baseRequests
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    // Only customers can create requests
    if (user.type !== 'CUSTOMER') {
      return createErrorResponse(new Error('Only customers can create renovation requests'))
    }

    // Rate limiting
    if (!checkRateLimit(`requests_post_${user.id}`, 10, 60000)) {
      throw createRateLimitError()
    }

    const body = await request.json()
    
    // Validate request data
    const validatedData: CreateRequestData = createRequestSchema.parse(body)

    // Create the request
    const newRequest = await prisma.renovationRequest.create({
      data: {
        customer_id: user.id,
        property_type: validatedData.property_type,
        category: validatedData.category,
        budget_range: validatedData.budget_range,
        timeline: validatedData.timeline,
        postal_code: validatedData.postal_code.toUpperCase().replace(/\s+/g, ' '),
        address: validatedData.address.trim(),
        description: validatedData.description.trim(),
        photos: validatedData.photos || [],
        inspection_date: validatedData.inspection_date || null,
        status: 'OPEN',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
    })

    // Send notification emails to contractors in the area
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_SECRET_KEY || 'dev-secret'}`,
        },
        body: JSON.stringify({
          type: 'NEW_REQUEST',
          data: {
            request: newRequest,
            postal_code: validatedData.postal_code,
            category: validatedData.category,
          },
        }),
      })
    } catch (emailError) {
      console.error('Failed to send contractor notifications:', emailError)
      // Don't fail the request creation if email fails
    }

    return createSuccessResponse({
      message: 'Renovation request created successfully',
      request: sanitizeRequest(newRequest),
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