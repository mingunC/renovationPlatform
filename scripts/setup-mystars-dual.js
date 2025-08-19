const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupMystarsDual() {
  try {
    console.log('🔍 mystars100826을 CONTRACTOR + CUSTOMER로 설정...')
    
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
    
    console.log('✅ 현재 사용자 정보:')
    console.log('  - ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Name:', user.name)
    console.log('  - Type:', user.type)
    
    // 2. 사용자 타입을 CUSTOMER로 변경 (프로젝트 등록을 위해)
    console.log('\n🔄 사용자 타입을 CUSTOMER로 변경...')
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { type: 'CUSTOMER' }
    })
    
    console.log('✅ 사용자 타입 변경 완료:')
    console.log('  - ID:', updatedUser.id)
    console.log('  - Email:', updatedUser.email)
    console.log('  - Name:', updatedUser.name)
    console.log('  - Type:', updatedUser.type)
    
    // 3. CONTRACTOR 프로필 생성 (업체 기능을 위해)
    console.log('\n👷 CONTRACTOR 프로필 생성...')
    const contractor = await prisma.contractor.create({
      data: {
        user_id: user.id,
        business_name: 'mystars100826 업체',
        phone: '',
        service_areas: ['서울', '경기'],
        categories: ['KITCHEN', 'BATHROOM'],
        profile_completed: true,
        insurance_verified: false,
        wsib_verified: false
      }
    })
    
    console.log('✅ CONTRACTOR 프로필 생성 완료:')
    console.log('  - ID:', contractor.id)
    console.log('  - Business Name:', contractor.business_name)
    console.log('  - Service Areas:', contractor.service_areas)
    console.log('  - Categories:', contractor.categories)
    
    // 4. 최종 확인
    console.log('\n🔍 최종 확인...')
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        contractor: true
      }
    })
    
    console.log('✅ 최종 사용자 정보:')
    console.log('  - ID:', finalUser.id)
    console.log('  - Email:', finalUser.email)
    console.log('  - Name:', finalUser.name)
    console.log('  - Type:', finalUser.type)
    
    if (finalUser.contractor) {
      console.log('✅ CONTRACTOR 프로필:')
      console.log('  - Business Name:', finalUser.contractor.business_name)
      console.log('  - Service Areas:', finalUser.contractor.service_areas)
      console.log('  - Categories:', finalUser.contractor.categories)
      console.log('  - Profile Completed:', finalUser.contractor.profile_completed)
    }
    
    console.log('\n🎉 mystars100826이 CONTRACTOR + CUSTOMER로 설정되었습니다!')
    console.log('이제 다음이 가능합니다:')
    console.log('  - CUSTOMER: 프로젝트 등록 및 관리')
    console.log('  - CONTRACTOR: 다른 고객의 프로젝트에 입찰')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupMystarsDual()
