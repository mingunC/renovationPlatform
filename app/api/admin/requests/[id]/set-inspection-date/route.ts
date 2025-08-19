import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin session from cookie (same as other admin APIs)
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession) {
      return NextResponse.json(
        { error: 'No admin session found' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: adminSession.value }
    });

    if (!dbUser || dbUser.type !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = await params;
    const { inspection_date, notes } = body;

    if (!inspection_date) {
      return NextResponse.json(
        { error: 'Inspection date is required' },
        { status: 400 }
      );
    }

    const inspectionDate = new Date(inspection_date);
    
    // Update the renovation request
    const updatedRequest = await prisma.renovationRequest.update({
      where: { id },
      data: {
        inspection_date: inspectionDate,
        inspection_time: null, // 시간 설정 기능 제거
        inspection_notes: notes || null,
        status: 'INSPECTION_SCHEDULED',
        // Bidding starts at midnight on inspection date
        bidding_start_date: inspectionDate,
        // Bidding ends 7 days later
        bidding_end_date: new Date(inspectionDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      include: {
        customer: true
      }
    });

    // Get all contractors in the service area
    const contractors = await prisma.contractor.findMany({
      where: {
        service_areas: {
          has: updatedRequest.postal_code.substring(0, 3) // Match FSA
        },
        categories: {
          hasSome: [updatedRequest.category]
        },
        profile_completed: true
      },
      include: {
        user: true
      }
    });

    // Send email notifications to all matching contractors
    for (const contractor of contractors) {
      await emailService.sendNewRequestEmail(
        contractor.user.email,
        contractor.business_name || contractor.user.name,
        {
          id: updatedRequest.id,
          category: updatedRequest.category,
          budget_range: updatedRequest.budget_range,
          timeline: updatedRequest.timeline,
          postal_code: updatedRequest.postal_code,
          address: updatedRequest.address,
          description: updatedRequest.description,
          created_at: updatedRequest.created_at,
          customer: { name: updatedRequest.customer.name }
        }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error setting inspection date:', error);
    return NextResponse.json(
      { error: 'Failed to set inspection date' },
      { status: 500 }
    );
  }
}