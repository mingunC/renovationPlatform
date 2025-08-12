import React from 'react'
import {
  Section,
  Row,
  Column,
  Text,
  Hr,
} from '@react-email/components'
import { BaseEmailTemplate, EmailButton, EmailBadge } from './BaseEmailTemplate'

interface BidAcceptedEmailProps {
  contractorName: string
  bid: {
    id: string
    total_amount: number
    timeline_weeks: number
    start_date: string
    included_items: string
    notes?: string
  }
  customer: {
    name: string
    email: string
    phone?: string
  }
  request: {
    id: string
    category: string
    postal_code: string
    address: string
    description: string
  }
}

export function BidAcceptedEmail({ contractorName, bid, customer, request }: BidAcceptedEmailProps) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const projectUrl = `${baseUrl}/contractor/projects/${request.id}`
  const dashboardUrl = `${baseUrl}/contractor/dashboard`

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCategory = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'KITCHEN': return '🍳'
      case 'BATHROOM': return '🚿'
      case 'BASEMENT': return '🏠'
      case 'FLOORING': return '🏗️'
      case 'PAINTING': return '🎨'
      case 'OTHER': return '🔧'
      default: return '📋'
    }
  }

  const previewText = `Congratulations! Your ${formatCurrency(bid.total_amount)} bid has been accepted`

  return (
    <BaseEmailTemplate previewText={previewText}>
      {/* Celebration Hero Section */}
      <Section style={celebrationSection}>
        <Text style={celebrationEmoji}>🎉 🏆 🎊</Text>
        <Text style={celebrationTitle}>
          Congratulations!
        </Text>
        <Text style={celebrationSubtitle}>
          Your bid has been accepted!
        </Text>
      </Section>

      {/* Success Message */}
      <Section style={successSection}>
        <Text style={successMessage}>
          🎯 You&apos;ve successfully won the {formatCategory(request.category)} renovation project!
        </Text>
      </Section>

      {/* Greeting */}
      <Section>
        <Text style={greeting}>Hello {contractorName},</Text>
        <Text style={bodyText}>
          Fantastic news! {customer.name} has chosen your proposal for their renovation project. 
          This is a great opportunity to showcase your skills and build your reputation on our platform.
        </Text>
      </Section>

      {/* Project Summary Card */}
      <Section style={cardSection}>
        <Text style={cardTitle}>🏗️ Project Summary</Text>
        
        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Project:</Text>
          </Column>
          <Column>
            <Text style={valueText}>
              {getCategoryIcon(request.category)} {formatCategory(request.category)} Renovation
            </Text>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Your Winning Bid:</Text>
          </Column>
          <Column>
            <Text style={winningBidText}>{formatCurrency(bid.total_amount)}</Text>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Timeline:</Text>
          </Column>
          <Column>
            <EmailBadge color="green">
              {bid.timeline_weeks} {bid.timeline_weeks === 1 ? 'week' : 'weeks'}
            </EmailBadge>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Start Date:</Text>
          </Column>
          <Column>
            <Text style={valueText}>
              📅 {new Date(bid.start_date).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Location:</Text>
          </Column>
          <Column>
            <Text style={valueText}>📍 {request.postal_code}</Text>
          </Column>
        </Row>
      </Section>

      {/* Customer Information */}
      <Section style={cardSection}>
        <Text style={cardTitle}>👤 Customer Information</Text>
        
        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Name:</Text>
          </Column>
          <Column>
            <Text style={customerNameText}>{customer.name}</Text>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Email:</Text>
          </Column>
          <Column>
            <Text style={valueText}>📧 {customer.email}</Text>
          </Column>
        </Row>

        {customer.phone && (
          <Row style={summaryRow}>
            <Column style={labelColumn}>
              <Text style={labelText}>Phone:</Text>
            </Column>
            <Column>
              <Text style={valueText}>📞 {customer.phone}</Text>
            </Column>
          </Row>
        )}

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Address:</Text>
          </Column>
          <Column>
            <Text style={valueText}>🏠 {request.address}</Text>
          </Column>
        </Row>
      </Section>

      {/* Project Scope */}
      <Section style={cardSection}>
        <Text style={cardTitle}>📋 Project Scope</Text>
        <Text style={scopeText}>{request.description}</Text>
        
        <Text style={subCardTitle}>✅ What You Committed To</Text>
        <Text style={scopeText}>{bid.included_items}</Text>

        {bid.notes && (
          <>
            <Text style={subCardTitle}>📝 Your Notes</Text>
            <Text style={scopeText}>{bid.notes}</Text>
          </>
        )}
      </Section>

      {/* Call to Action */}
      <Section style={ctaSection}>
        <EmailButton href={projectUrl}>
          View Project Details
        </EmailButton>
        
        <Text style={ctaSubtext}>
          Access your project dashboard to manage this renovation
        </Text>
      </Section>

      <Hr style={sectionDivider} />

      {/* Next Steps */}
      <Section>
        <Text style={sectionTitle}>🚀 What&apos;s Next?</Text>
        <Text style={listItem}>📞 <strong>Contact the customer</strong> within 24 hours to confirm details</Text>
        <Text style={listItem}>📅 <strong>Schedule a kickoff meeting</strong> to review the project scope</Text>
        <Text style={listItem}>📋 <strong>Finalize project timeline</strong> and confirm the start date</Text>
        <Text style={listItem}>🛒 <strong>Order materials</strong> and prepare for the project</Text>
        <Text style={listItem}>📷 <strong>Document progress</strong> and keep the customer updated</Text>
        <Text style={listItem}>✅ <strong>Complete the work</strong> according to your proposal</Text>
      </Section>

      <Hr style={sectionDivider} />

      {/* Success Tips */}
      <Section>
        <Text style={sectionTitle}>💡 Tips for Project Success</Text>
        <Text style={listItem}>🤝 <strong>Communication is key</strong> - Keep the customer informed throughout</Text>
        <Text style={listItem}>📸 <strong>Take before/after photos</strong> to showcase your work</Text>
        <Text style={listItem}>⏰ <strong>Stick to your timeline</strong> - customers appreciate reliability</Text>
        <Text style={listItem}>🔍 <strong>Address issues quickly</strong> - proactive problem-solving builds trust</Text>
        <Text style={listItem}>⭐ <strong>Ask for reviews</strong> - happy customers help grow your business</Text>
      </Section>

      {/* Payment Information */}
      <Section style={paymentSection}>
        <Text style={paymentTitle}>💳 Payment Information</Text>
        <Text style={paymentText}>
          Payment will be processed through our secure platform. You&apos;ll receive payment milestones 
          as agreed upon with the customer. All transactions are protected by our guarantee policy.
        </Text>
      </Section>

      {/* Support Section */}
      <Section style={supportSection}>
        <Text style={supportTitle}>🛠️ Need Support?</Text>
        <Text style={supportText}>
           Our team is here to help ensure your project&apos;s success. If you have any questions 
          or need assistance, don&apos;t hesitate to reach out.
        </Text>
      </Section>

      {/* Secondary CTA */}
      <Section style={ctaSection}>
        <Text style={secondaryCtaText}>
          Ready to start building your reputation?
        </Text>
        <EmailButton href={dashboardUrl} variant="secondary">
          Go to Dashboard
        </EmailButton>
      </Section>
    </BaseEmailTemplate>
  )
}

// Styles
const celebrationSection = {
  textAlign: 'center' as const,
  backgroundColor: '#f0f9ff',
  margin: '-24px -24px 32px -24px',
  padding: '32px 24px',
  borderRadius: '8px 8px 0 0',
}

const celebrationEmoji = {
  fontSize: '32px',
  margin: '0 0 16px 0',
}

const celebrationTitle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#0c4a6e',
  margin: '0 0 8px 0',
}

const celebrationSubtitle = {
  fontSize: '18px',
  color: '#0369a1',
  margin: '0',
}

const successSection = {
  backgroundColor: '#d1fae5',
  border: '1px solid #059669',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
}

const successMessage = {
  fontSize: '16px',
  color: '#065f46',
  fontWeight: '600',
  margin: '0',
}

const greeting = {
  fontSize: '16px',
  color: '#111827',
  margin: '0 0 16px 0',
}

const bodyText = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '24px',
  margin: '0 0 24px 0',
}

const cardSection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  margin: '0 0 24px 0',
}

const cardTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
}

const subCardTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '16px 0 12px 0',
}

const summaryRow = {
  margin: '0 0 12px 0',
}

const labelColumn = {
  width: '35%',
  verticalAlign: 'top',
}

const labelText = {
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: '600',
  margin: '0',
}

const valueText = {
  fontSize: '14px',
  color: '#111827',
  margin: '0',
}

const customerNameText = {
  fontSize: '16px',
  color: '#111827',
  fontWeight: '600',
  margin: '0',
}

const winningBidText = {
  fontSize: '20px',
  color: '#059669',
  fontWeight: 'bold',
  margin: '0',
}

const scopeText = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '22px',
  margin: '0 0 16px 0',
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '32px 0',
}

const ctaSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '16px 0 0 0',
}

const secondaryCtaText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 16px 0',
}

const sectionDivider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
}

const listItem = {
  fontSize: '15px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '22px',
}

const paymentSection = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 24px 0',
}

const paymentTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px 0',
}

const paymentText = {
  fontSize: '14px',
  color: '#92400e',
  lineHeight: '20px',
  margin: '0',
}

const supportSection = {
  backgroundColor: '#e0e7ff',
  border: '1px solid #6366f1',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 24px 0',
}

const supportTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#3730a3',
  margin: '0 0 8px 0',
}

const supportText = {
  fontSize: '14px',
  color: '#3730a3',
  lineHeight: '20px',
  margin: '0',
}
