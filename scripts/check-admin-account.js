const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdminAccount() {
  try {
    console.log('🔍 admin@renovate.com 관리자 계정 확인...')
    
    // 1. 데이터베이스에서 관리자 계정 찾기
    console.log('\n📊 데이터베이스에서 관리자 계정 찾기...')
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@renovate.com' },
          { email: { contains: 'admin' } },
          { type: 'ADMIN' }
        ]
      }
    })
    
    if (adminUser) {
      console.log('✅ 관리자 계정을 찾았습니다:')
      console.log('  - ID:', adminUser.id)
      console.log('  - Email:', adminUser.email)
      console.log('  - Name:', adminUser.name)
      console.log('  - Type:', adminUser.type)
      console.log('  - Created:', adminUser.created_at)
      console.log('  - Updated:', adminUser.updated_at)
    } else {
      console.log('❌ 데이터베이스에서 관리자 계정을 찾을 수 없습니다.')
    }
    
    // 2. 모든 사용자 계정 확인
    console.log('\n📋 모든 사용자 계정 확인...')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    
    console.log(`📊 총 사용자 수: ${allUsers.length}개`)
    
    // 타입별 사용자 수
    const typeCounts = {}
    allUsers.forEach(user => {
      typeCounts[user.type] = (typeCounts[user.type] || 0) + 1
    })
    
    console.log('\n👥 사용자 타입별 분포:')
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}개`)
    })
    
    // 관리자 계정들
    const adminUsers = allUsers.filter(user => user.type === 'ADMIN')
    if (adminUsers.length > 0) {
      console.log('\n👑 관리자 계정들:')
      adminUsers.forEach((admin, index) => {
        console.log(`  ${index + 1}. ${admin.email} (${admin.name})`)
        console.log(`     - ID: ${admin.id}`)
        console.log(`     - Created: ${admin.created_at}`)
      })
    } else {
      console.log('\n❌ 관리자 계정이 없습니다.')
    }
    
    // 3. 최근 생성된 계정들
    console.log('\n🆕 최근 생성된 계정들 (최근 5개):')
    allUsers.slice(0, 5).forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.name})`)
      console.log(`     - Type: ${user.type}`)
      console.log(`     - Created: ${user.created_at}`)
    })
    
    // 4. 관리자 계정 재생성 필요 여부 확인
    if (!adminUser) {
      console.log('\n⚠️ 관리자 계정이 없습니다.')
      console.log('다음 중 하나를 선택해야 합니다:')
      console.log('  1. 기존 계정을 관리자로 변경')
      console.log('  2. 새로운 관리자 계정 생성')
      console.log('  3. Supabase에서 관리자 계정 확인')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminAccount()
