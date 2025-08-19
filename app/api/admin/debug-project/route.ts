import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    console.log(`=== DEBUG PROJECT ${projectId} ===`);

    // 프로젝트 기본 정보 조회
    const project = await prisma.renovationRequest.findUnique({
      where: { id: projectId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            bids: true
          }
        },
        inspection_interests: {
          include: {
            contractor: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log('Project found:', {
      id: project.id,
      status: project.status,
      inspection_date: project.inspection_date,
      inspection_interests_count: project.inspection_interests.length
    });

    // 모든 업체 정보 조회
    const allContractors = await prisma.contractor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('All contractors:', allContractors.map(c => ({
      id: c.id,
      user_id: c.user_id,
      user_name: c.user.name,
      user_email: c.user.email
    })));

    // 해당 프로젝트에 대한 모든 inspection_interest 조회
    const allInterests = await prisma.inspectionInterest.findMany({
      where: { request_id: projectId },
      include: {
        contractor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log('All inspection interests for this project:', allInterests.map(i => ({
      id: i.id,
      contractor_id: i.contractor_id,
      contractor_name: i.contractor.user.name,
      contractor_email: i.contractor.user.email,
      will_participate: i.will_participate,
      created_at: i.created_at
    })));

    const debugInfo = {
      project: {
        id: project.id,
        status: project.status,
        inspection_date: project.inspection_date,
        created_at: project.created_at,
        customer: project.customer,
        bids_count: project._count.bids
      },
      inspection_interests: allInterests,
      all_contractors: allContractors,
      summary: {
        total_contractors: allContractors.length,
        total_interests: allInterests.length,
        participating_contractors: allInterests.filter(i => i.will_participate).length,
        non_participating_contractors: allInterests.filter(i => !i.will_participate).length
      }
    };

    console.log('Debug info summary:', debugInfo.summary);

    return NextResponse.json({
      success: true,
      debug_info: debugInfo
    });

  } catch (error) {
    console.error('Debug project error:', error);
    return NextResponse.json(
      { error: 'Failed to debug project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
