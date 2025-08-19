const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserStatus() {
  try {
    console.log('🔍 Checking mingun.ryan.choi@gmail.com user status...')
    
    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: 'mingun.ryan.choi@gmail.com' },
      include: {
        contractor: true,
        renovation_requests: true
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('\n👤 User details:')
    console.log(`  ID: ${user.id}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Type: ${user.type}`)
    console.log(`  Created: ${user.created_at}`)
    console.log(`  Contractor profile: ${user.contractor ? 'Yes' : 'No'}`)
    console.log(`  Renovation requests: ${user.renovation_requests.length}`)
    
    if (user.contractor) {
      console.log('\n🏗️ Contractor profile details:')
      console.log(`  Contractor ID: ${user.contractor.id}`)
      console.log(`  Business Name: ${user.contractor.business_name}`)
      console.log(`  Created: ${user.contractor.created_at}`)
    }
    
    if (user.renovation_requests.length > 0) {
      console.log('\n📋 Renovation requests:')
      user.renovation_requests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.category} - ${req.status}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserStatus()
