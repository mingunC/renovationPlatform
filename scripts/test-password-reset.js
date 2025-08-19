require('dotenv').config({ path: '.env.local' })

async function testPasswordReset() {
  try {
    console.log('🔐 비밀번호 재설정 테스트 시작...')
    
    const email = 'cmgg919@gmail.com'
    console.log('📧 대상 이메일:', email)
    
    // API 호출
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    
    const data = await response.json()
    
    console.log('📡 응답 상태:', response.status)
    console.log('📦 응답 데이터:', data)
    
    if (response.ok) {
      console.log('✅ 비밀번호 재설정 링크 발송 성공!')
      console.log('📧 사용자 이메일을 확인해주세요.')
      console.log('🔗 재설정 링크가 포함된 이메일이 발송되었습니다.')
    } else {
      console.log('❌ 비밀번호 재설정 링크 발송 실패')
      console.log('🚨 오류:', data.error)
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  }
}

// 서버가 실행 중인지 확인
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health')
    if (response.ok) {
      console.log('✅ 서버가 실행 중입니다.')
      await testPasswordReset()
    } else {
      console.log('❌ 서버가 실행되지 않았습니다.')
      console.log('💡 npm run dev를 실행한 후 다시 시도해주세요.')
    }
  } catch (error) {
    console.log('❌ 서버에 연결할 수 없습니다.')
    console.log('💡 npm run dev를 실행한 후 다시 시도해주세요.')
  }
}

checkServer()
