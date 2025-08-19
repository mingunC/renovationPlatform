const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupUser() {
  try {
    console.log('🧹 Cleaning up mingun.ryan.choi@gmail.com user...')
    
    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: 'mingun.ryan.choi@gmail.com' },
      include: {
        contractor: true
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log(`✅ User found: ${user.id} (${user.type})`)
    
    // 업체 프로필이 있으면 삭제
    if (user.contractor) {
      console.log('🗑️ Deleting contractor profile...')
      await prisma.contractor.delete({
        where: { id: user.contractor.id }
      })
      console.log('✅ Contractor profile deleted')
    }
    
    // 사용자 타입을 CUSTOMER로 변경
    if (user.type !== 'CUSTOMER') {
      console.log('🔄 Changing user type to CUSTOMER...')
      await prisma.user.update({
        where: { id: user.id },
        data: { type: 'CUSTOMER' }
      })
      console.log('✅ User type changed to CUSTOMER')
    }
    
    console.log('🎉 Cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupUser()
