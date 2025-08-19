const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkMystarsUser() {
  try {
    console.log('🔍 Checking mystars100826 user...')
    
    // 1. mystars100826 사용자 찾기
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'mystars100826@gmail.com' },
          { email: { contains: 'mystars100826' } },
          { name: { contains: 'mystars100826' } }
        ]
      },
      include: {
        contractor: true,
        renovation_requests: true
      }
    })
    
    if (!user) {
      console.log('❌ mystars100826 사용자를 찾을 수 없습니다.')
      return
    }
    
    console.log('✅ 사용자 정보:')
    console.log('  - ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Name:', user.name)
    console.log('  - Type:', user.type)
    console.log('  - Created:', user.created_at)
    
    if (user.contractor) {
      console.log('✅ 업체 프로필:')
      console.log('  - Business Name:', user.contractor.business_name)
      console.log('  - Service Areas:', user.contractor.service_areas)
      console.log('  - Categories:', user.contractor.categories)
      console.log('  - Profile Completed:', user.contractor.profile_completed)
    } else {
      console.log('❌ 업체 프로필이 없습니다.')
    }
    
    if (user.renovation_requests && user.renovation_requests.length > 0) {
      console.log('✅ 등록된 프로젝트:')
      user.renovation_requests.forEach((request, index) => {
        console.log(`  ${index + 1}. ${request.title || '제목 없음'}`)
        console.log(`     - Status: ${request.status}`)
        console.log(`     - Category: ${request.category}`)
        console.log(`     - Created: ${request.created_at}`)
      })
    } else {
      console.log('❌ 등록된 프로젝트가 없습니다.')
    }
    
    // 2. 모든 프로젝트 상태 확인
    console.log('\n🔍 모든 프로젝트 상태 확인...')
    const allRequests = await prisma.renovationRequest.findMany({
      select: {
        id: true,
        status: true,
        category: true,
        created_at: true,
        description: true,
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    
    console.log('📊 프로젝트 상태별 개수:')
    const statusCounts = {}
    allRequests.forEach(request => {
      statusCounts[request.status] = (statusCounts[request.status] || 0) + 1
    })
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}개`)
    })
    
    console.log('\n📋 최근 프로젝트 10개:')
    allRequests.slice(0, 10).forEach((request, index) => {
      const description = request.description ? request.description.substring(0, 50) + '...' : '설명 없음'
      console.log(`  ${index + 1}. ${description} (${request.customer.name})`)
      console.log(`     - Status: ${request.status}`)
      console.log(`     - Category: ${request.category}`)
      console.log(`     - Created: ${request.created_at}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMystarsUser()
