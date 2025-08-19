const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function changeProjectStatus() {
  try {
    console.log('🔍 Changing mingun choi project status to OPEN...\n');
    
    // mingun choi 사용자 찾기
    const user = await prisma.user.findFirst({
      where: { name: 'Mingun Choi' }
    });
    
    if (user) {
      console.log('✅ User found:', user.email);
      
      // 해당 사용자의 프로젝트 상태 변경
      const updatedProject = await prisma.renovationRequest.updateMany({
        where: { 
          customer_id: user.id,
          status: 'INSPECTION_SCHEDULED'
        },
        data: { 
          status: 'OPEN'
        }
      });
      
      console.log('✅ Project status updated:', updatedProject);
      
      // 변경된 프로젝트 확인
      const project = await prisma.renovationRequest.findFirst({
        where: { customer_id: user.id },
        include: { customer: true }
      });
      
      if (project) {
        console.log('📋 Updated project:');
        console.log(`  ID: ${project.id}`);
        console.log(`  Status: ${project.status}`);
        console.log(`  Customer: ${project.customer.name}`);
        console.log(`  Category: ${project.category}`);
      }
    } else {
      console.log('❌ Mingun Choi user not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

changeProjectStatus();
