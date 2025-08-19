const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function changeToContractor() {
  try {
    console.log('🔄 mingun.ryan.choi@gmail.com을 CONTRACTOR로 변경...\n');

    // 1. 사용자 타입을 CONTRACTOR로 변경
    const updatedUser = await prisma.user.update({
      where: { email: 'mingun.ryan.choi@gmail.com' },
      data: { type: 'CONTRACTOR' }
    });

    console.log('✅ 사용자 타입 변경 완료:');
    console.log(`  - ID: ${updatedUser.id}`);
    console.log(`  - Email: ${updatedUser.email}`);
    console.log(`  - Name: ${updatedUser.name}`);
    console.log(`  - Type: ${updatedUser.type}`);
    console.log(`  - Updated: ${updatedUser.updated_at}`);
    console.log('');

    // 2. CONTRACTOR 프로필이 있는지 확인
    const existingContractor = await prisma.contractor.findUnique({
      where: { user_id: updatedUser.id }
    });

    if (existingContractor) {
      console.log('✅ CONTRACTOR 프로필이 이미 존재합니다:');
      console.log(`  - ID: ${existingContractor.id}`);
      console.log(`  - Business Name: ${existingContractor.business_name || 'N/A'}`);
      console.log(`  - Service Areas: ${existingContractor.service_areas.join(', ')}`);
      console.log(`  - Categories: ${existingContractor.categories.join(', ')}`);
    } else {
      console.log('⚠️ CONTRACTOR 프로필이 없습니다. 기본 프로필을 생성합니다...');
      
      // 기본 CONTRACTOR 프로필 생성
      const newContractor = await prisma.contractor.create({
        data: {
          user_id: updatedUser.id,
          business_name: 'Mingun Renovations',
          service_areas: ['Toronto', 'Mississauga', 'Brampton'],
          categories: ['KITCHEN', 'BATHROOM', 'BASEMENT', 'FLOORING', 'PAINTING'],
          profile_completed: true
        }
      });

      console.log('✅ 기본 CONTRACTOR 프로필 생성 완료:');
      console.log(`  - ID: ${newContractor.id}`);
      console.log(`  - Business Name: ${newContractor.business_name}`);
      console.log(`  - Service Areas: ${newContractor.service_areas.join(', ')}`);
      console.log(`  - Categories: ${newContractor.categories.join(', ')}`);
    }

    console.log('\n🎉 변경 완료!');
    console.log('이제 mingun.ryan.choi@gmail.com은 CONTRACTOR 계정입니다.');
    console.log('다음이 가능합니다:');
    console.log('  - 업체 대시보드 접근 (/dashboard)');
    console.log('  - 프로젝트 입찰');
    console.log('  - 현장 방문 참여');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

changeToContractor();
