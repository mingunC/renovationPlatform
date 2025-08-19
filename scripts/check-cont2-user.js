const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCont2User() {
  try {
    console.log('🔍 Checking cont2@gmail.com user and projects...\n');
    
    // 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { email: 'cont2@gmail.com' },
      include: {
        renovation_requests: true
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Type: ${user.type}`);
      console.log(`  Created: ${user.created_at}`);
      console.log(`  Projects count: ${user.renovation_requests.length}\n`);
      
      if (user.renovation_requests.length > 0) {
        console.log('📋 Projects:');
        user.renovation_requests.forEach((req, index) => {
          console.log(`  ${index + 1}. Project ID: ${req.id}`);
          console.log(`     Status: ${req.status}`);
          console.log(`     Category: ${req.category}`);
          console.log(`     Created: ${req.created_at}`);
          console.log(`     Address: ${req.address}`);
          console.log('');
        });
      } else {
        console.log('❌ No projects found for this user');
        
        // 전체 프로젝트 확인
        const allRequests = await prisma.renovationRequest.findMany({
          include: {
            customer: true
          }
        });
        
        console.log('\n🔍 All projects in database:');
        allRequests.forEach((req, index) => {
          console.log(`  ${index + 1}. ${req.customer.email} - ${req.category} (${req.status})`);
        });
      }
    } else {
      console.log('❌ User cont2@gmail.com not found');
      
      // 전체 사용자 확인
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, type: true }
      });
      
      console.log('\n🔍 All users in database:');
      allUsers.forEach((u, index) => {
        console.log(`  ${index + 1}. ${u.email} - ${u.name} (${u.type})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCont2User();
