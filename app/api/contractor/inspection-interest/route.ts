import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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
    const { request_id, will_participate } = body;

    if (!request_id || will_participate === undefined) {
      return NextResponse.json(
        { error: 'Request ID and participation decision are required' },
        { status: 400 }
      );
    }

    // Verify the request exists and is in INSPECTION_SCHEDULED status
    const renovationRequest = await prisma.renovationRequest.findUnique({
      where: { id: request_id }
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
          request_id: request_id,
          contractor_id: contractor.id
        }
      },
      update: {
        will_participate: will_participate
      },
      create: {
        request_id: request_id,
        contractor_id: contractor.id,
        will_participate: will_participate
      }
    });

    return NextResponse.json({
      success: true,
      data: inspectionInterest
    });

  } catch (error) {
    console.error('Error recording inspection interest:', error);
    return NextResponse.json(
      { error: 'Failed to record inspection interest' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
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