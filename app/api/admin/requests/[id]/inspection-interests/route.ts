import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    
    // 요청 존재 여부 및 현장 방문 일정 확인
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: { id: requestId },
      include: {
        customer: true,
        inspection_interests: {
          include: {
            contractor: {
              include: {
                user: true,
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    })
    
    if (!renovationRequest) {
      return NextResponse.json(
        { error: 'Renovation request not found' },
        { status: 404 }
      )
    }
    
    if (!renovationRequest.inspection_date) {
      return NextResponse.json(
        { error: 'Inspection date not set for this request' },
        { status: 400 }
      )
    }
    
    // 참여 의사별로 분류
    const participatingContractors = renovationRequest.inspection_interests
      .filter(interest => interest.will_participate)
      .map(interest => ({
        id: interest.id,
        contractor_id: interest.contractor_id,
        contractor_name: interest.contractor.user.name,
        business_name: interest.contractor.business_name,
        phone: interest.contractor.phone || interest.contractor.user.phone,
        email: interest.contractor.user.email,
        rating: interest.contractor.rating,
        review_count: interest.contractor.review_count,
        categories: interest.contractor.categories,
        service_areas: interest.contractor.service_areas,
        responded_at: interest.created_at,
      }))
    
    const nonParticipatingContractors = renovationRequest.inspection_interests
      .filter(interest => !interest.will_participate)
      .map(interest => ({
        id: interest.id,
        contractor_id: interest.contractor_id,
        contractor_name: interest.contractor.user.name,
        business_name: interest.contractor.business_name,
        responded_at: interest.created_at,
      }))
    
    // 통계 정보
    const stats = {
      total_responses: renovationRequest.inspection_interests.length,
      participating: participatingContractors.length,
      not_participating: nonParticipatingContractors.length,
      response_rate_percentage: 0, // TODO: 초대된 총 업체 수 대비 응답률 계산
    }
    
    return NextResponse.json({
      request_id: requestId,
      inspection_date: renovationRequest.inspection_date,
      bidding_start_date: renovationRequest.bidding_start_date,
      bidding_end_date: renovationRequest.bidding_end_date,
      status: renovationRequest.status,
      project_info: {
        category: renovationRequest.category,
        budget_range: renovationRequest.budget_range,
        postal_code: renovationRequest.postal_code,
        description: renovationRequest.description,
        customer_name: renovationRequest.customer.name,
      },
      stats,
      participating_contractors: participatingContractors,
      non_participating_contractors: nonParticipatingContractors,
    })
    
  } catch (error) {
    console.error('Error fetching inspection interests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 참여 의사 수정/삭제 (관리자용)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')
    
    if (!contractorId) {
      return NextResponse.json(
        { error: 'contractor_id parameter is required' },
        { status: 400 }
      )
    }
    
    // 참여 의사 삭제
    const deletedInterest = await prisma.inspectionInterest.delete({
      where: {
        request_id_contractor_id: {
          request_id: requestId,
          contractor_id: contractorId,
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Inspection interest removed successfully',
      deleted_interest: deletedInterest,
    })
    
  } catch (error) {
    console.error('Error deleting inspection interest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
