import React from 'react'
import {
  Section,
  Text,
  Button,
} from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface PasswordResetEmailProps {
  userName: string
  resetLink: string
  expiryHours: number
}

export function PasswordResetEmail({ userName, resetLink, expiryHours }: PasswordResetEmailProps) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const previewText = `비밀번호 재설정 링크가 발송되었습니다. ${expiryHours}시간 내에 링크를 클릭하여 비밀번호를 변경하세요.`

  return (
    <BaseEmailTemplate previewText={previewText}>
      {/* Hero Section */}
      <Section style={heroSection}>
        <Text style={heroTitle}>
          🔐 비밀번호 재설정 요청
        </Text>
        <Text style={heroSubtitle}>
          안전한 비밀번호 재설정을 위한 링크가 발송되었습니다
        </Text>
      </Section>

      {/* Greeting */}
      <Section>
        <Text style={greeting}>안녕하세요 {userName}님,</Text>
        <Text style={bodyText}>
          비밀번호 재설정 요청이 접수되었습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정하세요.
        </Text>
      </Section>

      {/* Reset Button */}
      <Section style={buttonSection}>
        <Text style={buttonText}>
          🔑 비밀번호 재설정 링크가 이메일에 포함되어 있습니다
        </Text>
        <Text style={instructionText}>
          이메일에서 "비밀번호 재설정" 링크를 클릭하여 새 비밀번호를 설정하세요.
        </Text>
      </Section>

      {/* Important Notes */}
      <Section style={notesSection}>
        <Text style={notesTitle}>⚠️ 중요 안내사항</Text>
        <Text style={notesText}>
          • 이 링크는 <strong>{expiryHours}시간</strong> 동안만 유효합니다<br/>
          • 링크를 클릭하면 자동으로 비밀번호 재설정 페이지로 이동합니다<br/>
          • 본인이 요청하지 않은 경우 이 이메일을 무시하세요<br/>
          • 보안을 위해 링크는 한 번만 사용할 수 있습니다
        </Text>
      </Section>

      {/* Alternative Link */}
      <Section style={alternativeSection}>
        <Text style={alternativeText}>
          링크가 작동하지 않는 경우, 아래 URL을 복사하여 브라우저에 붙여넣기 하세요:
        </Text>
        <Text style={linkText}>
          {resetLink}
        </Text>
      </Section>

      {/* Footer */}
      <Section style={footerSection}>
        <Text style={footerText}>
          문의사항이 있으시면 고객지원팀에 연락해 주세요.<br/>
          이 이메일은 자동으로 발송되었습니다.
        </Text>
      </Section>
    </BaseEmailTemplate>
  )
}

// Styles
const heroSection = {
  textAlign: 'center' as const,
  padding: '32px 0',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  margin: '24px 0',
}

const heroTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
}

const heroSubtitle = {
  fontSize: '16px',
  color: '#64748b',
  margin: '0',
  textAlign: 'center' as const,
}

const greeting = {
  fontSize: '18px',
  color: '#1e293b',
  margin: '0 0 16px 0',
}

const bodyText = {
  fontSize: '16px',
  color: '#475569',
  lineHeight: '24px',
  margin: '0 0 24px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const buttonText = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 8px 0',
}

const instructionText = {
  fontSize: '14px',
  color: '#475569',
  lineHeight: '20px',
  margin: '0 0 16px 0',
}

const notesSection = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const notesTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 12px 0',
}

const notesText = {
  fontSize: '14px',
  color: '#7f1d1d',
  lineHeight: '20px',
  margin: '0',
}

const alternativeSection = {
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const alternativeText = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 12px 0',
}

const linkText = {
  fontSize: '12px',
  color: '#3b82f6',
  wordBreak: 'break-all' as const,
  backgroundColor: '#ffffff',
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid #e2e8f0',
  margin: '0',
}

const footerSection = {
  textAlign: 'center' as const,
  margin: '32px 0 0 0',
  padding: '20px 0',
  borderTop: '1px solid #e2e8f0',
}

const footerText = {
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '20px',
  margin: '0',
}
