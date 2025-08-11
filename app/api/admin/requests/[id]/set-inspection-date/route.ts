import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 현장 방문 일정 설정 스키마
const setInspectionDateSchema = z.object({
  inspection_date: z.string().datetime(),
  bidding_duration_days: z.number().min(1).max(30).default(7), // 기본 7일
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    const body = await request.json()
    
    // 입력값 검증
    const { inspection_date, bidding_duration_days } = setInspectionDateSchema.parse(body)
    
    const inspectionDateTime = new Date(inspection_date)
    const biddingStartDate = new Date(inspectionDateTime)
    biddingStartDate.setHours(0, 0, 0, 0) // 자정부터 시작
    
    const biddingEndDate = new Date(biddingStartDate)
    biddingEndDate.setDate(biddingEndDate.getDate() + bidding_duration_days)
    
    // 요청 존재 여부 확인
    const existingRequest = await prisma.renovationRequest.findUnique({
      where: { id: requestId },
      include: {
        customer: true,
      }
    })
    
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Renovation request not found' },
        { status: 404 }
      )
    }
    
    // 현재 상태가 OPEN인지 확인
    if (existingRequest.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Request is not in OPEN status' },
        { status: 400 }
      )
    }
    
    // 현장 방문 일정 설정 및 상태 변경
    const updatedRequest = await prisma.renovationRequest.update({
      where: { id: requestId },
      data: {
        inspection_date: inspectionDateTime,
        bidding_start_date: biddingStartDate,
        bidding_end_date: biddingEndDate,
        status: 'INSPECTION_SCHEDULED',
      },
      include: {
        customer: true,
        inspection_interests: {
          include: {
            contractor: {
              include: {
                user: true,
              }
            }
          }
        }
      }
    })
    
    // TODO: 이메일 알림 발송 (InspectionDateSetEmail)
    // - 해당 카테고리에 관심있는 모든 업체들에게 알림
    // - 현장 방문 일정과 참여 의사 표시 마감일 포함
    
    return NextResponse.json({
      success: true,
      message: 'Inspection date set successfully',
      request: updatedRequest,
      inspection_date: inspectionDateTime.toISOString(),
      bidding_start_date: biddingStartDate.toISOString(),
      bidding_end_date: biddingEndDate.toISOString(),
    })
    
  } catch (error) {
    console.error('Error setting inspection date:', error)
    
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
