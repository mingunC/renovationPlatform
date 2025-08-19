const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentUser() {
  try {
    console.log('🔍 현재 데이터베이스 상태 확인...\n');

    // 모든 사용자 조회
    const allUsers = await prisma.user.findMany({
      orderBy: { created_at: 'desc' }
    });

    console.log('📊 전체 사용자 목록:');
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.name})`);
      console.log(`     - ID: ${user.id}`);
      console.log(`     - Type: ${user.type}`);
      console.log(`     - Created: ${user.created_at}`);
      console.log(`     - Phone: ${user.phone || 'N/A'}`);
      console.log('');
    });

    // Supabase 인증 테이블 확인 (가능한 경우)
    console.log('🔐 Supabase 인증 상태:');
    console.log('  - Supabase 인증 테이블은 직접 접근 불가');
    console.log('  - 브라우저에서 Supabase 인증 상태 확인 필요');
    console.log('');

    // 문제 해결 방법 제안
    console.log('💡 문제 해결 방법:');
    console.log('  1. Supabase에서 로그아웃 후 다시 로그인');
    console.log('  2. 또는 새로운 계정으로 등록');
    console.log('  3. 또는 기존 ADMIN 계정으로 관리자 로그인');
    console.log('');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentUser();
