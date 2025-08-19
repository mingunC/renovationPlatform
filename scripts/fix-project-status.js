const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixProjectStatus() {
  try {
    console.log('🔍 yerin choi 프로젝트 상태 수정...')
    
    // 1. yerin choi의 프로젝트 찾기
    const project = await prisma.renovationRequest.findFirst({
      where: {
        customer: {
          name: { contains: 'yerin' }
        }
      },
      include: {
        customer: true
      }
    })
    
    if (!project) {
      console.log('❌ yerin choi의 프로젝트를 찾을 수 없습니다.')
      return
    }
    
    console.log('✅ 프로젝트 정보:')
    console.log('  - ID:', project.id)
    console.log('  - Status:', project.status)
    console.log('  - Category:', project.category)
    console.log('  - Customer:', project.customer.name)
    console.log('  - Description:', project.description ? project.description.substring(0, 50) + '...' : '설명 없음')
    
    if (project.status === 'INSPECTION_SCHEDULED') {
      // 2. 프로젝트 상태를 INSPECTION_PENDING으로 변경
      console.log('\n🔄 프로젝트 상태를 INSPECTION_PENDING으로 변경...')
      const updatedProject = await prisma.renovationRequest.update({
        where: { id: project.id },
        data: { 
          status: 'INSPECTION_PENDING',
          inspection_date: null,
          bidding_start_date: null,
          bidding_end_date: null
        }
      })
      
      console.log('✅ 프로젝트 상태 변경 완료:')
      console.log('  - ID:', updatedProject.id)
      console.log('  - Status:', updatedProject.status)
      console.log('  - Inspection Date:', updatedProject.inspection_date)
      console.log('  - Bidding Start Date:', updatedProject.bidding_start_date)
      console.log('  - Bidding End Date:', updatedProject.bidding_end_date)
      
      console.log('\n🎉 이제 프로젝트가 "새요청" 탭에 표시됩니다!')
    } else {
      console.log('⚠️ 프로젝트가 이미 INSPECTION_SCHEDULED 상태가 아닙니다.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProjectStatus()
