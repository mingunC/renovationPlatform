// app/api/admin/schedule-inspection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerActionClient } from '@/lib/supabase-server';
import { z } from 'zod';

const scheduleInspectionSchema = z.object({
  request_id: z.string().uuid(),
  inspection_date: z.string().datetime(),
  inspection_time: z.string().optional(),
  notes: z.string().optional(),
  notify_contractors: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = scheduleInspectionSchema.parse(body);
    
    // 관리자 권한 확인
    const supabase = await createServerActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: 관리자 권한 체크 로직 추가
    // const isAdmin = await checkAdminRole(user.id);
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { error: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    const result = await prisma.$transaction(async (tx) => {
      // 요청 정보 조회
      const renovationRequest = await tx.renovationRequest.findUnique({
        where: { id: validatedData.request_id },
        include: {
          customer: true
        }
      });

      if (!renovationRequest) {
        throw new Error('Request not found');
      }

      // INSPECTION_PENDING 상태인지 확인
      if (renovationRequest.status !== 'INSPECTION_PENDING') {
        throw new Error(`Cannot schedule inspection for status: ${renovationRequest.status}`);
      }

      // 참여 업체 목록 조회
      const participants = await tx.inspectionInterest.findMany({
        where: {
          request_id: validatedData.request_id,
          will_participate: true
        },
        include: {
          contractor: true
        }
      });

      if (participants.length === 0) {
        throw new Error('No contractors have confirmed participation');
      }

      // 현장 방문 일정 확정
      const updatedRequest = await tx.renovationRequest.update({
        where: { id: validatedData.request_id },
        data: {
          status: 'INSPECTION_SCHEDULED',
          inspection_date: new Date(validatedData.inspection_date),
          inspection_time: validatedData.inspection_time,
          notes: validatedData.notes,
          // 입찰 일정 자동 설정 (현장 방문 후 7일)
          bidding_start_date: new Date(validatedData.inspection_date),
          bidding_end_date: new Date(
            new Date(validatedData.inspection_date).getTime() + 7 * 24 * 60 * 60 * 1000
          ),
          updated_at: new Date()
        }
      });

      // 알림 발송 준비 (실제 구현 시)
      if (validatedData.notify_contractors) {
        const notifications = [];
        
        // 업체들에게 알림
        for (const participant of participants) {
          notifications.push({
            type: 'INSPECTION_SCHEDULED',
            recipient_id: participant.contractor.user_id,
            title: '현장 방문 일정 확정',
            message: `${renovationRequest.customer.name}님의 프로젝트 현장 방문이 ${validatedData.inspection_date}에 확정되었습니다.`,
            metadata: {
              request_id: validatedData.request_id,
              inspection_date: validatedData.inspection_date,
              inspection_time: validatedData.inspection_time,
              address: renovationRequest.address
            }
          });
        }

        // 고객에게 알림
        notifications.push({
          type: 'INSPECTION_SCHEDULED',
          recipient_id: renovationRequest.customer_id,
          title: '현장 방문 일정 확정',
          message: `${participants.length}개 업체가 ${validatedData.inspection_date}에 현장 방문 예정입니다.`,
          metadata: {
            request_id: validatedData.request_id,
            contractor_count: participants.length,
            inspection_date: validatedData.inspection_date,
            inspection_time: validatedData.inspection_time
          }
        });

        // TODO: 실제 알림 발송 구현
        // await sendNotifications(notifications);
        console.log('📧 Notifications prepared:', notifications.length);
      }

      return {
        request: updatedRequest,
        participants: participants.length
      };
    });

    return NextResponse.json({
      success: true,
      message: `현장 방문이 ${result.participants}개 업체와 함께 확정되었습니다.`,
      data: result
    });

  } catch (error) {
    console.error('Error scheduling inspection:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to schedule inspection' },
      { status: 500 }
    );
  }
}

// GET: 일정 확정 대기 중인 요청 목록
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const supabase = await createServerActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // INSPECTION_PENDING 상태의 요청들 조회
    const pendingRequests = await prisma.renovationRequest.findMany({
      where: {
        status: 'INSPECTION_PENDING'
      },
      include: {
        customer: true,
        inspection_interests: {
          where: {
            will_participate: true
          },
          include: {
            contractor: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // 응답 데이터 포맷팅
    const formattedRequests = pendingRequests.map(request => ({
      id: request.id,
      customer_name: request.customer.name,
      category: request.category,
      budget_range: request.budget_range,
      address: request.address,
      postal_code: request.postal_code,
      description: request.description,
      created_at: request.created_at,
      participants: request.inspection_interests.map(interest => ({
        contractor_id: interest.contractor_id,
        business_name: interest.contractor.business_name,
        confirmed_at: interest.created_at
      })),
      participant_count: request.inspection_interests.length
    }));

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      total: formattedRequests.length
    });

  } catch (error) {
    console.error('Error fetching pending inspections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending inspections' },
      { status: 500 }
    );
  }
}