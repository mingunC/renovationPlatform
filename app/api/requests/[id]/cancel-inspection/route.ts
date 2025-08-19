import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerActionClient } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id

    // 사용자 인증 확인
    const supabase = await createServerActionClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 프로젝트 조회 및 권한 확인
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: { id: requestId },
      include: {
        customer: {
          select: { id: true, email: true }
        }
      }
    })

    if (!renovationRequest) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // 고객 본인만 취소 가능
    if (renovationRequest.customer.id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // 현장방문 예정 상태인지 확인
    if (renovationRequest.status !== 'INSPECTION_SCHEDULED') {
      return NextResponse.json(
        { error: 'Only scheduled inspection projects can be cancelled' },
        { status: 400 }
      )
    }

    // 프로젝트 상태를 새요청으로 되돌리기
    const updatedRequest = await prisma.renovationRequest.update({
      where: { id: requestId },
      data: {
        status: 'INSPECTION_PENDING', // 새요청 상태로 되돌리기
        inspection_date: null, // 현장방문 날짜 제거
        inspection_time: null, // 현장방문 시간 제거
        inspection_notes: null, // 현장방문 메모 제거
        bidding_start_date: null, // 입찰 시작일 제거
        bidding_end_date: null, // 입찰 종료일 제거
        updated_at: new Date()
      }
    })

    // 관련된 현장방문 참여 정보도 삭제
    await prisma.inspectionInterest.deleteMany({
      where: { request_id: requestId }
    })

    console.log(`✅ Project ${requestId} cancelled from INSPECTION_SCHEDULED to INSPECTION_PENDING`)

    return NextResponse.json({
      success: true,
      message: '현장방문이 취소되었습니다. 프로젝트가 새요청 탭으로 이동했습니다.',
      project: updatedRequest
    })

  } catch (error) {
    console.error('Error cancelling inspection:', error)
    return NextResponse.json(
      { error: 'Failed to cancel inspection' },
      { status: 500 }
    )
  }
}
