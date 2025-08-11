import { BaseEmailTemplate } from './BaseEmailTemplate'

interface BiddingStartedEmailProps {
  contractorName: string
  businessName?: string
  projectDetails: {
    category: string
    budget_range: string
    postal_code: string
    address: string
    description: string
    customer_name: string
  }
  biddingEndDate: string
  projectId: string
  participatingContractors: number
}

export function BiddingStartedEmail({
  contractorName,
  businessName,
  projectDetails,
  biddingEndDate,
  projectId,
  participatingContractors,
}: BiddingStartedEmailProps) {
  const formatCategory = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase()
  }

  const formatBudgetRange = (range: string) => {
    switch (range) {
      case 'UNDER_50K': return 'Under $50,000'
      case 'RANGE_50_100K': return '$50,000 - $100,000'
      case 'OVER_100K': return 'Over $100,000'
      default: return range
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDaysUntilDeadline = (dateString: string) => {
    const deadline = new Date(dateString)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysLeft = getDaysUntilDeadline(biddingEndDate)

  return (
    <BaseEmailTemplate
      title="🎯 Bidding Now Open - Submit Your Quote"
      previewText={`${formatCategory(projectDetails.category)} project bidding is now open. ${daysLeft} days remaining.`}
    >
      <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#1f2937', fontSize: '24px', marginBottom: '8px' }}>
            🎯 Bidding Is Now Open!
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: '0' }}>
            The inspection is complete. Time to submit your competitive bid.
          </p>
        </div>

        {/* Contractor Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '16px', margin: '0' }}>
            Hello {contractorName}{businessName ? ` from ${businessName}` : ''},
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
            Thank you for participating in the inspection. The bidding process is now officially open!
          </p>
        </div>

        {/* Bidding Status */}
        <div style={{ 
          backgroundColor: '#dbeafe', 
          border: '1px solid #bfdbfe', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏰</div>
          <h2 style={{ color: '#1e40af', fontSize: '20px', marginBottom: '8px' }}>
            {daysLeft} Days Remaining
          </h2>
          <p style={{ color: '#1e40af', fontSize: '16px', fontWeight: 'bold' }}>
            Bidding closes: {formatDate(biddingEndDate)}
          </p>
          <p style={{ color: '#374151', fontSize: '14px', marginTop: '12px' }}>
            {participatingContractors} contractors are competing for this project
          </p>
        </div>

        {/* Project Summary */}
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '24px' 
        }}>
          <h3 style={{ color: '#1f2937', fontSize: '18px', marginBottom: '16px' }}>
            📋 Project Summary
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <strong style={{ color: '#374151' }}>Category:</strong>
              <div style={{ color: '#6b7280' }}>
                {formatCategory(projectDetails.category)}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Budget:</strong>
              <div style={{ color: '#6b7280' }}>
                {formatBudgetRange(projectDetails.budget_range)}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Location:</strong>
              <div style={{ color: '#6b7280' }}>
                {projectDetails.postal_code}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Customer:</strong>
              <div style={{ color: '#6b7280' }}>
                {projectDetails.customer_name}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          border: '2px solid #10b981', 
          borderRadius: '8px', 
          padding: '24px', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#047857', fontSize: '20px', marginBottom: '16px' }}>
            🚀 Ready to Submit Your Bid?
          </h2>
          
          <p style={{ color: '#065f46', marginBottom: '20px' }}>
            Based on your inspection, provide a detailed and competitive quote to win this project.
          </p>
          
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL}/contractor/bid/${projectId}`}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '18px',
              display: 'inline-block',
            }}
          >
            📝 Submit Your Bid Now
          </a>
        </div>

        {/* Bidding Tips */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#374151', fontSize: '16px', marginBottom: '12px' }}>
            💡 Tips for a Winning Bid
          </h3>
          <ul style={{ color: '#6b7280', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li><strong>Be Detailed:</strong> Break down labor, materials, and additional costs clearly</li>
            <li><strong>Be Realistic:</strong> Provide accurate timelines based on your inspection</li>
            <li><strong>Be Competitive:</strong> {participatingContractors - 1} other contractors are bidding</li>
            <li><strong>Be Professional:</strong> Include what's included and excluded in your quote</li>
            <li><strong>Be Prompt:</strong> Early submissions often get more attention from customers</li>
          </ul>
        </div>

        {/* Inspection Reminder */}
        <div style={{ 
          backgroundColor: '#fef3c7', 
          border: '1px solid #fcd34d', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '24px' 
        }}>
          <p style={{ color: '#92400e', margin: '0', fontSize: '14px' }}>
            <strong>📋 Inspection Notes:</strong> Use the insights from your site visit to provide the most accurate quote possible. 
            Consider any specific challenges or opportunities you identified during the inspection.
          </p>
        </div>

        {/* Competition Info */}
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '24px' 
        }}>
          <p style={{ color: '#991b1b', margin: '0', fontSize: '14px' }}>
            <strong>⚡ Competition Alert:</strong> {participatingContractors} contractors are competing for this project. 
            Make sure your bid stands out with competitive pricing and detailed project planning.
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          paddingTop: '20px', 
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p>
            Questions about bidding? Contact support at{' '}
            <a href="mailto:support@renovateplatform.com" style={{ color: '#2563eb' }}>
              support@renovateplatform.com
            </a>
          </p>
          <p style={{ marginTop: '8px' }}>
            <a 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/contractor/dashboard`}
              style={{ color: '#2563eb', textDecoration: 'none' }}
            >
              View All Projects →
            </a>
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
