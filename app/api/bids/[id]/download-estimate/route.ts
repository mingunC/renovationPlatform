import { NextRequest } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync, createReadStream } from 'fs'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 사용자 인증
    const user = await getCurrentUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 2. 견적서 조회 및 권한 확인
    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      include: { 
        request: { include: { customer: true } },
        contractor: { include: { user: true } }
      }
    })

    if (!bid?.estimate_file_url) {
      return new Response('File not found', { status: 404 })
    }

    // 3. 접근 권한 확인 (고객 또는 해당 업체만)
    const isCustomer = bid.request.customer.id === user.id
    const isContractor = bid.contractor.user.id === user.id
    
    if (!isCustomer && !isContractor) {
      return new Response('Access denied', { status: 403 })
    }

    // 4. 파일 다운로드
    const filePath = join(process.cwd(), 'public', bid.estimate_file_url)
    
    if (!existsSync(filePath)) {
      return new Response('File not found on server', { status: 404 })
    }

    // 5. 파일 정보 조회
    const fileStats = await stat(filePath)
    const fileName = `견적서_${bid.contractor.user.name}_${bid.request.title.substring(0, 20)}.pdf`

    // 6. 파일 스트림 생성 및 응답
    const fileStream = createReadStream(filePath)
    
    return new Response(fileStream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileStats.size.toString(),
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return new Response('Download failed', { status: 500 })
  }
}
