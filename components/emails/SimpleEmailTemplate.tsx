import React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'

interface SimpleEmailTemplateProps {
  children: React.ReactNode
  title?: string
  previewText?: string
}

export function SimpleEmailTemplate({ children, title, previewText }: SimpleEmailTemplateProps) {
  return (
    <Html>
      <Head>
        <title>{title || 'Renovate Platform'}</title>
        {previewText && <meta name="description" content={previewText} />}
      </Head>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* 간단한 헤더 */}
          <Section style={styles.header}>
            <Text style={styles.logo}>🏗️ Renovate Platform</Text>
          </Section>

          {/* 메인 콘텐츠 */}
          <Section style={styles.content}>
            {children}
          </Section>

          {/* 간단한 푸터 */}
          <Hr style={styles.divider} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Renovate Platform. All rights reserved.
            </Text>
            <Text style={styles.footerLinks}>
              <Link href="#" style={styles.link}>Privacy</Link>
              {' • '}
              <Link href="#" style={styles.link}>Terms</Link>
              {' • '}
              <Link href="#" style={styles.link}>Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// 간단한 텍스트 컴포넌트
export function SimpleText({ children, style = {} }: { children: React.ReactNode; style?: any }) {
  return <Text style={{ ...styles.text, ...style }}>{children}</Text>
}

// 간단한 제목 컴포넌트
export function SimpleHeading({ children, style = {} }: { children: React.ReactNode; style?: any }) {
  return <Text style={{ ...styles.heading, ...style }}>{children}</Text>
}

// 간단한 링크 버튼 컴포넌트
export function SimpleButton({ href, children, style = {} }: { href: string; children: React.ReactNode; style?: any }) {
  return (
    <Link href={href} style={{ ...styles.button, ...style }}>
      {children}
    </Link>
  )
}

// 공유해주신 스타일을 기반으로 한 스타일 객체
const styles = {
  body: {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
  },
  header: {
    padding: '20px 0',
    textAlign: 'center' as const,
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333333',
    margin: '0',
  },
  content: {
    padding: '20px 0',
  },
  heading: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333333',
    margin: '0 0 16px 0',
  },
  text: {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#666666',
    margin: '0 0 16px 0',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    display: 'inline-block',
    margin: '16px 0',
  },
  divider: {
    borderColor: '#e0e0e0',
    margin: '32px 0',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '20px 0',
  },
  footerText: {
    fontSize: '14px',
    color: '#999999',
    margin: '0 0 8px 0',
  },
  footerLinks: {
    fontSize: '12px',
    color: '#999999',
    margin: '0',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
}

export default SimpleEmailTemplate
