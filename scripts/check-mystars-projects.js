const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkMystarsProjects() {
  try {
    console.log('🔍 Checking mystars100826 projects...')
    
    // 1. mystars100826 사용자 찾기
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'mystars100826@gmail.com' },
          { email: { contains: 'mystars100826' } },
          { name: { contains: 'mystars100826' } }
        ]
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
    
    // 2. mystars100826이 등록한 프로젝트 찾기
    console.log('\n🔍 mystars100826이 등록한 프로젝트 찾기...')
    const projects = await prisma.renovationRequest.findMany({
      where: {
        customer_id: user.id
      },
      select: {
        id: true,
        status: true,
        category: true,
        description: true,
        created_at: true,
        address: true
      }
    })
    
    if (projects.length > 0) {
      console.log(`✅ ${projects.length}개의 프로젝트를 찾았습니다:`)
      projects.forEach((project, index) => {
        const description = project.description ? project.description.substring(0, 50) + '...' : '설명 없음'
        console.log(`  ${index + 1}. ${description}`)
        console.log(`     - Status: ${project.status}`)
        console.log(`     - Category: ${project.category}`)
        console.log(`     - Address: ${project.address}`)
        console.log(`     - Created: ${project.created_at}`)
      })
    } else {
      console.log('❌ mystars100826이 등록한 프로젝트가 없습니다.')
    }
    
    // 3. 모든 프로젝트에서 mystars100826 관련 정보 찾기
    console.log('\n🔍 모든 프로젝트에서 mystars100826 관련 정보 찾기...')
    const allProjects = await prisma.renovationRequest.findMany({
      select: {
        id: true,
        status: true,
        category: true,
        description: true,
        created_at: true,
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
    
    console.log('📋 최근 프로젝트 10개:')
    allProjects.slice(0, 10).forEach((project, index) => {
      const description = project.description ? project.description.substring(0, 50) + '...' : '설명 없음'
      console.log(`  ${index + 1}. ${description}`)
      console.log(`     - Customer: ${project.customer.name} (${project.customer.email})`)
      console.log(`     - Status: ${project.status}`)
      console.log(`     - Category: ${project.category}`)
      console.log(`     - Created: ${project.created_at}`)
    })
    
    // 4. mystars100826이 CUSTOMER로 등록되어 있는지 확인
    console.log('\n🔍 mystars100826이 CUSTOMER로 등록되어 있는지 확인...')
    const customerUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'mystars100826@gmail.com' },
          { email: { contains: 'mystars100826' } },
          { name: { contains: 'mystars100826' } }
        ],
        type: 'CUSTOMER'
      }
    })
    
    if (customerUser) {
      console.log('✅ mystars100826이 CUSTOMER로도 등록되어 있습니다:')
      console.log('  - ID:', customerUser.id)
      console.log('  - Email:', customerUser.email)
      console.log('  - Name:', customerUser.name)
      console.log('  - Type:', customerUser.type)
      
      // CUSTOMER로 등록된 mystars100826의 프로젝트 찾기
      const customerProjects = await prisma.renovationRequest.findMany({
        where: {
          customer_id: customerUser.id
        },
        select: {
          id: true,
          status: true,
          category: true,
          description: true,
          created_at: true,
          address: true
        }
      })
      
      if (customerProjects.length > 0) {
        console.log(`✅ CUSTOMER mystars100826이 등록한 프로젝트 ${customerProjects.length}개:`)
        customerProjects.forEach((project, index) => {
          const description = project.description ? project.description.substring(0, 50) + '...' : '설명 없음'
          console.log(`  ${index + 1}. ${description}`)
          console.log(`     - Status: ${project.status}`)
          console.log(`     - Category: ${project.category}`)
          console.log(`     - Address: ${project.address}`)
          console.log(`     - Created: ${project.created_at}`)
        })
      } else {
        console.log('❌ CUSTOMER mystars100826이 등록한 프로젝트가 없습니다.')
      }
    } else {
      console.log('❌ mystars100826이 CUSTOMER로 등록되어 있지 않습니다.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMystarsProjects()
