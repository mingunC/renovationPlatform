'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Notification {
  id: string
  type: 'NEW_BID' | 'BID_ACCEPTED' | 'PROJECT_UPDATE'
  title: string
  message: string
  projectId?: string
  bidId?: string
  timestamp: Date
  isRead: boolean
}

interface RealtimeNotificationProps {
  customerId: string
  projectId?: string
}

export function RealtimeNotification({ customerId, projectId }: RealtimeNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // 기존 알림 로드
    loadNotifications()

    // Supabase Realtime 구독 설정
    const channel = supabase
      .channel('bids_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: projectId ? `request_id=eq.${projectId}` : undefined
        },
        (payload) => {
          console.log('New bid received:', payload)
          handleNewBid(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bids',
          filter: projectId ? `request_id=eq.${projectId}` : undefined
        },
        (payload) => {
          console.log('Bid updated:', payload)
          handleBidUpdate(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [customerId, projectId])

  const loadNotifications = async () => {
    try {
      // 고객의 프로젝트에 대한 최근 알림 로드
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('customer_id', customerId)
        .eq('project_id', projectId || '')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading notifications:', error)
        return
      }

      const formattedNotifications: Notification[] = (data || []).map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        projectId: item.project_id,
        bidId: item.bid_id,
        timestamp: new Date(item.created_at),
        isRead: item.is_read
      }))

      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.filter(n => !n.isRead).length)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const handleNewBid = (bidData: any) => {
    const newNotification: Notification = {
      id: `temp-${Date.now()}`,
      type: 'NEW_BID',
      title: '새로운 입찰이 도착했습니다!',
      message: `프로젝트에 새로운 입찰이 제출되었습니다. 금액: $${bidData.total_amount?.toLocaleString() || 'N/A'}`,
      projectId: bidData.request_id,
      bidId: bidData.id,
      timestamp: new Date(),
      isRead: false
    }

    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    // 브라우저 알림 표시
    if (Notification.permission === 'granted') {
      new Notification('새로운 입찰 도착!', {
        body: newNotification.message,
        icon: '/favicon.ico'
      })
    }
  }

  const handleBidUpdate = (bidData: any) => {
    if (bidData.status === 'ACCEPTED') {
      const newNotification: Notification = {
        id: `temp-${Date.now()}`,
        type: 'BID_ACCEPTED',
        title: '입찰이 승인되었습니다!',
        message: `축하합니다! 입찰이 승인되었습니다. 프로젝트 진행을 시작하세요.`,
        projectId: bidData.request_id,
        bidId: bidData.id,
        timestamp: new Date(),
        isRead: false
      }

      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // 데이터베이스에서 읽음 상태 업데이트
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // 데이터베이스에서 모든 알림을 읽음 상태로 업데이트
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('customer_id', customerId)
        .eq('project_id', projectId || '')

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return
      }

      // 로컬 상태 업데이트
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const requestNotificationPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  return (
    <div className="relative">
      {/* 알림 벨 아이콘 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* 알림 패널 */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">알림</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    모두 읽음
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>새로운 알림이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Alert
                    key={notification.id}
                    className={`cursor-pointer transition-colors ${
                      notification.isRead 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <AlertDescription className="text-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`font-medium ${
                            notification.isRead ? 'text-gray-700' : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs mt-1 ${
                            notification.isRead ? 'text-gray-500' : 'text-blue-700'
                          }`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs mt-1 ${
                            notification.isRead ? 'text-gray-400' : 'text-blue-600'
                          }`}>
                            {notification.timestamp.toLocaleString('ko-KR')}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>

          {/* 브라우저 알림 권한 요청 */}
          {Notification.permission === 'default' && (
            <div className="p-4 border-t border-gray-200 bg-yellow-50">
              <p className="text-xs text-yellow-800 mb-2">
                실시간 알림을 받으려면 브라우저 알림을 허용해주세요.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={requestNotificationPermission}
                className="w-full text-xs"
              >
                알림 허용하기
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
