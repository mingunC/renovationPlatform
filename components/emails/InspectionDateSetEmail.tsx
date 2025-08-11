import { BaseEmailTemplate } from './BaseEmailTemplate'

interface InspectionDateSetEmailProps {
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
  inspectionDate: string
  responseDeadline: string
  projectId: string
}

export function InspectionDateSetEmail({
  contractorName,
  businessName,
  projectDetails,
  inspectionDate,
  responseDeadline,
  projectId,
}: InspectionDateSetEmailProps) {
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

  return (
    <BaseEmailTemplate
      title="🏠 New Inspection Opportunity Available"
      previewText={`${formatCategory(projectDetails.category)} project inspection scheduled for ${formatDate(inspectionDate)}`}
    >
      <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#1f2937', fontSize: '24px', marginBottom: '8px' }}>
            🏠 New Inspection Opportunity
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: '0' }}>
            A new renovation project is available for inspection in your service area
          </p>
        </div>

        {/* Contractor Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '16px', margin: '0' }}>
            Hello {contractorName}{businessName ? ` from ${businessName}` : ''},
          </p>
        </div>

        {/* Project Details */}
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '24px' 
        }}>
          <h2 style={{ color: '#1f2937', fontSize: '18px', marginBottom: '16px' }}>
            📋 Project Details
          </h2>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Category:</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>
              {formatCategory(projectDetails.category)} Renovation
            </span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Budget Range:</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>
              {formatBudgetRange(projectDetails.budget_range)}
            </span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Location:</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>
              {projectDetails.postal_code}
            </span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Customer:</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>
              {projectDetails.customer_name}
            </span>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <strong style={{ color: '#374151' }}>Description:</strong>
            <p style={{ 
              marginTop: '8px', 
              color: '#6b7280', 
              lineHeight: '1.5',
              backgroundColor: '#ffffff',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0'
            }}>
              {projectDetails.description}
            </p>
          </div>
        </div>

        {/* Inspection Schedule */}
        <div style={{ 
          backgroundColor: '#dbeafe', 
          border: '1px solid #bfdbfe', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '24px' 
        }}>
          <h2 style={{ color: '#1e40af', fontSize: '18px', marginBottom: '16px' }}>
            📅 Inspection Schedule
          </h2>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#1e40af' }}>Inspection Date & Time:</strong>
            <div style={{ 
              marginTop: '8px', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#1e40af' 
            }}>
              {formatDate(inspectionDate)}
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <strong style={{ color: '#1e40af' }}>Address:</strong>
            <div style={{ marginTop: '4px', color: '#1e40af' }}>
              {projectDetails.address}
            </div>
          </div>
        </div>

        {/* Action Required */}
        <div style={{ 
          backgroundColor: '#fef3c7', 
          border: '1px solid #fcd34d', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '24px' 
        }}>
          <h2 style={{ color: '#92400e', fontSize: '18px', marginBottom: '16px' }}>
            ⚠️ Action Required
          </h2>
          
          <p style={{ color: '#92400e', marginBottom: '16px' }}>
            Please confirm your participation in this inspection by{' '}
            <strong>{formatDate(responseDeadline)}</strong>
          </p>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/contractor/inspection-interest?request_id=${projectId}&participate=true`}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
              }}
            >
              ✅ I Will Participate
            </a>
            
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/contractor/inspection-interest?request_id=${projectId}&participate=false`}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
              }}
            >
              ❌ Cannot Participate
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#374151', fontSize: '16px', marginBottom: '12px' }}>
            📝 What Happens Next?
          </h3>
          <ol style={{ color: '#6b7280', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li>Confirm your participation using the buttons above</li>
            <li>If participating, attend the scheduled inspection</li>
            <li>After inspection, you'll have 7 days to submit your bid</li>
            <li>Customer will review all bids and select their preferred contractor</li>
          </ol>
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
            Need help? Contact our support team at{' '}
            <a href="mailto:support@renovateplatform.com" style={{ color: '#2563eb' }}>
              support@renovateplatform.com
            </a>
          </p>
          <p style={{ marginTop: '8px' }}>
            <a 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/contractor/dashboard`}
              style={{ color: '#2563eb', textDecoration: 'none' }}
            >
              View in Dashboard →
            </a>
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
