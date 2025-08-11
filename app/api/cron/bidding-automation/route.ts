import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (security)
    const authHeader = headers().get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Start bidding for requests where inspection_date is today
    const requestsToStartBidding = await prisma.renovationRequest.findMany({
      where: {
        status: 'INSPECTION_SCHEDULED',
        inspection_date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    for (const request of requestsToStartBidding) {
      await prisma.renovationRequest.update({
        where: { id: request.id },
        data: {
          status: 'BIDDING_OPEN',
          bidding_start_date: now
        }
      });

      // Send notification emails to contractors who indicated participation
      const interestedContractors = await prisma.inspectionInterest.findMany({
        where: {
          request_id: request.id,
          will_participate: true
        },
        include: {
          contractor: {
            include: {
              user: true
            }
          }
        }
      });

      // TODO: Send bidding open notification emails
      console.log(`Bidding opened for request ${request.id}, notifying ${interestedContractors.length} contractors`);
    }

    // 2. Close bidding for requests where bidding_end_date has passed
    const requestsToCloseBidding = await prisma.renovationRequest.findMany({
      where: {
        status: 'BIDDING_OPEN',
        bidding_end_date: {
          lte: now
        }
      },
      include: {
        customer: true,
        bids: {
          include: {
            contractor: true
          }
        }
      }
    });

    for (const request of requestsToCloseBidding) {
      await prisma.renovationRequest.update({
        where: { id: request.id },
        data: {
          status: 'BIDDING_CLOSED'
        }
      });

      // TODO: Send notification to customer to select a contractor
      console.log(`Bidding closed for request ${request.id}, ${request.bids.length} bids received`);
    }

    // 3. Auto-cancel requests where customer didn't select contractor within 24 hours
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const requestsToAutoCancel = await prisma.renovationRequest.findMany({
      where: {
        status: 'BIDDING_CLOSED',
        bidding_end_date: {
          lte: oneDayAgo
        },
        selected_contractor_id: null
      }
    });

    for (const request of requestsToAutoCancel) {
      await prisma.renovationRequest.update({
        where: { id: request.id },
        data: {
          status: 'CLOSED'
        }
      });

      console.log(`Auto-cancelled request ${request.id} due to no contractor selection`);
    }

    return NextResponse.json({
      success: true,
      processed: {
        bidding_started: requestsToStartBidding.length,
        bidding_closed: requestsToCloseBidding.length,
        auto_cancelled: requestsToAutoCancel.length
      }
    });

  } catch (error) {
    console.error('Error in bidding automation cron:', error);
    return NextResponse.json(
      { error: 'Failed to process bidding automation' },
      { status: 500 }
    );
  }
}