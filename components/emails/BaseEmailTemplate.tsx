import React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
  Button,
} from '@react-email/components'

interface BaseEmailTemplateProps {
  children: React.ReactNode
  previewText?: string
  title?: string
}

export function BaseEmailTemplate({ children, previewText, title }: BaseEmailTemplateProps) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return (
    <Html>
      <Head>
        <title>{title || 'Renovate Platform'}</title>
        {previewText && <meta name="description" content={previewText} />}
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Row>
              <Column>
                <Text style={logoText}>🏗️ Renovate Platform</Text>
                <Text style={tagline}>Connecting homeowners with trusted contractors</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Row>
              <Column>
                <Text style={footerText}>
                  <strong>Renovate Platform</strong><br />
                  Your trusted renovation marketplace<br />
                  📧 support@renovateplatform.com<br />
                  📞 (555) 123-4567
                </Text>
              </Column>
            </Row>
            
            <Row style={{ marginTop: '20px' }}>
              <Column>
                <Text style={footerLinks}>
                  <Link href={`${baseUrl}/privacy`} style={link}>Privacy Policy</Link>
                  {' • '}
                  <Link href={`${baseUrl}/terms`} style={link}>Terms of Service</Link>
                  {' • '}
                  <Link href={`${baseUrl}/unsubscribe`} style={link}>Unsubscribe</Link>
                </Text>
              </Column>
            </Row>

            <Row style={{ marginTop: '20px' }}>
              <Column>
                <Text style={copyright}>
                  © {new Date().getFullYear()} Renovate Platform. All rights reserved.
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Shared button component for CTAs
export function EmailButton({ 
  href, 
  children, 
  variant = 'primary' 
}: { 
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}) {
  const buttonStyle = variant === 'primary' ? primaryButton : secondaryButton
  
  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  )
}

// Badge component for status/category indicators
export function EmailBadge({ 
  children, 
  color = 'blue' 
}: { 
  children: React.ReactNode
  color?: 'blue' | 'green' | 'orange' | 'red' | 'gray'
}) {
  const badgeStyle = {
    ...badge,
    backgroundColor: colorMap[color].bg,
    color: colorMap[color].text,
  }
  
  return <Text style={badgeStyle}>{children}</Text>
}

// Color mapping for badges
const colorMap = {
  blue: { bg: '#dbeafe', text: '#1e40af' },
  green: { bg: '#d1fae5', text: '#065f46' },
  orange: { bg: '#fed7aa', text: '#c2410c' },
  red: { bg: '#fecaca', text: '#dc2626' },
  gray: { bg: '#f3f4f6', text: '#374151' },
}

// Shared styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  margin: '0',
  padding: '0',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  overflow: 'hidden',
}

const header = {
  backgroundColor: '#3b82f6',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const logoText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const tagline = {
  color: '#dbeafe',
  fontSize: '14px',
  margin: '0',
}

const content = {
  padding: '32px 24px',
}

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const footerLinks = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
}

const copyright = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '0 0 20px 0',
}

const link = {
  color: '#3b82f6',
  textDecoration: 'none',
}

const primaryButton = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
  display: 'inline-block',
  textAlign: 'center' as const,
  minWidth: '160px',
}

const secondaryButton = {
  backgroundColor: 'transparent',
  color: '#3b82f6',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
  display: 'inline-block',
  textAlign: 'center' as const,
  border: '2px solid #3b82f6',
  minWidth: '160px',
}

const badge = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
}
