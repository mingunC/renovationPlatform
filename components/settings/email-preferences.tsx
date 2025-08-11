'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

interface EmailPreference {
  id: string
  label: string
  description: string
  enabled: boolean
  category: 'requests' | 'bids' | 'projects' | 'marketing'
}

export function EmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      // For now, use default preferences since we don't have the backend yet
      const defaultPreferences: EmailPreference[] = [
        {
          id: 'new_requests',
          label: 'New Project Requests',
          description: 'Get notified when new renovation requests match your expertise',
          enabled: true,
          category: 'requests',
        },
        {
          id: 'new_bids',
          label: 'New Bid Notifications',
          description: 'Get notified when contractors submit bids on your projects',
          enabled: true,
          category: 'bids',
        },
        {
          id: 'bid_updates',
          label: 'Bid Status Updates',
          description: 'Get notified when your bids are accepted or rejected',
          enabled: true,
          category: 'bids',
        },
        {
          id: 'project_updates',
          label: 'Project Updates',
          description: 'Get notified about important project milestones and changes',
          enabled: true,
          category: 'projects',
        },
        {
          id: 'payment_notifications',
          label: 'Payment Notifications',
          description: 'Get notified about payment processing and receipts',
          enabled: true,
          category: 'projects',
        },
        {
          id: 'platform_updates',
          label: 'Platform Updates',
          description: 'Get notified about new features and platform announcements',
          enabled: false,
          category: 'marketing',
        },
        {
          id: 'weekly_digest',
          label: 'Weekly Digest',
          description: 'Receive a weekly summary of your activity and opportunities',
          enabled: false,
          category: 'marketing',
        },
      ]

      setPreferences(defaultPreferences)
    } catch (error) {
      console.error('Error loading preferences:', error)
      setMessage({ type: 'error', text: 'Failed to load email preferences' })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = (id: string, enabled: boolean) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled } : pref
      )
    )
  }

  const savePreferences = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // TODO: Implement API call to save preferences
      // const response = await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email_preferences: preferences }),
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setMessage({ type: 'success', text: 'Email preferences saved successfully!' })
    } catch (error) {
      console.error('Error saving preferences:', error)
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'requests': return '📋'
      case 'bids': return '💼'
      case 'projects': return '🏗️'
      case 'marketing': return '📢'
      default: return '📧'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'requests': return 'Project Requests'
      case 'bids': return 'Bid Management'
      case 'projects': return 'Project Updates'
      case 'marketing': return 'Marketing & Updates'
      default: return 'General'
    }
  }

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = []
    }
    acc[pref.category].push(pref)
    return acc
  }, {} as Record<string, EmailPreference[]>)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📧 Email Preferences</CardTitle>
          <CardDescription>Loading your email notification settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📧 Email Preferences</CardTitle>
        <CardDescription>
          Choose which email notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {Object.entries(groupedPreferences).map(([category, prefs]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <span>{getCategoryIcon(category)}</span>
              <span>{getCategoryName(category)}</span>
            </h3>
            
            <div className="space-y-4 pl-6">
              {prefs.map((preference) => (
                <div key={preference.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={preference.id}
                    checked={preference.enabled}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange(preference.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={preference.id} 
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {preference.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {preference.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              You can change these preferences at any time
            </div>
            <Button 
              onClick={savePreferences}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </div>

        {/* Unsubscribe Information */}
        <div className="pt-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📋 Important Information</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Essential notifications (like security alerts) cannot be disabled</li>
              <li>• Changes take effect immediately for new notifications</li>
              <li>• You can unsubscribe from all emails using the link in any email footer</li>
              <li>• Critical project communications will always be sent regardless of preferences</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
