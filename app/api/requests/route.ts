// app/api/requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerActionClient } from '@/lib/supabase-server';
import { z } from 'zod';

// 프로젝트 생성 스키마
const createProjectSchema = z.object({
  category: z.enum(['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING', 'OTHER']),
  budget_range: z.enum(['UNDER_50K', 'RANGE_50_100K', 'OVER_100K']),
  postal_code: z.string().min(1),
  address: z.string().min(1),
  description: z.string().min(10),
  // 고객이 제시한 가능한 날짜들
  available_dates: z.array(z.string()).optional(),
  available_time_slots: z.array(z.object({
    start: z.string(),
    end: z.string(),
    preferred: z.boolean().optional()
  })).optional(),
  flexible_schedule: z.boolean().optional(),
  additional_notes: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating new renovation request');
    
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);
    
    // 사용자 인증
    const supabase = await createServerActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 고객 프로필 확인 또는 생성
    let customer = await prisma.customer.findUnique({
      where: { user_id: user.id }
    });

    if (!customer) {
      // 고객 프로필 자동 생성
      customer = await prisma.customer.create({
        data: {
          user_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Customer',
          email: user.email || '',
          phone: user.user_metadata?.phone || ''
        }
      });
      console.log('✅ Auto-created customer profile:', customer.id);
    }

    // 가능한 시간 정보 구조화
    const availabilityData = {
      dates: validatedData.available_dates || [],
      timeSlots: validatedData.available_time_slots || [],
      flexibleSchedule: validatedData.flexible_schedule || false,
      notes: validatedData.additional_notes || ''
    };

    // 프로젝트 생성 (트랜잭션 사용)
    const renovationRequest = await prisma.$transaction(async (tx) => {
      // 1. RenovationRequest 생성 - 명시적으로 OPEN 상태로
      const request = await tx.renovationRequest.create({
        data: {
          customer_id: customer.id,
          category: validatedData.category,
          budget_range: validatedData.budget_range,
          postal_code: validatedData.postal_code,
          address: validatedData.address,
          description: validatedData.description,
          status: 'OPEN', // 명시적으로 OPEN 상태 설정!
          available_dates: availabilityData, // JSON으로 저장
          created_at: new Date(),
          updated_at: new Date()
        },
        include: {
          customer: true
        }
      });

      console.log('✅ Created renovation request with status:', request.status);

      // 2. 알림 데이터 준비 (실제 구현 시)
      // TODO: 업체들에게 새 프로젝트 알림 발송
      // const contractors = await tx.contractor.findMany({
      //   where: {
      //     service_categories: {
      //       has: validatedData.category
      //     },
      //     service_areas: {
      //       has: validatedData.postal_code.substring(0, 3) // FSA 기준
      //     }
      //   }
      // });

      return request;
    });

    // 응답
    return NextResponse.json({
      success: true,
      message: '견적 요청이 성공적으로 등록되었습니다.',
      data: {
        id: renovationRequest.id,
        status: renovationRequest.status,
        category: renovationRequest.status,
        budget_range: renovationRequest.budget_range,
        address: renovationRequest.address,
        created_at: renovationRequest.created_at,
        customer: {
          name: renovationRequest.customer.name,
          email: renovationRequest.customer.email
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// GET: 프로젝트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    
    // 필터 조건 구성
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    // 프로젝트 조회
    const requests = await prisma.renovationRequest.findMany({
      where,
      include: {
        customer: true,
        _count: {
          select: {
            inspection_interests: {
              where: {
                will_participate: true
              }
            },
            bids: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: requests,
      total: requests.length
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}