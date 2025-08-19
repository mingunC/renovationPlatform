require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    console.log('🔍 사용자 정보 확인 중...')
    console.log('📡 DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '설정되지 않음')
    
    // 특정 이메일로 사용자 검색
    const user = await prisma.user.findUnique({
      where: {
        email: 'cmgg919@gmail.com'
      },
      include: {
        contractor: true
      }
    })
    
    if (user) {
      console.log('✅ 사용자를 찾았습니다!')
      console.log('📧 이메일:', user.email)
      console.log('👤 이름:', user.name)
      console.log('📱 전화번호:', user.phone || '없음')
      console.log('👥 타입:', user.type)
      console.log('📅 생성일:', user.created_at)
      console.log('🔄 수정일:', user.updated_at)
      
      if (user.contractor) {
        console.log('🏢 계약업체 정보:')
        console.log('  - 업체명:', user.contractor.business_name || '없음')
        console.log('  - 사업자번호:', user.contractor.business_number || '없음')
      }
    } else {
      console.log('❌ 해당 이메일의 사용자를 찾을 수 없습니다.')
    }
    
    // 전체 사용자 수 확인
    const totalUsers = await prisma.user.count()
    console.log('\n📊 전체 사용자 수:', totalUsers)
    
    // 최근 사용자 5명 확인
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        email: true,
        name: true,
        type: true,
        created_at: true
      }
    })
    
    console.log('\n👥 최근 가입한 사용자 5명:')
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - ${user.type}`)
    })
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
