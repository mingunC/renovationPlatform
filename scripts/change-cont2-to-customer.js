const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function changeCont2ToCustomer() {
  try {
    console.log('🔍 Changing cont2@gmail.com from CONTRACTOR to CUSTOMER...\n');
    
    // 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { email: 'cont2@gmail.com' },
      include: {
        contractor: true
      }
    });
    
    if (!user) {
      console.log('❌ User cont2@gmail.com not found');
      return;
    }
    
    console.log('📋 Current user info:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Type: ${user.type}`);
    console.log(`  Has contractor profile: ${!!user.contractor}\n`);
    
    if (user.type === 'CONTRACTOR') {
      console.log('🔄 Changing user type from CONTRACTOR to CUSTOMER...');
      
      // 트랜잭션으로 안전하게 변경
      const result = await prisma.$transaction(async (tx) => {
        // 1. 사용자 타입 변경
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { type: 'CUSTOMER' }
        });
        
        // 2. Contractor 프로필이 있다면 삭제
        if (user.contractor) {
          await tx.contractor.delete({
            where: { user_id: user.id }
          });
          console.log('✅ Contractor profile deleted');
        }
        
        return updatedUser;
      });
      
      console.log('✅ User type changed successfully!');
      console.log(`  New type: ${result.type}`);
      
      // 변경 후 확인
      const finalUser = await prisma.user.findUnique({
        where: { email: 'cont2@gmail.com' },
        include: {
          contractor: true,
          renovation_requests: true
        }
      });
      
      console.log('\n📋 Updated user info:');
      console.log(`  Type: ${finalUser.type}`);
      console.log(`  Has contractor profile: ${!!finalUser.contractor}`);
      console.log(`  Projects count: ${finalUser.renovation_requests.length}`);
      
    } else {
      console.log('ℹ️ User is already CUSTOMER type');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

changeCont2ToCustomer();
