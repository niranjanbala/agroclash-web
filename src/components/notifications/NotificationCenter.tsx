'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '@/lib/services/factory'
import { Notification } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface NotificationCenterProps {
  userId?: string
  onNotificationRead?: () => void
  onAllRead?: () => void
  onClose?: () => void
  compact?: boolean
  className?: string
}

export function NotificationCenter({ 
  userId, 
  onNotificationRead, 
  onAllRead, 
  onClose, 
  compact = false, 
  className = '' 
}: NotificationCenterProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const notificationService = ServiceFactory.getNotificationService()
  const currentUserId = userId || user?.id

  useEffect(() => {
    if (currentUserId) {
      loadNotifications()
    }
  }, [currentUserId, filter])

  const loadNotifications = async () => {
    if (!currentUserId) return

    try {
      setLoading(true)
      const allNotifications = await notificationService.getNotifications(currentUserId, compact ? 10 : 50)
      
      if (filter === 'unread') {
        setNotifications(allNotifications.filter(n => !n.read))
      } else {
        setNotifications(allNotifications)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      onNotificationRead?.()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return
    
    try {
      await notificationService.markAllAsRead(currentUserId)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      onAllRead?.()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (notification: Notification) => {
    const iconMap: { [key: string]: string } = {
      crop_milestone: '🌱',
      weather_alert: '🌦️',
      xp_reward: '⭐',
      clan_invite: '🏰',
      clan_update: '👥',
      market_alert: '💰',
      pest_battle: '⚔️',
      system: '📱'
    }
    return iconMap[notification.type] || '📱'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'crop_milestone': return 'bg-green-100 text-green-800'
      case 'weather_alert': return 'bg-blue-100 text-blue-800'
      case 'xp_reward': return 'bg-purple-100 text-purple-800'
      case 'clan_invite': return 'bg-yellow-100 text-yellow-800'
      case 'market_alert': return 'bg-orange-100 text-orange-800'
      case 'pest_battle': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!currentUserId) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔔</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view notifications</h3>
          <p className="text-gray-600">Get notified about your crops, weather alerts, and more!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold text-gray-900 ${compact ? 'text-lg' : 'text-xl'}`}>
            Notifications
          </h2>
          <div className="flex items-center space-x-2">
            {!compact && (
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm font-medium rounded-l-md border ${
                    filter === 'all'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-sm font-medium rounded-r-md border-l-0 border ${
                    filter === 'unread'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Unread
                </button>
              </div>
            )}
            
            <button
              onClick={loadNotifications}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Refresh notifications"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className={`overflow-y-auto ${compact ? 'max-h-80' : 'max-h-96'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 ${
                  !notification.read ? getPriorityColor(notification.priority) : 'border-l-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">{getNotificationIcon(notification)}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type.replace('_', ' ')}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-gray-600 mb-2 ${compact ? 'text-sm' : 'text-base'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.created_at)}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📭</span>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-sm text-gray-600">
              {filter === 'unread' 
                ? 'All caught up! Check back later for new updates.'
                : 'You\'ll see your notifications here as they arrive.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {notifications.filter(n => !n.read).length} unread
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Mark all as read
              </button>
              
              {!compact && (
                <button
                  onClick={() => window.location.href = '/notifications'}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}