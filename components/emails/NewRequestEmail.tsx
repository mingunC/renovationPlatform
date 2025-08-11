import React from 'react'
import {
  Section,
  Row,
  Column,
  Text,
  Hr,
} from '@react-email/components'
import { BaseEmailTemplate, EmailButton, EmailBadge } from './BaseEmailTemplate'

interface NewRequestEmailProps {
  contractorName: string
  request: {
    id: string
    category: string
    budget_range: string
    timeline: string
    postal_code: string
    address: string
    description: string
    created_at: string
    customer: {
      name: string
    }
  }
}

export function NewRequestEmail({ contractorName, request }: NewRequestEmailProps) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const bidUrl = `${baseUrl}/contractor/bid/${request.id}`
  const dashboardUrl = `${baseUrl}/contractor/dashboard`

  const formatBudgetRange = (range: string) => {
    switch (range) {
      case 'UNDER_50K': return 'Under $50,000'
      case 'RANGE_50_100K': return '$50,000 - $100,000'
      case 'OVER_100K': return 'Over $100,000'
      default: return range
    }
  }

  const formatTimeline = (timeline: string) => {
    switch (timeline) {
      case 'ASAP': return 'ASAP'
      case 'WITHIN_1MONTH': return 'Within 1 month'
      case 'WITHIN_3MONTHS': return 'Within 3 months'
      case 'PLANNING': return 'Just planning'
      default: return timeline
    }
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

  const getBudgetColor = (range: string) => {
    switch (range) {
      case 'UNDER_50K': return 'blue'
      case 'RANGE_50_100K': return 'green'
      case 'OVER_100K': return 'orange'
      default: return 'gray'
    }
  }

  const getTimelineColor = (timeline: string) => {
    switch (timeline) {
      case 'ASAP': return 'red'
      case 'WITHIN_1MONTH': return 'orange'
      case 'WITHIN_3MONTHS': return 'blue'
      case 'PLANNING': return 'gray'
      default: return 'gray'
    }
  }

  const previewText = `New ${formatCategory(request.category)} renovation opportunity in ${request.postal_code}`

  return (
    <BaseEmailTemplate previewText={previewText}>
      {/* Hero Section */}
      <Section style={heroSection}>
        <Text style={heroTitle}>
          {getCategoryIcon(request.category)} New Renovation Opportunity!
        </Text>
        <Text style={heroSubtitle}>
          A {formatCategory(request.category)} renovation project has been posted in your area
        </Text>
      </Section>

      {/* Greeting */}
      <Section>
        <Text style={greeting}>Hello {contractorName},</Text>
        <Text style={bodyText}>
          Great news! A new renovation request matches your expertise and service area. 
          This is a qualified lead from a homeowner ready to hire.
        </Text>
      </Section>

      {/* Project Summary Card */}
      <Section style={cardSection}>
        <Text style={cardTitle}>📋 Project Summary</Text>
        
        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Project Type:</Text>
          </Column>
          <Column>
            <Text style={valueText}>
              {getCategoryIcon(request.category)} {formatCategory(request.category)} Renovation
            </Text>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Budget Range:</Text>
          </Column>
          <Column>
            <EmailBadge color={getBudgetColor(request.budget_range)}>
              {formatBudgetRange(request.budget_range)}
            </EmailBadge>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Timeline:</Text>
          </Column>
          <Column>
            <EmailBadge color={getTimelineColor(request.timeline)}>
              {formatTimeline(request.timeline)}
            </EmailBadge>
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

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Customer:</Text>
          </Column>
          <Column>
            <Text style={valueText}>👤 {request.customer.name}</Text>
          </Column>
        </Row>

        <Row style={summaryRow}>
          <Column style={labelColumn}>
            <Text style={labelText}>Posted:</Text>
          </Column>
          <Column>
            <Text style={valueText}>
              🕒 {new Date(request.created_at).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Project Description */}
      <Section style={cardSection}>
        <Text style={cardTitle}>📝 Project Description</Text>
        <Text style={descriptionText}>{request.description}</Text>
      </Section>

      {/* Call to Action */}
      <Section style={ctaSection}>
        <EmailButton href={bidUrl}>
          Submit Your Bid
        </EmailButton>
        
        <Text style={ctaSubtext}>
          Don't wait! Early bids often get more attention from homeowners.
        </Text>
      </Section>

      <Hr style={sectionDivider} />

      {/* Why Bid Section */}
      <Section>
        <Text style={sectionTitle}>💡 Why bid on this project?</Text>
        <Text style={listItem}>✅ Pre-qualified customer ready to hire</Text>
        <Text style={listItem}>✅ Detailed project requirements provided</Text>
        <Text style={listItem}>✅ Direct communication with homeowner</Text>
        <Text style={listItem}>✅ Competitive but fair bidding process</Text>
        <Text style={listItem}>✅ Secure payment processing</Text>
      </Section>

      <Hr style={sectionDivider} />

      {/* Tips Section */}
      <Section>
        <Text style={sectionTitle}>🎯 Bidding Tips for Success</Text>
        <Text style={listItem}>📊 Provide detailed cost breakdowns</Text>
        <Text style={listItem}>⏰ Be realistic with your timeline estimates</Text>
        <Text style={listItem}>📷 Include photos of similar past work</Text>
        <Text style={listItem}>💬 Be clear about what's included/excluded</Text>
        <Text style={listItem}>🤝 Maintain professional communication</Text>
      </Section>

      {/* Secondary CTA */}
      <Section style={ctaSection}>
        <Text style={secondaryCtaText}>
          Not interested in this project?
        </Text>
        <EmailButton href={dashboardUrl} variant="secondary">
          Browse Other Opportunities
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

const descriptionText = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '22px',
  margin: '0',
  fontStyle: 'italic',
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
