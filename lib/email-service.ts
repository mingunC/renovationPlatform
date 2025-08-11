import { render } from '@react-email/render'
import { Resend } from 'resend'
import { NewRequestEmail } from '@/components/emails/NewRequestEmail'
import { NewBidEmail } from '@/components/emails/NewBidEmail'
import { BidAcceptedEmail } from '@/components/emails/BidAcceptedEmail'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

export interface EmailQueue {
  id: string
  type: string
  recipient: string
  data: any
  attempts: number
  status: 'pending' | 'sent' | 'failed'
  createdAt: Date
  lastAttempt?: Date
  error?: string
}

// In-memory queue for development (in production, use Redis or database)
const emailQueue: EmailQueue[] = []

export class EmailService {
  private static instance: EmailService
  private processingQueue = false

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendNewRequestEmail(
    contractorEmail: string,
    contractorName: string,
    requestData: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const html = await render(NewRequestEmail({
        contractorName,
        request: requestData,
      }))

      const text = this.generateTextFromRequest(contractorName, requestData)

      const result = await resend.emails.send({
        from: 'Renovate Platform <notifications@renovateplatform.com>',
        to: contractorEmail,
        subject: `🏗️ New ${this.formatCategory(requestData.category)} renovation opportunity in ${requestData.postal_code}`,
        html,
        text,
        headers: {
          'X-Entity-Ref-ID': requestData.id,
        },
        tags: [
          { name: 'category', value: 'new-request' },
          { name: 'project-type', value: requestData.category.toLowerCase() },
        ],
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to send new request email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async sendNewBidEmail(
    customerEmail: string,
    customerName: string,
    bidData: any,
    contractorData: any,
    requestData: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const html = await render(NewBidEmail({
        customerName,
        bid: bidData,
        contractor: contractorData,
        request: requestData,
      }))

      const text = this.generateTextFromBid(customerName, bidData, contractorData, requestData)

      const result = await resend.emails.send({
        from: 'Renovate Platform <notifications@renovateplatform.com>',
        to: customerEmail,
        subject: `💼 New bid received for your ${this.formatCategory(requestData.category)} renovation`,
        html,
        text,
        headers: {
          'X-Entity-Ref-ID': bidData.id,
        },
        tags: [
          { name: 'category', value: 'new-bid' },
          { name: 'project-type', value: requestData.category.toLowerCase() },
        ],
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to send new bid email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async sendBidAcceptedEmail(
    contractorEmail: string,
    contractorName: string,
    bidData: any,
    customerData: any,
    requestData: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const html = await render(BidAcceptedEmail({
        contractorName,
        bid: bidData,
        customer: customerData,
        request: requestData,
      }))

      const text = this.generateTextFromAcceptance(contractorName, bidData, customerData, requestData)

      const result = await resend.emails.send({
        from: 'Renovate Platform <notifications@renovateplatform.com>',
        to: contractorEmail,
        subject: `🎉 Congratulations! Your bid has been accepted`,
        html,
        text,
        headers: {
          'X-Entity-Ref-ID': bidData.id,
        },
        tags: [
          { name: 'category', value: 'bid-accepted' },
          { name: 'project-type', value: requestData.category.toLowerCase() },
        ],
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to send bid accepted email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Queue system for reliability
  async queueEmail(
    type: string,
    recipient: string,
    data: any
  ): Promise<string> {
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const queueItem: EmailQueue = {
      id: emailId,
      type,
      recipient,
      data,
      attempts: 0,
      status: 'pending',
      createdAt: new Date(),
    }

    emailQueue.push(queueItem)
    
    // Process queue if not already processing
    if (!this.processingQueue) {
      this.processQueue()
    }

    return emailId
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue) return
    
    this.processingQueue = true

    try {
      const pendingEmails = emailQueue.filter(email => 
        email.status === 'pending' && email.attempts < 3
      )

      for (const email of pendingEmails) {
        await this.processQueuedEmail(email)
        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error('Error processing email queue:', error)
    } finally {
      this.processingQueue = false
    }
  }

  private async processQueuedEmail(email: EmailQueue): Promise<void> {
    email.attempts++
    email.lastAttempt = new Date()

    try {
      let result: { success: boolean; error?: string }

      switch (email.type) {
        case 'NEW_REQUEST':
          result = await this.sendNewRequestEmail(
            email.recipient,
            email.data.contractorName,
            email.data.request
          )
          break
        case 'NEW_BID':
          result = await this.sendNewBidEmail(
            email.recipient,
            email.data.customerName,
            email.data.bid,
            email.data.contractor,
            email.data.request
          )
          break
        case 'BID_ACCEPTED':
          result = await this.sendBidAcceptedEmail(
            email.recipient,
            email.data.contractorName,
            email.data.bid,
            email.data.customer,
            email.data.request
          )
          break
        default:
          throw new Error(`Unknown email type: ${email.type}`)
      }

      if (result.success) {
        email.status = 'sent'
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error) {
      email.error = error instanceof Error ? error.message : 'Unknown error'
      
      if (email.attempts >= 3) {
        email.status = 'failed'
        console.error(`Failed to send email ${email.id} after 3 attempts:`, email.error)
      }
    }
  }

  // Helper methods for text generation
  private generateTextFromRequest(contractorName: string, request: any): string {
    return `
New Renovation Opportunity

Hello ${contractorName},

A new ${this.formatCategory(request.category)} renovation request has been posted in your service area.

Project Details:
- Category: ${this.formatCategory(request.category)}
- Budget: ${this.formatBudgetRange(request.budget_range)}
- Timeline: ${this.formatTimeline(request.timeline)}
- Location: ${request.postal_code}
- Customer: ${request.customer.name}
- Posted: ${new Date(request.created_at).toLocaleDateString()}

Description: ${request.description}

Submit your bid: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/contractor/bid/${request.id}

Best regards,
The Renovate Platform Team
`
  }

  private generateTextFromBid(customerName: string, bid: any, contractor: any, request: any): string {
    const contractorName = contractor.business_name || contractor.user.name
    
    return `
New Bid Received

Hello ${customerName},

You've received a new bid for your ${this.formatCategory(request.category)} renovation project.

Bid Summary:
- Contractor: ${contractorName}
- Total Amount: ${this.formatCurrency(bid.total_amount)}
- Timeline: ${bid.timeline_weeks} weeks
- Start Date: ${new Date(bid.start_date).toLocaleDateString()}

Cost Breakdown:
- Labor: ${this.formatCurrency(bid.labor_cost)}
- Materials: ${this.formatCurrency(bid.material_cost)}
- Permits & Fees: ${this.formatCurrency(bid.permit_cost)}
- Disposal: ${this.formatCurrency(bid.disposal_cost)}

What's Included: ${bid.included_items}

View all bids: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/customer/compare

Best regards,
The Renovate Platform Team
`
  }

  private generateTextFromAcceptance(contractorName: string, bid: any, customer: any, request: any): string {
    return `
Congratulations! Your Bid Has Been Accepted

Hello ${contractorName},

Great news! ${customer.name} has accepted your bid for their ${this.formatCategory(request.category)} renovation project.

Project Details:
- Your Winning Bid: ${this.formatCurrency(bid.total_amount)}
- Timeline: ${bid.timeline_weeks} weeks
- Start Date: ${new Date(bid.start_date).toLocaleDateString()}
- Location: ${request.postal_code}

Customer Information:
- Name: ${customer.name}
- Email: ${customer.email}
- Address: ${request.address}

Next Steps:
1. Contact the customer within 24 hours
2. Schedule a kickoff meeting
3. Confirm project timeline and start date
4. Begin work as agreed upon

View project details: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/contractor/projects/${request.id}

Thank you for using Renovate Platform!

Best regards,
The Renovate Platform Team
`
  }

  // Utility methods
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  private formatCategory(category: string): string {
    return category.charAt(0) + category.slice(1).toLowerCase()
  }

  private formatBudgetRange(range: string): string {
    switch (range) {
      case 'UNDER_50K': return 'Under $50,000'
      case 'RANGE_50_100K': return '$50,000 - $100,000'
      case 'OVER_100K': return 'Over $100,000'
      default: return range
    }
  }

  private formatTimeline(timeline: string): string {
    switch (timeline) {
      case 'ASAP': return 'ASAP'
      case 'WITHIN_1MONTH': return 'Within 1 month'
      case 'WITHIN_3MONTHS': return 'Within 3 months'
      case 'PLANNING': return 'Just planning'
      default: return timeline
    }
  }

  // Simple notification method for basic emails
  async sendSimpleNotification(
    to: string,
    subject: string,
    text: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await resend.emails.send({
        from: 'Renovate Platform <notifications@renovateplatform.com>',
        to,
        subject,
        text,
        html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to send simple notification:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Queue management methods
  getQueueStatus(): { pending: number; sent: number; failed: number } {
    return {
      pending: emailQueue.filter(e => e.status === 'pending').length,
      sent: emailQueue.filter(e => e.status === 'sent').length,
      failed: emailQueue.filter(e => e.status === 'failed').length,
    }
  }

  retryFailedEmails(): void {
    const failedEmails = emailQueue.filter(e => e.status === 'failed')
    failedEmails.forEach(email => {
      email.status = 'pending'
      email.attempts = 0
      email.error = undefined
    })
    
    if (failedEmails.length > 0 && !this.processingQueue) {
      this.processQueue()
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()
