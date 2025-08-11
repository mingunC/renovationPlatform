import { Metadata } from 'next'
import { EmailPreferences } from '@/components/settings/email-preferences'
import { NotificationSettings } from '@/components/settings/notification-settings'

export const metadata: Metadata = {
  title: 'Settings | Renovate Platform',
  description: 'Manage your account settings and notification preferences',
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your notification preferences and account settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Email Preferences */}
          <EmailPreferences />

          {/* Notification Settings */}
          <NotificationSettings />
        </div>
      </div>
    </div>
  )
}
