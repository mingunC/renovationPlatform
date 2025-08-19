const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function changeMystarsToCustomer() {
  try {
    console.log('🔍 mystars100826을 CUSTOMER로 변경...')
    
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
    
    if (user.type !== 'CONTRACTOR') {
      console.log('❌ 이미 CONTRACTOR가 아닙니다.')
      return
    }
    
    // 2. CONTRACTOR 프로필 삭제
    console.log('\n🗑️ CONTRACTOR 프로필 삭제...')
    const contractor = await prisma.contractor.findUnique({
      where: { user_id: user.id }
    })
    
    if (contractor) {
      await prisma.contractor.delete({
        where: { id: contractor.id }
      })
      console.log('✅ CONTRACTOR 프로필 삭제 완료')
    } else {
      console.log('⚠️ CONTRACTOR 프로필이 이미 없습니다.')
    }
    
    // 3. 사용자 타입을 CUSTOMER로 변경
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
    
    console.log('\n🎉 mystars100826이 CUSTOMER로 변경되었습니다!')
    console.log('이제 프로젝트를 등록할 수 있습니다.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

changeMystarsToCustomer()
