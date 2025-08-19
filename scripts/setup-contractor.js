const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupContractor() {
  try {
    console.log('🔧 Setting up mingun.ryan.choi@gmail.com as contractor...')
    
    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: 'mingun.ryan.choi@gmail.com' }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log(`✅ User found: ${user.id} (${user.type})`)
    
    // 사용자 타입을 CONTRACTOR로 변경
    if (user.type !== 'CONTRACTOR') {
      console.log('🔄 Changing user type to CONTRACTOR...')
      await prisma.user.update({
        where: { id: user.id },
        data: { type: 'CONTRACTOR' }
      })
      console.log('✅ User type changed to CONTRACTOR')
    }
    
    // 업체 프로필이 있는지 확인
    let contractor = await prisma.contractor.findUnique({
      where: { user_id: user.id }
    })
    
    if (!contractor) {
      console.log('🏗️ Creating contractor profile...')
      // 업체 프로필 생성
      contractor = await prisma.contractor.create({
        data: {
          user_id: user.id,
          business_name: 'Mingun Renovation Services',
          business_number: null,
          phone: user.phone || '',
          business_license_number: null,
          insurance_document_url: null,
          wsib_certificate_url: null,
          insurance_verified: false,
          wsib_verified: false,
          service_areas: ['M5V 3A8', 'M4C 1B5', 'M2N 6K1'], // Toronto area
          categories: ['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING'],
          rating: 0,
          review_count: 0,
          profile_completed: false,
          completion_percentage: 0,
          skip_verification: false
        }
      })
      console.log('✅ Contractor profile created:', contractor.id)
    } else {
      console.log('✅ Contractor profile already exists:', contractor.id)
    }
    
    console.log('🎉 Contractor setup completed!')
    console.log(`  User ID: ${user.id}`)
    console.log(`  User Type: ${user.type}`)
    console.log(`  Contractor ID: ${contractor.id}`)
    console.log(`  Business Name: ${contractor.business_name}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupContractor()
