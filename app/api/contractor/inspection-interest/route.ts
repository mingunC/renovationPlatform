import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase';
import { z } from 'zod';

// 참여 의사 표시 스키마
const inspectionInterestSchema = z.object({
  request_id: z.string().uuid(),
  will_participate: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request_id, will_participate } = body;
    
    // Mock 데이터 처리 (개발/데모 환경용)
    if (request_id && typeof request_id === 'string' && request_id.startsWith('mock-')) {
      // Mock 데이터에 대한 요청이므로 시뮬레이션된 응답 반환
      await new Promise(resolve => setTimeout(resolve, 500)); // 실제 API 지연 시뮬레이션
      
      return NextResponse.json({
        success: true,
        message: `Inspection interest ${will_participate ? 'confirmed' : 'declined'} successfully`,
        inspection_interest: {
          id: `mock-interest-${Date.now()}`,
          request_id,
          will_participate,
          inspection_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
          project_info: {
            category: 'KITCHEN',
            budget_range: 'RANGE_50_100K',
            postal_code: 'M5V 3A8',
            address: '123 Main Street, Toronto, ON',
            description: 'Mock inspection interest response',
          },
          updated_at: new Date().toISOString(),
        }
      });
    }

    // 실제 UUID 형식 검증
    const validatedData = inspectionInterestSchema.parse(body);
    const { request_id: validRequestId, will_participate: validWillParticipate } = validatedData;

    // 사용자 인증
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please log in to participate in inspections'
        },
        { status: 401 }
      );
    }

    // 업체 정보 확인
    const contractor = await prisma.contractor.findUnique({
      where: { user_id: user.id }
    });

    if (!contractor) {
      return NextResponse.json(
        { 
          error: 'Contractor profile not found',
          message: 'Please complete your contractor registration first'
        },
        { status: 404 }
      );
    }

    // 요청 존재 여부 및 상태 확인
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: { id: validRequestId }
    });

    if (!renovationRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (renovationRequest.status !== 'INSPECTION_SCHEDULED') {
      return NextResponse.json(
        { error: 'Request is not in inspection scheduled status' },
        { status: 400 }
      );
    }

    // Create or update inspection interest
    const inspectionInterest = await prisma.inspectionInterest.upsert({
      where: {
        request_id_contractor_id: {
          request_id: validRequestId,
          contractor_id: contractor.id
        }
      },
      update: {
        will_participate: validWillParticipate
      },
      create: {
        request_id: validRequestId,
        contractor_id: contractor.id,
        will_participate: validWillParticipate
      }
    });

    return NextResponse.json({
      success: true,
      message: `Inspection interest ${validWillParticipate ? 'confirmed' : 'declined'} successfully`,
      data: inspectionInterest
    });

  } catch (error) {
    console.error('Error recording inspection interest:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to record inspection interest' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get contractor profile
    const contractor = await prisma.contractor.findUnique({
      where: { user_id: user.id }
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      );
    }

    // Get all inspection interests for this contractor
    const inspectionInterests = await prisma.inspectionInterest.findMany({
      where: {
        contractor_id: contractor.id
      },
      include: {
        request: {
          include: {
            customer: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: inspectionInterests
    });

  } catch (error) {
    console.error('Error fetching inspection interests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspection interests' },
      { status: 500 }
    );
  }
}