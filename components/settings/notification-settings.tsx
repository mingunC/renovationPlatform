'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

export function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(false)
  const [smsEnabled, setSmsEnabled] = useState(false)

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      setPushEnabled(permission === 'granted')
    }
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>🔔 Push Notifications</CardTitle>
          <CardDescription>
            Get instant notifications in your browser for important updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="push-notifications"
                checked={pushEnabled}
                onCheckedChange={(checked) => setPushEnabled(checked as boolean)}
              />
              <div>
                <Label htmlFor="push-notifications" className="text-sm font-medium cursor-pointer">
                  Enable browser notifications
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Receive real-time notifications for new bids, messages, and project updates
                </p>
              </div>
            </div>
            {!pushEnabled && (
              <Button 
                onClick={requestPushPermission}
                variant="outline"
                size="sm"
              >
                Enable
              </Button>
            )}
          </div>

          {pushEnabled && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Push notifications are enabled
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You'll receive instant notifications for important updates
              </p>
            </div>
          )}

          {typeof window !== 'undefined' && !('Notification' in window) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium text-yellow-800">
                  Push notifications not supported
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Your browser doesn't support push notifications. Consider using a modern browser for the best experience.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>📱 SMS Notifications</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Coming Soon
                </Badge>
              </CardTitle>
              <CardDescription>
                Get text message alerts for urgent updates and reminders
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📲</div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                SMS Notifications Coming Soon!
              </h3>
              <p className="text-blue-700 mb-4">
                We're working hard to bring you SMS notifications for urgent updates like:
              </p>
              <ul className="text-sm text-blue-700 text-left space-y-1 max-w-md mx-auto">
                <li>• Bid acceptance notifications</li>
                <li>• Project deadline reminders</li>
                <li>• Payment confirmations</li>
                <li>• Emergency project updates</li>
              </ul>
            </div>
          </div>

          {/* Future SMS settings placeholder */}
          <div className="opacity-50 pointer-events-none">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="sms-urgent"
                  checked={false}
                  disabled
                />
                <div>
                  <Label htmlFor="sms-urgent" className="text-sm font-medium">
                    Urgent project updates
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Critical updates that require immediate attention
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="sms-payments"
                  checked={false}
                  disabled
                />
                <div>
                  <Label htmlFor="sms-payments" className="text-sm font-medium">
                    Payment notifications
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Payment confirmations and invoice updates
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="sms-reminders"
                  checked={false}
                  disabled
                />
                <div>
                  <Label htmlFor="sms-reminders" className="text-sm font-medium">
                    Project reminders
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Deadline reminders and milestone notifications
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Waitlist signup */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Want to be notified when SMS features are available?
              </div>
              <Button variant="outline" size="sm" disabled>
                Join Waitlist
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>🔕 In-App Notifications</CardTitle>
          <CardDescription>
            Manage notifications you see while using the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="sound-notifications"
                defaultChecked={true}
              />
              <div>
                <Label htmlFor="sound-notifications" className="text-sm font-medium cursor-pointer">
                  Sound notifications
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Play sounds when you receive new notifications
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="desktop-alerts"
                defaultChecked={true}
              />
              <div>
                <Label htmlFor="desktop-alerts" className="text-sm font-medium cursor-pointer">
                  Desktop alerts
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Show notification banners while using the platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="badge-counts"
                defaultChecked={true}
              />
              <div>
                <Label htmlFor="badge-counts" className="text-sm font-medium cursor-pointer">
                  Badge counts
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Show notification counts on navigation items
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button variant="outline" className="w-full">
              Reset to Default Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>⏰ Notification Schedule</CardTitle>
          <CardDescription>
            Control when you receive notifications to avoid interruptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🌙 Quiet Hours</h4>
            <p className="text-sm text-gray-600 mb-3">
              Set quiet hours to pause non-urgent notifications during your downtime
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Start Time</Label>
                <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="22:00">10:00 PM</option>
                  <option value="23:00">11:00 PM</option>
                  <option value="00:00">12:00 AM</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium">End Time</Label>
                <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="07:00">7:00 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Emergency notifications and critical project updates will still come through during quiet hours
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
