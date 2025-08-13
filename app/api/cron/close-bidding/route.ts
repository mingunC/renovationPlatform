import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Vercel Cron Job: 매일 자정에 실행
 * BIDDING_OPEN 상태에서 7일 입찰 기간이 만료된 요청들을 
 * BIDDING_CLOSED 상태로 변경
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Job 인증 (보안)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const now = new Date()
    
    console.log(`[CRON] Closing bidding process for datetime: ${now.toISOString()}`)
    console.log(`[CRON] Checking for requests where 7-day bidding period has expired`)
    
    // 7일 경과한 입찰 요청 조회 (bidding_end_date < now)
    const requestsToClose = await prisma.renovationRequest.findMany({
      where: {
        status: 'BIDDING_OPEN',
        bidding_end_date: {
          lt: now // 현재 시간보다 이전인 경우 (7일 경과)
        }
      }
    })
    
    console.log(`[CRON] Found ${requestsToClose.length} requests to close bidding (7-day period expired)`)
    
    const results = []
    
    for (const request of requestsToClose) {
      try {
        // 상태를 BIDDING_CLOSED로 변경
        await prisma.renovationRequest.update({
          where: { id: request.id },
          data: {
            status: 'BIDDING_CLOSED'
          }
        })
        
        console.log(`[CRON] Closed bidding for request ${request.id}`)
        
        // TODO: 마감 알림 이메일 발송 (e.g., BiddingClosedEmail)
        // - 고객에게 입찰 결과 알림
        // - 받은 입찰 수 안내
        // - 업체 선택 안내
        
        results.push({
          request_id: request.id,
          status: 'success',
          message: 'Bidding closed successfully after 7-day period'
        })
        
      } catch (error) {
        console.error(`[CRON] Error processing request ${request.id}:`, error)
        results.push({
          request_id: request.id,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const summary = {
      processed: results.length,
      successful: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
    }
    
    console.log(`[CRON] Bidding close process completed:`, summary)
    
    return NextResponse.json({
      success: true,
      message: 'Bidding closed for expired requests',
      timestamp: now.toISOString(),
      summary,
      results,
    })
    
  } catch (error) {
    console.error('[CRON] Error in close-bidding process:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
