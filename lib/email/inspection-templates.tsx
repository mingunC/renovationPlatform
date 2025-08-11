import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email template for inspection scheduled notification
interface InspectionScheduledEmailProps {
  contractorName: string;
  requestId: string;
  address: string;
  inspectionDate: string;
  category: string;
  description: string;
}

const InspectionScheduledEmail = ({
  contractorName,
  requestId,
  address,
  inspectionDate,
  category,
  description,
}: InspectionScheduledEmailProps) => (
  <Html>
    <Head />
    <Preview>Site Inspection Scheduled - {address}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Site Inspection Invitation</Heading>
        
        <Text style={text}>Hi {contractorName},</Text>
        
        <Text style={text}>
          A new renovation project matching your expertise has scheduled a site inspection.
          Please confirm your participation.
        </Text>

        <Section style={infoSection}>
          <Text style={infoLabel}>Property Address:</Text>
          <Text style={infoValue}>{address}</Text>
          
          <Text style={infoLabel}>Inspection Date:</Text>
          <Text style={infoValue}>{inspectionDate}</Text>
          
          <Text style={infoLabel}>Category:</Text>
          <Text style={infoValue}>{category}</Text>
          
          <Text style={infoLabel}>Project Description:</Text>
          <Text style={infoValue}>{description}</Text>
        </Section>

        <Section style={buttonContainer}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_APP_URL}/contractor/dashboard?inspection=${requestId}`}
          >
            Confirm Participation
          </Button>
        </Section>

        <Text style={footerText}>
          Note: Only contractors who participate in the site inspection will be eligible to submit bids.
          Bidding will open immediately after the inspection date.
        </Text>
      </Container>
    </Body>
  </Html>
);

// Email template for bidding open notification
interface BiddingOpenEmailProps {
  contractorName: string;
  requestId: string;
  address: string;
  biddingEndDate: string;
}

const BiddingOpenEmail = ({
  contractorName,
  requestId,
  address,
  biddingEndDate,
}: BiddingOpenEmailProps) => (
  <Html>
    <Head />
    <Preview>Bidding Now Open - {address}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Bidding is Now Open!</Heading>
        
        <Text style={text}>Hi {contractorName},</Text>
        
        <Text style={text}>
          The bidding period has started for the renovation project at {address}.
          Since you participated in the site inspection, you're eligible to submit your bid.
        </Text>

        <Section style={infoSection}>
          <Text style={infoLabel}>Bidding Deadline:</Text>
          <Text style={infoValue}>{biddingEndDate}</Text>
        </Section>

        <Section style={buttonContainer}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_APP_URL}/contractor/dashboard/bids?request=${requestId}`}
          >
            Submit Your Bid
          </Button>
        </Section>

        <Text style={footerText}>
          Don't miss this opportunity! Ensure your bid is submitted before the deadline.
        </Text>
      </Container>
    </Body>
  </Html>
);

// Send inspection scheduled email
export async function sendInspectionScheduledEmail(props: InspectionScheduledEmailProps & { to: string }) {
  const { to, ...emailProps } = props;
  
  try {
    const html = await render(<InspectionScheduledEmail {...emailProps} />);
    
    const { data, error } = await resend.emails.send({
      from: 'GTA Renovation Platform <notifications@gtarenovation.ca>',
      to,
      subject: `Site Inspection Scheduled - ${emailProps.address}`,
      html,
    });

    if (error) {
      console.error('Failed to send inspection email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

// Send bidding open email
export async function sendBiddingOpenEmail(props: BiddingOpenEmailProps & { to: string }) {
  const { to, ...emailProps } = props;
  
  try {
    const html = await render(<BiddingOpenEmail {...emailProps} />);
    
    const { data, error } = await resend.emails.send({
      from: 'GTA Renovation Platform <notifications@gtarenovation.ca>',
      to,
      subject: `Bidding Now Open - ${emailProps.address}`,
      html,
    });

    if (error) {
      console.error('Failed to send bidding email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '40px 0',
  padding: '0 48px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 48px',
};

const infoSection = {
  padding: '24px 48px',
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  margin: '24px 48px',
};

const infoLabel = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0 4px',
  fontWeight: '600',
};

const infoValue = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const buttonContainer = {
  padding: '24px 48px',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  padding: '0 48px',
};