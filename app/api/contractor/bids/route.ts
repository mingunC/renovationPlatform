import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase';

// Enhanced bid submission with inspection participation check
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      request_id,
      labor_cost,
      material_cost,
      permit_cost,
      disposal_cost,
      timeline_weeks,
      start_date,
      included_items,
      excluded_items,
      notes
    } = body;

    // Check if the request exists and is in BIDDING_OPEN status
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: { id: request_id }
    });

    if (!renovationRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (renovationRequest.status !== 'BIDDING_OPEN') {
      return NextResponse.json(
        { error: 'Bidding is not open for this request' },
        { status: 400 }
      );
    }

    // NEW: Check if contractor participated in inspection
    const inspectionInterest = await prisma.inspectionInterest.findUnique({
      where: {
        request_id_contractor_id: {
          request_id: request_id,
          contractor_id: contractor.id
        }
      }
    });

    if (!inspectionInterest || !inspectionInterest.will_participate) {
      return NextResponse.json(
        { error: 'You must participate in the site inspection to submit a bid' },
        { status: 403 }
      );
    }

    // Calculate total amount
    const total_amount = 
      parseFloat(labor_cost) + 
      parseFloat(material_cost) + 
      parseFloat(permit_cost || 0) + 
      parseFloat(disposal_cost || 0);

    // Create or update bid
    const bid = await prisma.bid.upsert({
      where: {
        request_id_contractor_id: {
          request_id: request_id,
          contractor_id: contractor.id
        }
      },
      update: {
        labor_cost,
        material_cost,
        permit_cost: permit_cost || 0,
        disposal_cost: disposal_cost || 0,
        total_amount,
        timeline_weeks,
        start_date: start_date ? new Date(start_date) : null,
        included_items,
        excluded_items,
        notes
      },
      create: {
        request_id,
        contractor_id: contractor.id,
        labor_cost,
        material_cost,
        permit_cost: permit_cost || 0,
        disposal_cost: disposal_cost || 0,
        total_amount,
        timeline_weeks,
        start_date: start_date ? new Date(start_date) : null,
        included_items,
        excluded_items,
        notes
      }
    });

    return NextResponse.json({
      success: true,
      data: bid
    });

  } catch (error) {
    console.error('Error submitting bid:', error);
    return NextResponse.json(
      { error: 'Failed to submit bid' },
      { status: 500 }
    );
  }
}

// Get bids for the current contractor with inspection participation info
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

    const contractor = await prisma.contractor.findUnique({
      where: { user_id: user.id }
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      );
    }

    // Get all bids with related inspection participation
    const bids = await prisma.bid.findMany({
      where: {
        contractor_id: contractor.id
      },
      include: {
        request: {
          include: {
            customer: true,
            inspection_interests: {
              where: {
                contractor_id: contractor.id
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: bids
    });

  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}