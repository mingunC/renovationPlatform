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

const badge = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
}

// New styles for enhanced email templates
export const BaseEmailStyles = {
  body: {
    backgroundColor: '#f9fafb',
    fontFamily: 'Arial, sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: '24px',
    textAlign: 'center' as const,
  },
  logo: {
    width: '120px',
    height: '40px',
  },
  content: {
    padding: '32px 24px',
  },
  heading: {
    color: '#1f2937',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
    textAlign: 'center' as const,
  },
  subHeading: {
    color: '#374151',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  text: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  description: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '16px 0',
  },
  highlightBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #0ea5e9',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  },
  infoBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  },
  tipsSection: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  },
  ctaSection: {
    backgroundColor: '#f0f9ff',
    border: '2px solid #0ea5e9',
    borderRadius: '8px',
    padding: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  button: {
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    padding: '16px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '600',
    display: 'inline-block',
    margin: '16px 0',
  },
  list: {
    margin: '16px 0',
    padding: '0',
  },
  listItem: {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '8px 0',
    paddingLeft: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    margin: '16px 0',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableCell: {
    padding: '12px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    textAlign: 'left' as const,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableRowOdd: {
    backgroundColor: '#ffffff',
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '32px 0',
  },
  footer: {
    color: '#6b7280',
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '24px 0 0 0',
  },
  link: {
    color: '#0ea5e9',
    textDecoration: 'none',
  },
  warning: {
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '600',
    margin: '16px 0',
  },
}
