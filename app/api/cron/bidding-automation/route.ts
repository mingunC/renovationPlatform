import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (security)
    const hdrs = await headers();
    const authHeader = hdrs.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7일 (168시간)을 밀리초로 계산
    
    console.log(`[CRON] Bidding automation process started at: ${now.toISOString()}`);
    console.log(`[CRON] 7-day bidding period: ${sevenDaysInMs}ms`);

    // 1. Start bidding for requests where inspection_date is today or earlier
    const requestsToStartBidding = await prisma.renovationRequest.findMany({
      where: {
        status: 'INSPECTION_SCHEDULED',
        inspection_date: {
          lte: now // 현장 방문일이 오늘 이전이거나 오늘인 요청들
        },
        bidding_start_date: null // 아직 입찰이 시작되지 않은 요청들
      }
    });

    console.log(`[CRON] Found ${requestsToStartBidding.length} requests to start bidding`);

    for (const request of requestsToStartBidding) {
      await prisma.renovationRequest.update({
        where: { id: request.id },
        data: {
          status: 'BIDDING_OPEN',
          bidding_start_date: now,
          bidding_end_date: new Date(now.getTime() + sevenDaysInMs) // 7일 후 자동 마감
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
      console.log(`[CRON] Bidding opened for request ${request.id}, notifying ${interestedContractors.length} contractors`);
      console.log(`[CRON] Bidding will close at: ${new Date(now.getTime() + sevenDaysInMs).toISOString()}`);
    }

    // 2. Close bidding for requests where 7-day bidding period has expired
    const requestsToCloseBidding = await prisma.renovationRequest.findMany({
      where: {
        status: 'BIDDING_OPEN',
        bidding_end_date: {
          lte: now // 7일 입찰 기간 만료
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

    console.log(`[CRON] Found ${requestsToCloseBidding.length} requests to close bidding (7-day period expired)`);

    for (const request of requestsToCloseBidding) {
      // 입찰 기간 계산
      const biddingDuration = request.bidding_end_date && request.bidding_start_date 
        ? Math.round((request.bidding_end_date.getTime() - request.bidding_start_date.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      await prisma.renovationRequest.update({
        where: { id: request.id },
        data: {
          status: 'BIDDING_CLOSED'
        }
      });

      // TODO: Send notification to customer to select a contractor
      console.log(`[CRON] Bidding closed for request ${request.id}, ${request.bids.length} bids received after ${biddingDuration} days`);
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

    console.log(`[CRON] Found ${requestsToAutoCancel.length} requests to auto-cancel`);

    for (const request of requestsToAutoCancel) {
      await prisma.renovationRequest.update({
        where: { id: request.id },
        data: {
          status: 'CLOSED'
        }
      });

      console.log(`[CRON] Auto-cancelled request ${request.id} due to no contractor selection`);
    }

    const summary = {
      bidding_started: requestsToStartBidding.length,
      bidding_closed: requestsToCloseBidding.length,
      auto_cancelled: requestsToAutoCancel.length,
      bidding_period_days: 7,
      bidding_period_ms: sevenDaysInMs,
    };

    console.log(`[CRON] Bidding automation process completed:`, summary);

    return NextResponse.json({
      success: true,
      message: 'Bidding automation completed with 7-day period',
      timestamp: now.toISOString(),
      processed: summary
    });

  } catch (error) {
    console.error('[CRON] Error in bidding automation cron:', error);
    return NextResponse.json(
      { error: 'Failed to process bidding automation' },
      { status: 500 }
    );
  }
}