const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkContractorCount() {
  try {
    console.log('🔍 현재 업체 계정 현황 확인...')
    
    // 1. CONTRACTOR 타입 사용자 수 확인
    console.log('\n📊 CONTRACTOR 타입 사용자 수:')
    const contractorUsers = await prisma.user.findMany({
      where: { type: 'CONTRACTOR' },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true
      }
    })
    
    console.log(`✅ 총 CONTRACTOR 사용자: ${contractorUsers.length}개`)
    
    if (contractorUsers.length > 0) {
      console.log('\n👷 CONTRACTOR 사용자 목록:')
      contractorUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email})`)
        console.log(`     - ID: ${user.id}`)
        console.log(`     - Created: ${user.created_at}`)
      })
    }
    
    // 2. CONTRACTOR 프로필 수 확인
    console.log('\n📊 CONTRACTOR 프로필 수:')
    const contractorProfiles = await prisma.contractor.findMany({
      select: {
        id: true,
        user_id: true,
        business_name: true,
        profile_completed: true,
        created_at: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })
    
    console.log(`✅ 총 CONTRACTOR 프로필: ${contractorProfiles.length}개`)
    
    if (contractorProfiles.length > 0) {
      console.log('\n🏢 CONTRACTOR 프로필 상세:')
      contractorProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.business_name || '업체명 없음'}`)
        console.log(`     - User: ${profile.user.name} (${profile.user.email})`)
        console.log(`     - Profile ID: ${profile.id}`)
        console.log(`     - Profile Completed: ${profile.profile_completed}`)
        console.log(`     - Created: ${profile.created_at}`)
      })
    }
    
    // 3. ADMIN 타입 사용자 확인 (관리자도 업체 기능 사용 가능)
    console.log('\n📊 ADMIN 타입 사용자 (업체 기능도 사용 가능):')
    const adminUsers = await prisma.user.findMany({
      where: { type: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true
      }
    })
    
    console.log(`✅ 총 ADMIN 사용자: ${adminUsers.length}개`)
    
    if (adminUsers.length > 0) {
      console.log('\n👑 ADMIN 사용자 목록:')
      adminUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email})`)
        console.log(`     - ID: ${user.id}`)
        console.log(`     - Created: ${user.created_at}`)
      })
    }
    
    // 4. 전체 사용자 타입별 분포
    console.log('\n📊 전체 사용자 타입별 분포:')
    const allUsers = await prisma.user.findMany({
      select: {
        type: true
      }
    })
    
    const typeCounts = {}
    allUsers.forEach(user => {
      typeCounts[user.type] = (typeCounts[user.type] || 0) + 1
    })
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}개`)
    })
    
    // 5. 요약
    console.log('\n📋 요약:')
    console.log(`  - CONTRACTOR 전용 사용자: ${contractorUsers.length}개`)
    console.log(`  - ADMIN 사용자 (업체 기능도 사용): ${adminUsers.length}개`)
    console.log(`  - 총 업체 기능 사용 가능: ${contractorUsers.length + adminUsers.length}개`)
    console.log(`  - CONTRACTOR 프로필: ${contractorProfiles.length}개`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkContractorCount()
