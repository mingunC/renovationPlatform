const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkContractorDashboard() {
  try {
    console.log('🔍 CONTRACTOR mystars100826 대시보드 확인...')
    
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
        contractor: true
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
    
    if (!user.contractor) {
      console.log('❌ CONTRACTOR 프로필이 없습니다.')
      return
    }
    
    console.log('✅ CONTRACTOR 프로필:')
    console.log('  - Business Name:', user.contractor.business_name)
    console.log('  - Service Areas:', user.contractor.service_areas)
    console.log('  - Categories:', user.contractor.categories)
    
    // 2. 모든 프로젝트 확인
    console.log('\n🔍 모든 프로젝트 확인...')
    const allProjects = await prisma.renovationRequest.findMany({
      select: {
        id: true,
        status: true,
        category: true,
        description: true,
        created_at: true,
        address: true,
        postal_code: true,
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
    
    console.log(`📊 총 프로젝트 수: ${allProjects.length}개`)
    
    // 3. 상태별 프로젝트 분류
    const statusGroups = {}
    allProjects.forEach(project => {
      if (!statusGroups[project.status]) {
        statusGroups[project.status] = []
      }
      statusGroups[project.status].push(project)
    })
    
    console.log('\n📋 상태별 프로젝트:')
    Object.entries(statusGroups).forEach(([status, projects]) => {
      console.log(`  - ${status}: ${projects.length}개`)
      projects.forEach((project, index) => {
        const description = project.description ? project.description.substring(0, 50) + '...' : '설명 없음'
        console.log(`    ${index + 1}. ${description}`)
        console.log(`       - Customer: ${project.customer.name}`)
        console.log(`       - Category: ${project.category}`)
        console.log(`       - Address: ${project.address}`)
        console.log(`       - Postal Code: ${project.postal_code}`)
      })
    })
    
    // 4. "새요청" 탭에 표시되어야 할 프로젝트들
    console.log('\n🔍 "새요청" 탭에 표시되어야 할 프로젝트들:')
    const newRequestProjects = allProjects.filter(project => 
      ['OPEN', 'INSPECTION_PENDING'].includes(project.status)
    )
    
    if (newRequestProjects.length > 0) {
      console.log(`✅ ${newRequestProjects.length}개의 프로젝트가 "새요청" 탭에 표시되어야 합니다:`)
      newRequestProjects.forEach((project, index) => {
        const description = project.description ? project.description.substring(0, 50) + '...' : '설명 없음'
        console.log(`  ${index + 1}. ${description}`)
        console.log(`     - Status: ${project.status}`)
        console.log(`     - Customer: ${project.customer.name}`)
        console.log(`     - Category: ${project.category}`)
        console.log(`     - Address: ${project.address}`)
      })
    } else {
      console.log('❌ "새요청" 탭에 표시할 프로젝트가 없습니다.')
    }
    
    // 5. mystars100826의 서비스 지역과 카테고리와 매칭되는 프로젝트
    console.log('\n🔍 mystars100826과 매칭되는 프로젝트들:')
    const matchingProjects = allProjects.filter(project => {
      // 서비스 지역 매칭 (우편번호 앞 3자리)
      const projectFSA = project.postal_code.substring(0, 3)
      const hasMatchingArea = user.contractor.service_areas.some(area => 
        area.includes(projectFSA) || projectFSA.includes(area)
      )
      
      // 카테고리 매칭
      const hasMatchingCategory = user.contractor.categories.includes(project.category)
      
      return hasMatchingArea && hasMatchingCategory
    })
    
    if (matchingProjects.length > 0) {
      console.log(`✅ ${matchingProjects.length}개의 프로젝트가 mystars100826과 매칭됩니다:`)
      matchingProjects.forEach((project, index) => {
        const description = project.description ? project.description.substring(0, 50) + '...' : '설명 없음'
        console.log(`  ${index + 1}. ${description}`)
        console.log(`     - Status: ${project.status}`)
        console.log(`     - Customer: ${project.customer.name}`)
        console.log(`     - Category: ${project.category}`)
        console.log(`     - Address: ${project.address}`)
        console.log(`     - Postal Code: ${project.postal_code}`)
      })
    } else {
      console.log('❌ mystars100826과 매칭되는 프로젝트가 없습니다.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkContractorDashboard()
