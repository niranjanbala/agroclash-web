'use client'

import React, { useState } from 'react'
import { usePWA, usePushNotifications, useWebShare } from '@/hooks/usePWA'
import { useI18n } from '@/hooks/useI18n'

// PWA Install Banner
interface PWAInstallBannerProps {
  className?: string
  onInstall?: () => void
  onDismiss?: () => void
}

export function PWAInstallBanner({ className = '', onInstall, onDismiss }: PWAInstallBannerProps) {
  const { installPrompt, isInstalled, installApp } = usePWA()
  const { t } = useI18n()
  const [dismissed, setDismissed] = useState(false)

  if (!installPrompt || isInstalled || dismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      onInstall?.()
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">📱</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">
            {t('pwa.installTitle', 'Install AgroClash')}
          </h3>
          <p className="text-sm text-green-700 mt-1">
            {t('pwa.installDescription', 'Get the full app experience with offline access and push notifications.')}
          </p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleInstall}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {t('pwa.install', 'Install App')}
            </button>
            <button
              onClick={handleDismiss}
              className="text-green-600 px-4 py-2 rounded-md text-sm font-medium hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {t('common.dismiss', 'Dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// PWA Update Banner
interface PWAUpdateBannerProps {
  className?: string
  onUpdate?: () => void
}

export function PWAUpdateBanner({ className = '', onUpdate }: PWAUpdateBannerProps) {
  const { updateAvailable, updateApp } = usePWA()
  const { t } = useI18n()
  const [dismissed, setDismissed] = useState(false)

  if (!updateAvailable || dismissed) {
    return null
  }

  const handleUpdate = () => {
    updateApp()
    onUpdate?.()
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">🔄</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            {t('pwa.updateTitle', 'Update Available')}
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {t('pwa.updateDescription', 'A new version of AgroClash is available with improvements and bug fixes.')}
          </p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t('pwa.update', 'Update Now')}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t('common.later', 'Later')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Offline Indicator
export function OfflineIndicator({ className = '' }: { className?: string }) {
  const { isOnline } = usePWA()
  const { t } = useI18n()

  if (isOnline) return null

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center">
        <span className="text-yellow-600 mr-2">📴</span>
        <p className="text-sm text-yellow-800">
          {t('pwa.offline', 'You are currently offline. Some features may be limited.')}
        </p>
      </div>
    </div>
  )
}

// Push Notification Setup
interface PushNotificationSetupProps {
  vapidPublicKey: string
  onSubscribed?: (subscription: PushSubscription) => void
  className?: string
}

export function PushNotificationSetup({ 
  vapidPublicKey, 
  onSubscribed, 
  className = '' 
}: PushNotificationSetupProps) {
  const { permission, subscription, requestPermission, subscribe, unsubscribe, isSupported } = usePushNotifications()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  if (!isSupported) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <p className="text-sm text-gray-600">
          {t('pwa.notificationsNotSupported', 'Push notifications are not supported on this device.')}
        </p>
      </div>
    )
  }

  const handleEnable = async () => {
    try {
      setLoading(true)
      
      if (permission === 'default') {
        const result = await requestPermission()
        if (result !== 'granted') {
          return
        }
      }
      
      const newSubscription = await subscribe(vapidPublicKey)
      onSubscribed?.(newSubscription)
      
    } catch (error) {
      console.error('Failed to enable notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    try {
      setLoading(true)
      await unsubscribe()
    } catch (error) {
      console.error('Failed to disable notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">🔔</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {t('pwa.notificationsTitle', 'Push Notifications')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('pwa.notificationsDescription', 'Get notified about crop updates, weather alerts, and more.')}
          </p>
          
          <div className="mt-3">
            {permission === 'denied' && (
              <p className="text-sm text-red-600">
                {t('pwa.notificationsDenied', 'Notifications are blocked. Please enable them in your browser settings.')}
              </p>
            )}
            
            {permission === 'granted' && !subscription && (
              <button
                onClick={handleEnable}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? t('common.loading', 'Loading...') : t('pwa.enableNotifications', 'Enable Notifications')}
              </button>
            )}
            
            {subscription && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-green-600 font-medium">
                  {t('pwa.notificationsEnabled', 'Notifications enabled')}
                </span>
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="text-red-600 text-sm font-medium hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? t('common.loading', 'Loading...') : t('pwa.disable', 'Disable')}
                </button>
              </div>
            )}
            
            {permission === 'default' && (
              <button
                onClick={handleEnable}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? t('common.loading', 'Loading...') : t('pwa.requestPermission', 'Request Permission')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Share Button
interface ShareButtonProps {
  title: string
  text: string
  url: string
  className?: string
  children?: React.ReactNode
}

export function ShareButton({ title, text, url, className = '', children }: ShareButtonProps) {
  const { isSupported, share } = useWebShare()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleShare = async () => {
    try {
      setLoading(true)
      const result = await share({ title, text, url })
      
      if (result.shared) {
        setFeedback(t('pwa.shared', 'Shared successfully!'))
      } else if (result.copied) {
        setFeedback(t('pwa.copied', 'Link copied to clipboard!'))
      }
      
      setTimeout(() => setFeedback(null), 3000)
      
    } catch (error) {
      console.error('Share failed:', error)
      setFeedback(t('pwa.shareFailed', 'Share failed'))
      setTimeout(() => setFeedback(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={loading}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        )}
        {children || t('pwa.share', 'Share')}
      </button>
      
      {feedback && (
        <div className="absolute top-full left-0 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
          {feedback}
        </div>
      )}
    </div>
  )
}

// PWA Status Indicator
export function PWAStatus({ className = '' }: { className?: string }) {
  const { isInstalled, isStandalone, capabilities } = usePWA()
  const { t } = useI18n()

  if (!isInstalled && !isStandalone) {
    return null
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
      <span className="mr-1">📱</span>
      {t('pwa.installed', 'PWA Installed')}
    </div>
  )
}

// App Shortcuts Menu
export function AppShortcuts({ className = '' }: { className?: string }) {
  const { shortcuts } = usePWA()
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  if (shortcuts.length === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {t('pwa.shortcuts', 'Quick Actions')}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {shortcuts.map((shortcut, index) => (
                <a
                  key={index}
                  href={shortcut.url}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  {shortcut.icons?.[0] && (
                    <img 
                      src={shortcut.icons[0].src} 
                      alt="" 
                      className="w-4 h-4 mr-3"
                    />
                  )}
                  <div>
                    <div className="font-medium">{shortcut.name}</div>
                    <div className="text-xs text-gray-500">{shortcut.description}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}