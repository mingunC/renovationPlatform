const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔍 mingun.ryan.choi@gmail.com을 관리자로 변경...')
    
    // 1. mingun.ryan.choi@gmail.com 사용자 찾기
    const user = await prisma.user.findUnique({
      where: {
        email: 'mingun.ryan.choi@gmail.com'
      }
    })
    
    if (!user) {
      console.log('❌ mingun.ryan.choi@gmail.com 사용자를 찾을 수 없습니다.')
      return
    }
    
    console.log('✅ 현재 사용자 정보:')
    console.log('  - ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Name:', user.name)
    console.log('  - Type:', user.type)
    console.log('  - Created:', user.created_at)
    
    // 2. 사용자 타입을 ADMIN으로 변경
    console.log('\n🔄 사용자 타입을 ADMIN으로 변경...')
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { type: 'ADMIN' }
    })
    
    console.log('✅ 사용자 타입 변경 완료:')
    console.log('  - ID:', updatedUser.id)
    console.log('  - Email:', updatedUser.email)
    console.log('  - Name:', updatedUser.name)
    console.log('  - Type:', updatedUser.type)
    
    // 3. CONTRACTOR 프로필이 있다면 유지 (관리자도 업체 기능 사용 가능)
    console.log('\n🔍 CONTRACTOR 프로필 확인...')
    const contractor = await prisma.contractor.findUnique({
      where: { user_id: user.id }
    })
    
    if (contractor) {
      console.log('✅ CONTRACTOR 프로필이 유지됩니다:')
      console.log('  - Business Name:', contractor.business_name)
      console.log('  - Service Areas:', contractor.service_areas)
      console.log('  - Categories:', contractor.categories)
    } else {
      console.log('⚠️ CONTRACTOR 프로필이 없습니다.')
    }
    
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
    }
    
    console.log('\n🎉 mingun.ryan.choi@gmail.com이 관리자로 설정되었습니다!')
    console.log('이제 다음이 가능합니다:')
    console.log('  - 관리자 대시보드 접근')
    console.log('  - 현장 방문 일정 설정')
    console.log('  - 프로젝트 상태 관리')
    console.log('  - 업체 기능도 유지 (입찰, 현장 방문 등)')
    
    console.log('\n🔑 로그인 정보:')
    console.log('  - Email: mingun.ryan.choi@gmail.com')
    console.log('  - 기존 비밀번호 사용')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
