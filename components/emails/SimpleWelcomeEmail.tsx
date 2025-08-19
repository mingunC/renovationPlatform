import React from 'react'
import { SimpleEmailTemplate, SimpleHeading, SimpleText, SimpleButton } from './SimpleEmailTemplate'

interface SimpleWelcomeEmailProps {
  userName: string
  verificationUrl: string
}

export function SimpleWelcomeEmail({ userName, verificationUrl }: SimpleWelcomeEmailProps) {
  return (
    <SimpleEmailTemplate 
      title="Renovate Platform에 오신 것을 환영합니다!"
      previewText="Renovate Platform 계정이 성공적으로 생성되었습니다."
    >
      <SimpleHeading>안녕하세요, {userName}님! 👋</SimpleHeading>
      
      <SimpleText>
        Renovate Platform에 가입해주셔서 감사합니다. 
        이제 신뢰할 수 있는 계약업체들과 연결하여 원하는 리노베이션을 진행할 수 있습니다.
      </SimpleText>
      
      <SimpleText>
        계정을 활성화하려면 아래 버튼을 클릭하여 이메일 주소를 확인해주세요.
      </SimpleText>
      
      <SimpleButton href={verificationUrl}>
        이메일 확인하기
      </SimpleButton>
      
      <SimpleText>
        질문이 있으시면 언제든지 support@renovateplatform.com으로 연락해주세요.
      </SimpleText>
    </SimpleEmailTemplate>
  )
}

export default SimpleWelcomeEmail
