import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Vercel Cron Job: 매일 자정에 실행
 * BIDDING_OPEN 상태에서 입찰 마감일이 지난 요청들을 
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
    
    // 입찰 마감일이 지나고 BIDDING_OPEN 상태인 요청들 조회
    const requestsToClose = await prisma.renovationRequest.findMany({
      where: {
        status: 'BIDDING_OPEN',
        bidding_end_date: {
          lt: now, // 현재 시간보다 이전
        }
      },
      include: {
        customer: true,
        bids: {
          where: {
            status: 'PENDING',
          },
          include: {
            contractor: {
              include: {
                user: true,
              }
            }
          },
          orderBy: {
            total_amount: 'asc', // 가격 순 정렬
          }
        }
      }
    })
    
    console.log(`[CRON] Found ${requestsToClose.length} requests to close bidding`)
    
    const results = []
    
    for (const request of requestsToClose) {
      try {
        // 상태를 BIDDING_CLOSED로 변경
        const updatedRequest = await prisma.renovationRequest.update({
          where: { id: request.id },
          data: {
            status: 'BIDDING_CLOSED',
          }
        })
        
        console.log(`[CRON] Closed bidding for request ${request.id} - ${request.bids.length} bids received`)
        
        // TODO: 고객에게 입찰 결과 이메일 발송
        // - 받은 입찰 수
        // - 비교하여 업체 선택할 수 있다는 안내
        // - 대시보드 링크
        
        results.push({
          request_id: request.id,
          status: 'success',
          bids_received: request.bids.length,
          message: 'Bidding closed successfully'
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
      total_bids: results.reduce((sum, r) => sum + (r.bids_received || 0), 0),
    }
    
    console.log(`[CRON] Bidding close process completed:`, summary)
    
    return NextResponse.json({
      success: true,
      message: 'Bidding close process completed',
      timestamp: new Date().toISOString(),
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
