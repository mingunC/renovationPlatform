const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCurrentData() {
  try {
    console.log('🔍 Checking current database state...')
    
    // 모든 요청 조회
    const allRequests = await prisma.renovationRequest.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            bids: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    
    console.log(`\n📊 Total requests: ${allRequests.length}`)
    
    if (allRequests.length > 0) {
      console.log('\n📋 All requests:')
      allRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.customer.name} - ${req.category} (${req.status}) - ${req.created_at}`)
      })
    }
    
    // 상태별 요청 수
    const statusCounts = {}
    allRequests.forEach(req => {
      statusCounts[req.status] = (statusCounts[req.status] || 0) + 1
    })
    
    console.log('\n📈 Status breakdown:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })
    
    // yerin choi의 프로젝트 확인
    const yerinRequests = allRequests.filter(req => 
      req.customer.email === 'micks1@me.com'
    )
    
    console.log(`\n👤 Yerin Choi requests: ${yerinRequests.length}`)
    if (yerinRequests.length > 0) {
      yerinRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.category} - ${req.status} - ${req.created_at}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentData()
