const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProjectStatus() {
  try {
    const projectId = '2af46d97-8a50-4ab2-9ff1-24377444a2b3';
    
    console.log(`🔄 Updating project ${projectId} status...`);
    
    // 1단계: INSPECTION_SCHEDULED로 변경
    const updatedProject = await prisma.renovationRequest.update({
      where: { id: projectId },
      data: { 
        status: 'INSPECTION_SCHEDULED'
      }
    });
    
    console.log('✅ Project status updated to INSPECTION_SCHEDULED:', updatedProject.status);
    
    // 2단계: 현장 방문 완료 후 입찰 시작을 위한 상태 변경
    const biddingProject = await prisma.renovationRequest.update({
      where: { id: projectId },
      data: { 
        status: 'BIDDING_OPEN',
        bidding_start_date: new Date(),
        bidding_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후
      }
    });
    
    console.log('✅ Project status updated to BIDDING_OPEN:', biddingProject.status);
    console.log('📅 Bidding start date:', biddingProject.bidding_start_date);
    console.log('📅 Bidding end date:', biddingProject.bidding_end_date);
    
    // 3단계: 프로젝트 정보 확인
    const finalProject = await prisma.renovationRequest.findUnique({
      where: { id: projectId },
      include: {
        customer: true,
        _count: {
          select: {
            bids: true
          }
        }
      }
    });
    
    console.log('\n🎯 Final Project Status:');
    console.log('ID:', finalProject.id);
    console.log('Status:', finalProject.status);
    console.log('Category:', finalProject.category);
    console.log('Customer:', finalProject.customer.name);
    console.log('Bidding Start:', finalProject.bidding_start_date);
    console.log('Bidding End:', finalProject.bidding_end_date);
    console.log('Bids Count:', finalProject._count.bids);
    
  } catch (error) {
    console.error('❌ Error updating project status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProjectStatus();
