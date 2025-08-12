import React from 'react'
import {
  Section,
  Row,
  Column,
  Text,
  Hr,
} from '@react-email/components'
import { BaseEmailTemplate, EmailButton, EmailBadge } from './BaseEmailTemplate'

interface NewBidEmailProps {
  customerName: string
  bid: {
    id: string
    labor_cost: number
    material_cost: number
    permit_cost: number
    disposal_cost: number
    total_amount: number
    timeline_weeks: number
    start_date: string
    included_items: string
    excluded_items?: string
    notes?: string
    created_at: string
  }
  contractor: {
    business_name?: string
    user: {
      name: string
    }
  }
  request: {
    id: string
    category: string
    budget_range: string
    description: string
  }
}

export function NewBidEmail({ customerName, bid, contractor, request }: NewBidEmailProps) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const compareUrl = `${baseUrl}/customer/compare`
  const requestUrl = `${baseUrl}/customer/requests/${request.id}`

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

  const contractorDisplayName = contractor.business_name || contractor.user.name

  const previewText = `New bid received from ${contractorDisplayName} for ${formatCurrency(bid.total_amount)}`

  return (
    <BaseEmailTemplate previewText={previewText}>
      {/* Hero Section */}
      <Section style={heroSection}>
        <Text style={heroTitle}>
          🎉 Great News! You&apos;ve Received a New Bid
        </Text>
        <Text style={heroSubtitle}>
          A qualified contractor has submitted a proposal for your {formatCategory(request.category)} renovation
        </Text>
      </Section>

      {/* Greeting */}
      <Section>
        <Text style={greeting}>Hello {customerName},</Text>
        <Text style={bodyText}>
          Excellent! You&apos;ve received a new bid for your renovation project. 
          Take your time to review the details and compare it with other proposals.
        </Text>
      </Section>

      {/* Bid Summary Card */}
      <Section style={cardSection}>
        <Text style={cardTitle}>💼 Bid Summary</Text>
        
        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Contractor:</Text>
          </Column>
          <Column>
            <Text style={contractorText}>🏢 {contractorDisplayName}</Text>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Total Amount:</Text>
          </Column>
          <Column>
            <Text style={totalAmountText}>{formatCurrency(bid.total_amount)}</Text>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Timeline:</Text>
          </Column>
          <Column>
            <EmailBadge color="blue">
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
            <Text style={labelText}>Submitted:</Text>
          </Column>
          <Column>
            <Text style={valueText}>
              🕒 {new Date(bid.created_at).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Cost Breakdown */}
      <Section style={cardSection}>
        <Text style={cardTitle}>💰 Detailed Cost Breakdown</Text>
        
        <Section style={costBreakdownSection}>
          <Row style={costRow}>
            <Column style={costLabelColumn}>
              <Text style={costLabel}>Labor:</Text>
            </Column>
            <Column style={costValueColumn}>
              <Text style={costValue}>{formatCurrency(bid.labor_cost)}</Text>
            </Column>
          </Row>

          <Row style={costRow}>
            <Column style={costLabelColumn}>
              <Text style={costLabel}>Materials:</Text>
            </Column>
            <Column style={costValueColumn}>
              <Text style={costValue}>{formatCurrency(bid.material_cost)}</Text>
            </Column>
          </Row>

          <Row style={costRow}>
            <Column style={costLabelColumn}>
              <Text style={costLabel}>Permits & Fees:</Text>
            </Column>
            <Column style={costValueColumn}>
              <Text style={costValue}>{formatCurrency(bid.permit_cost)}</Text>
            </Column>
          </Row>

          <Row style={costRow}>
            <Column style={costLabelColumn}>
              <Text style={costLabel}>Disposal & Cleanup:</Text>
            </Column>
            <Column style={costValueColumn}>
              <Text style={costValue}>{formatCurrency(bid.disposal_cost)}</Text>
            </Column>
          </Row>

          <Hr style={costDivider} />

          <Row style={totalRow}>
            <Column style={costLabelColumn}>
              <Text style={totalLabel}>Total Project Cost:</Text>
            </Column>
            <Column style={costValueColumn}>
              <Text style={totalValue}>{formatCurrency(bid.total_amount)}</Text>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* Project Scope */}
      <Section style={cardSection}>
        <Text style={cardTitle}>📋 What&apos;s Included</Text>
        <Text style={scopeText}>{bid.included_items}</Text>

        {bid.excluded_items && (
          <>
            <Text style={cardTitle}>❌ What&apos;s Not Included</Text>
            <Text style={scopeText}>{bid.excluded_items}</Text>
          </>
        )}

        {bid.notes && (
          <>
            <Text style={cardTitle}>📝 Additional Notes</Text>
            <Text style={scopeText}>{bid.notes}</Text>
          </>
        )}
      </Section>

      {/* Call to Action */}
      <Section style={ctaSection}>
        <EmailButton href={compareUrl}>
          Compare All Bids
        </EmailButton>
        
        <Text style={ctaSubtext}>
          Review all your bids in one place and make an informed decision
        </Text>
      </Section>

      <Hr style={sectionDivider} />

      {/* Next Steps */}
      <Section>
        <Text style={sectionTitle}>📋 Next Steps</Text>
        <Text style={listItem}>🔍 Review the bid details carefully</Text>
        <Text style={listItem}>📊 Compare with other bids you receive</Text>
        <Text style={listItem}>❓ Contact the contractor if you have questions</Text>
        <Text style={listItem}>✅ Accept the bid when you&apos;re ready to proceed</Text>
        <Text style={listItem}>🤝 Schedule a kickoff meeting with your chosen contractor</Text>
      </Section>

      <Hr style={sectionDivider} />

      {/* Tips Section */}
      <Section>
        <Text style={sectionTitle}>💡 Tips for Choosing the Right Bid</Text>
        <Text style={listItem}>💵 Consider value, not just the lowest price</Text>
        <Text style={listItem}>📅 Check if the timeline works for your schedule</Text>
        <Text style={listItem}>⭐ Review contractor ratings and past work</Text>
        <Text style={listItem}>📞 Communication style and responsiveness matter</Text>
        <Text style={listItem}>🔍 Look for detailed, transparent breakdowns</Text>
      </Section>

      {/* Secondary CTA */}
      <Section style={ctaSection}>
        <Text style={secondaryCtaText}>
          Want to see your project details?
        </Text>
        <EmailButton href={requestUrl} variant="secondary">
          View Project Page
        </EmailButton>
      </Section>
    </BaseEmailTemplate>
  )
}

// Styles
const heroSection = {
  textAlign: 'center' as const,
  padding: '0 0 32px 0',
}

const heroTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 8px 0',
}

const heroSubtitle = {
  fontSize: '16px',
  color: '#6b7280',
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

const contractorText = {
  fontSize: '16px',
  color: '#111827',
  fontWeight: '600',
  margin: '0',
}

const totalAmountText = {
  fontSize: '20px',
  color: '#059669',
  fontWeight: 'bold',
  margin: '0',
}

const costBreakdownSection = {
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
}

const costRow = {
  margin: '0 0 8px 0',
}

const costLabelColumn = {
  width: '70%',
}

const costValueColumn = {
  width: '30%',
  textAlign: 'right' as const,
}

const costLabel = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
}

const costValue = {
  fontSize: '14px',
  color: '#111827',
  fontWeight: '600',
  margin: '0',
}

const costDivider = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
}

const totalRow = {
  margin: '0',
}

const totalLabel = {
  fontSize: '16px',
  color: '#111827',
  fontWeight: 'bold',
  margin: '0',
}

const totalValue = {
  fontSize: '18px',
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
  margin: '0 0 8px 0',
  lineHeight: '22px',
}
