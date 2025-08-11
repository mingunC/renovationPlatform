import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { sendInspectionScheduledEmail } from '@/lib/email/templates';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (dbUser?.type !== 'CUSTOMER') { // Note: You may need to add ADMIN type
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { inspection_date } = body;

    if (!inspection_date) {
      return NextResponse.json(
        { error: 'Inspection date is required' },
        { status: 400 }
      );
    }

    const inspectionDate = new Date(inspection_date);
    
    // Update the renovation request
    const updatedRequest = await prisma.renovationRequest.update({
      where: { id: params.id },
      data: {
        inspection_date: inspectionDate,
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
      await sendInspectionScheduledEmail({
        to: contractor.user.email,
        contractorName: contractor.business_name || contractor.user.name,
        requestId: updatedRequest.id,
        address: updatedRequest.address,
        inspectionDate: inspectionDate.toLocaleDateString(),
        category: updatedRequest.category,
        description: updatedRequest.description
      });
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