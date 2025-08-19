import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerActionClient } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contractor_id } = body;

    if (!contractor_id) {
      return NextResponse.json(
        { error: 'Contractor ID is required' },
        { status: 400 }
      );
    }

    // Verify the request belongs to the current user
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: {
        id: id,
        customer_id: user.id
      },
      include: {
        bids: {
          where: {
            contractor_id: contractor_id
          }
        }
      }
    });

    if (!renovationRequest) {
      return NextResponse.json(
        { error: 'Request not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if request is in BIDDING_CLOSED status
    if (renovationRequest.status !== 'BIDDING_CLOSED') {
      return NextResponse.json(
        { error: 'Cannot select contractor until bidding is closed' },
        { status: 400 }
      );
    }

    // Check if the contractor has submitted a bid
    if (renovationRequest.bids.length === 0) {
      return NextResponse.json(
        { error: 'Selected contractor has not submitted a bid' },
        { status: 400 }
      );
    }

    // Update the request with selected contractor
    const updatedRequest = await prisma.renovationRequest.update({
      where: { id: id },
      data: {
        selected_contractor_id: contractor_id,
        status: 'CONTRACTOR_SELECTED'
      }
    });

    // Update the selected bid status
    await prisma.bid.update({
      where: {
        request_id_contractor_id: {
          request_id: id,
          contractor_id: contractor_id
        }
      },
      data: {
        status: 'ACCEPTED'
      }
    });

    // Reject all other bids
    await prisma.bid.updateMany({
      where: {
        request_id: id,
        contractor_id: {
          not: contractor_id
        }
      },
      data: {
        status: 'REJECTED'
      }
    });

    // Send notification emails
    const contractor = await prisma.contractor.findUnique({
      where: { id: contractor_id },
      include: { user: true }
    });

    if (contractor) {
      // TODO: Send acceptance email to selected contractor
      console.log(`Contractor ${contractor.business_name} selected for request ${id}`);
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error selecting contractor:', error);
    return NextResponse.json(
      { error: 'Failed to select contractor' },
      { status: 500 }
    );
  }
}