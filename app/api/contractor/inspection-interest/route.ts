import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/api-utils'
import { z } from 'zod'

// 참여 의사 표시 스키마
const inspectionInterestSchema = z.object({
  request_id: z.string().uuid(),
  will_participate: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    // 사용자 인증
    const user = await authenticateUser()
    
    // 업체 정보 확인
    const contractor = await prisma.contractor.findUnique({
      where: { user_id: user.id },
      include: { user: true }
    })
    
    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const { request_id, will_participate } = inspectionInterestSchema.parse(body)
    
    // 요청 존재 여부 및 상태 확인
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: { id: request_id },
      include: { customer: true }
    })
    
    if (!renovationRequest) {
      return NextResponse.json(
        { error: 'Renovation request not found' },
        { status: 404 }
      )
    }
    
    // INSPECTION_SCHEDULED 상태인지 확인
    if (renovationRequest.status !== 'INSPECTION_SCHEDULED') {
      return NextResponse.json(
        { error: 'This request is not accepting inspection interest responses' },
        { status: 400 }
      )
    }
    
    // 현장 방문 일정이 설정되어 있는지 확인
    if (!renovationRequest.inspection_date) {
      return NextResponse.json(
        { error: 'Inspection date not set for this request' },
        { status: 400 }
      )
    }
    
    // 현장 방문일이 지났는지 확인
    const now = new Date()
    if (renovationRequest.inspection_date < now) {
      return NextResponse.json(
        { error: 'Inspection date has already passed' },
        { status: 400 }
      )
    }
    
    // 업체가 해당 카테고리를 담당하는지 확인
    if (!contractor.categories.includes(renovationRequest.category)) {
      return NextResponse.json(
        { error: 'Your business does not handle this category' },
        { status: 400 }
      )
    }
    
    // 기존 참여 의사가 있는지 확인하고 upsert
    const inspectionInterest = await prisma.inspectionInterest.upsert({
      where: {
        request_id_contractor_id: {
          request_id: request_id,
          contractor_id: contractor.id,
        }
      },
      update: {
        will_participate,
        updated_at: new Date(),
      },
      create: {
        request_id,
        contractor_id: contractor.id,
        will_participate,
      },
      include: {
        request: {
          include: {
            customer: true,
          }
        },
        contractor: {
          include: {
            user: true,
          }
        }
      }
    })
    
    // TODO: 관리자에게 이메일 알림 발송 (InspectionInterestEmail)
    
    return NextResponse.json({
      success: true,
      message: `Inspection interest ${will_participate ? 'confirmed' : 'declined'} successfully`,
      inspection_interest: {
        id: inspectionInterest.id,
        request_id,
        will_participate,
        inspection_date: renovationRequest.inspection_date,
        project_info: {
          category: renovationRequest.category,
          budget_range: renovationRequest.budget_range,
          postal_code: renovationRequest.postal_code,
          address: renovationRequest.address,
          description: renovationRequest.description,
        },
        updated_at: inspectionInterest.updated_at,
      }
    })
    
  } catch (error) {
    console.error('Error handling inspection interest:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 현재 업체의 참여 의사 조회
export async function GET(request: NextRequest) {
  try {
    // 사용자 인증
    const user = await authenticateUser()
    
    // 업체 정보 확인
    const contractor = await prisma.contractor.findUnique({
      where: { user_id: user.id }
    })
    
    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('request_id')
    
    if (requestId) {
      // 특정 요청에 대한 참여 의사 조회
      const inspectionInterest = await prisma.inspectionInterest.findUnique({
        where: {
          request_id_contractor_id: {
            request_id: requestId,
            contractor_id: contractor.id,
          }
        },
        include: {
          request: {
            include: {
              customer: true,
            }
          }
        }
      })
      
      return NextResponse.json({
        inspection_interest: inspectionInterest,
      })
    } else {
      // 모든 참여 의사 조회
      const inspectionInterests = await prisma.inspectionInterest.findMany({
        where: {
          contractor_id: contractor.id,
        },
        include: {
          request: {
            include: {
              customer: true,
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      })
      
      return NextResponse.json({
        inspection_interests: inspectionInterests,
      })
    }
    
  } catch (error) {
    console.error('Error fetching inspection interests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
