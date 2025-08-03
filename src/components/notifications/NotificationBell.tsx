'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '@/lib/services/factory'
import { Notification } from '@/lib/types'
import { NotificationCenter } from './NotificationCenter'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const notificationService = ServiceFactory.getNotificationService()

  useEffect(() => {
    if (user) {
      loadUnreadCount()
      
      // Subscribe to real-time notifications
      const unsubscribe = notificationService.subscribeToNotifications(user.id, (notification) => {
        setUnreadCount(prev => prev + 1)
        
        // Show browser notification if supported and permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: notification.id,
            requireInteraction: notification.priority === 'high'
          })

          // Auto-close after 5 seconds for non-high priority notifications
          if (notification.priority !== 'high') {
            setTimeout(() => browserNotification.close(), 5000)
          }
        }
      })

      // Request notification permission if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission)
        })
      }

      return unsubscribe
    }
  }, [user])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadUnreadCount = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const count = await notificationService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBellClick = () => {
    setIsOpen(!isOpen)
  }

  const handleNotificationRead = () => {
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleAllRead = () => {
    setUnreadCount(0)
  }

  if (!user) {
    return null
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-full transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        disabled={loading}
      >
        <svg 
          className={`w-6 h-6 ${loading ? 'animate-pulse' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <NotificationCenter
            userId={user.id}
            onNotificationRead={handleNotificationRead}
            onAllRead={handleAllRead}
            onClose={() => setIsOpen(false)}
            compact={true}
          />
        </div>
      )}
    </div>
  )
}

// Hook for managing notifications with the new service
export function useNotifications() {
  const { user } = useAuth()
  const notificationService = ServiceFactory.getNotificationService()

  const sendCropMilestoneNotification = async (cropName: string, milestone: string) => {
    if (!user) return
    return await notificationService.sendCropMilestoneNotification(user.id, cropName, milestone)
  }

  const sendWeatherAlertNotification = async (alertType: string, message: string) => {
    if (!user) return
    return await notificationService.sendWeatherAlertNotification(user.id, alertType, message)
  }

  const sendXPRewardNotification = async (xpAmount: number, reason: string) => {
    if (!user) return
    return await notificationService.sendXPRewardNotification(user.id, xpAmount, reason)
  }

  const sendClanInviteNotification = async (clanName: string, inviterName: string) => {
    if (!user) return
    return await notificationService.sendClanInviteNotification(user.id, clanName, inviterName)
  }

  const sendMarketPriceAlertNotification = async (cropType: string, price: number) => {
    if (!user) return
    return await notificationService.sendMarketPriceAlertNotification(user.id, cropType, price)
  }

  const sendPestBattleNotification = async (pestName: string, won: boolean, xpEarned: number) => {
    if (!user) return
    return await notificationService.sendPestBattleNotification(user.id, pestName, won, xpEarned)
  }

  const scheduleNotification = async (
    notification: Omit<Notification, 'id' | 'created_at' | 'read'>,
    scheduledFor: Date
  ) => {
    if (!user) return
    return await notificationService.scheduleNotification(user.id, notification, scheduledFor)
  }

  const getNotificationPreferences = async () => {
    if (!user) return null
    return await notificationService.getNotificationPreferences(user.id)
  }

  const updateNotificationPreferences = async (preferences: any) => {
    if (!user) return null
    return await notificationService.updateNotificationPreferences(user.id, preferences)
  }

  return {
    sendCropMilestoneNotification,
    sendWeatherAlertNotification,
    sendXPRewardNotification,
    sendClanInviteNotification,
    sendMarketPriceAlertNotification,
    sendPestBattleNotification,
    scheduleNotification,
    getNotificationPreferences,
    updateNotificationPreferences
  }
}