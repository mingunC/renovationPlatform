import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Vercel Cron Job: 매일 자정에 실행
 * INSPECTION_SCHEDULED 상태에서 현장 방문일이 오늘인 요청들을 
 * BIDDING_OPEN 상태로 변경하고 7일 후 자동 마감 설정
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
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000 // 7일 (168시간)을 밀리초로 계산
    
    console.log(`[CRON] Starting bidding process at: ${now.toISOString()}`)
    console.log(`[CRON] 7-day bidding period: ${sevenDaysInMs}ms`)
    
    // 오늘 현장 방문 예정이고 INSPECTION_SCHEDULED 상태인 요청들 조회
    const requestsToStart = await prisma.renovationRequest.findMany({
      where: {
        status: 'INSPECTION_SCHEDULED',
        inspection_date: {
          lte: now, // 현장 방문일이 오늘 이전이거나 오늘인 요청들
        },
        bidding_start_date: null, // 아직 입찰이 시작되지 않은 요청들
      },
      include: {
        customer: true,
        inspection_interests: {
          where: {
            will_participate: true, // 참여 의사를 표시한 업체들만
          },
          include: {
            contractor: {
              include: {
                user: true,
              }
            }
          }
        }
      }
    })
    
    console.log(`[CRON] Found ${requestsToStart.length} requests to start bidding`)
    
    const results = []
    
    for (const request of requestsToStart) {
      try {
        // 참여 업체가 있는 경우에만 입찰 시작
        if (request.inspection_interests.length > 0) {
          // 상태를 BIDDING_OPEN으로 변경하고 7일 후 마감일 설정
          const updatedRequest = await prisma.renovationRequest.update({
            where: { id: request.id },
            data: {
              status: 'BIDDING_OPEN',
              bidding_start_date: now,
              bidding_end_date: new Date(now.getTime() + sevenDaysInMs) // 7일 후 자동 설정
            }
          })
          
          console.log(`[CRON] Started bidding for request ${request.id}`)
          console.log(`[CRON] Bidding will close at: ${new Date(now.getTime() + sevenDaysInMs).toISOString()}`)
          
          // TODO: 참여 업체들에게 입찰 시작 이메일 발송 (BiddingStartedEmail)
          // request.inspection_interests.forEach(interest => {
          //   sendBiddingStartedEmail(interest.contractor.user.email, request)
          // })
          
          results.push({
            request_id: request.id,
            status: 'success',
            participating_contractors: request.inspection_interests.length,
            bidding_start_date: now.toISOString(),
            bidding_end_date: new Date(now.getTime() + sevenDaysInMs).toISOString(),
            message: 'Bidding started successfully with 7-day period'
          })
        } else {
          // 참여 업체가 없는 경우 CLOSED로 변경
          await prisma.renovationRequest.update({
            where: { id: request.id },
            data: {
              status: 'CLOSED',
            }
          })
          
          console.log(`[CRON] Closed request ${request.id} - no participating contractors`)
          
          results.push({
            request_id: request.id,
            status: 'closed',
            participating_contractors: 0,
            message: 'No participating contractors - request closed'
          })
        }
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
      closed: results.filter(r => r.status === 'closed').length,
      errors: results.filter(r => r.status === 'error').length,
      bidding_period_days: 7,
      bidding_period_ms: sevenDaysInMs,
    }
    
    console.log(`[CRON] Bidding start process completed:`, summary)
    
    return NextResponse.json({
      success: true,
      message: 'Bidding start process completed with 7-day period',
      timestamp: now.toISOString(),
      summary,
      results,
    })
    
  } catch (error) {
    console.error('[CRON] Error in start-bidding process:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
