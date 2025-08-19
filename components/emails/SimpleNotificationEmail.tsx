import React from 'react'
import { SimpleEmailTemplate, SimpleHeading, SimpleText, SimpleButton } from './SimpleEmailTemplate'

interface SimpleNotificationEmailProps {
  title: string
  message: string
  actionUrl?: string
  actionText?: string
}

export function SimpleNotificationEmail({ 
  title, 
  message, 
  actionUrl, 
  actionText 
}: SimpleNotificationEmailProps) {
  return (
    <SimpleEmailTemplate 
      title={title}
      previewText={message}
    >
      <SimpleHeading>{title}</SimpleHeading>
      
      <SimpleText>{message}</SimpleText>
      
      {actionUrl && actionText && (
        <SimpleButton href={actionUrl}>
          {actionText}
        </SimpleButton>
      )}
      
      <SimpleText>
        이 이메일에 대해 질문이 있으시면 support@renovateplatform.com으로 연락해주세요.
      </SimpleText>
    </SimpleEmailTemplate>
  )
}

export default SimpleNotificationEmail
