import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET: 현장방문 일정 확정이 필요한 요청들 조회
export async function GET(request: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    
    // 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 사용자 역할 확인 (users 테이블에서 type 필드 사용)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('type')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile || userProfile.type !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 쿼리 파라미터에서 status 확인
    const { searchParams } = new URL(request.url);
    const requestedStatus = searchParams.get('status');
    
    console.log('Requested status filter:', requestedStatus);

    // 현장방문 일정 확정이 필요한 요청들 조회
    // 기본적으로 INSPECTION_PENDING, INSPECTION_SCHEDULED, OPEN 상태의 프로젝트들
    let whereCondition: any = {};

    // status 필터가 있으면 적용
    if (requestedStatus && requestedStatus !== 'all') {
      whereCondition.status = requestedStatus;
    } else {
      // 기본값: INSPECTION_PENDING, INSPECTION_SCHEDULED, OPEN 상태
      whereCondition.status = {
        in: ['INSPECTION_PENDING', 'INSPECTION_SCHEDULED', 'OPEN']
      };
    }

    const pendingRequests = await prisma.renovationRequest.findMany({
      where: whereCondition,
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        },
        inspection_interests: {
          include: {
            contractor: {
              select: {
                business_name: true
              }
            }
          }
        },
        _count: {
          select: {
            inspection_interests: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // 응답 데이터 구조화
    const formattedRequests = pendingRequests.map(request => ({
      id: request.id,
      category: request.category,
      property_type: request.property_type || 'Unknown',
      budget_range: request.budget_range,
      timeline: request.timeline || 'Unknown',
      address: request.address,
      postal_code: request.postal_code,
      description: request.description,
      status: request.status,
      created_at: request.created_at.toISOString(),
      inspection_date: request.inspection_date?.toISOString(),
      inspection_time: request.inspection_time,
      inspection_notes: request.inspection_notes,
      customer: {
        name: request.customer.name,
        email: request.customer.email
      },
      inspection_interests: request.inspection_interests.map(interest => ({
        contractor: {
          user: {
            name: 'Unknown' // contractor.user.name이 없으므로 기본값 설정
          },
          company_name: interest.contractor.business_name
        },
        will_participate: interest.will_participate,
        created_at: interest.created_at.toISOString()
      })),
      _count: {
        bids: request._count.inspection_interests
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      total: formattedRequests.length
    });

  } catch (error) {
    console.error('Error fetching pending inspection requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspection requests' },
      { status: 500 }
    );
  }
}

// POST: 현장방문 일정 확정
export async function POST(request: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    
    // 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 사용자 역할 확인 (users 테이블에서 type 필드 사용)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('type')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile || userProfile.type !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { request_id, inspection_date, inspection_time, notes, notify_contractors } = body;

    if (!request_id || !inspection_date) {
      return NextResponse.json(
        { error: 'Request ID and inspection date are required' },
        { status: 400 }
      );
    }

    // 요청 상태를 INSPECTION_SCHEDULED로 변경
    const updatedRequest = await prisma.renovationRequest.update({
      where: { id: request_id },
      data: {
        status: 'INSPECTION_SCHEDULED',
        inspection_date: new Date(inspection_date),
        inspection_time: inspection_time || null,
        inspection_notes: notes || null,
        updated_at: new Date()
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
      }
    });

    // TODO: 참여 업체들에게 알림 발송 (이메일, SMS 등)
    if (notify_contractors) {
      console.log(`📧 Notifying ${updatedRequest.inspection_interests.length} contractors about scheduled inspection`);
      // 실제 알림 발송 로직 구현 필요
    }

    return NextResponse.json({
      success: true,
      message: '현장방문 일정이 성공적으로 확정되었습니다.',
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        inspection_date: updatedRequest.inspection_date,
        customer_name: updatedRequest.customer.name,
        participant_count: updatedRequest.inspection_interests.length
      }
    });

  } catch (error) {
    console.error('Error scheduling inspection:', error);
    return NextResponse.json(
      { error: 'Failed to schedule inspection' },
      { status: 500 }
    );
  }
}
