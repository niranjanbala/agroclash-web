'use client'

import React, { useState } from 'react'
import { useOfflineData } from '@/hooks/useOfflineData'

interface OfflineIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function OfflineIndicator({ className = '', showDetails = false }: OfflineIndicatorProps) {
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    queuedActions,
    syncErrors,
    formatCacheSize,
    syncData,
    clearCache,
    getSyncStatus
  } = useOfflineData()

  const syncStatus = getSyncStatus()

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500'
    if (isSyncing) return 'bg-yellow-500'
    if (queuedActions > 0) return 'bg-orange-500'
    if (syncErrors.length > 0) return 'bg-red-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (isSyncing) return 'Syncing...'
    if (queuedActions > 0) return `${queuedActions} pending`
    if (syncErrors.length > 0) return 'Sync errors'
    return 'Online'
  }

  const getStatusIcon = () => {
    if (!isOnline) return '📴'
    if (isSyncing) return '🔄'
    if (queuedActions > 0) return '⏳'
    if (syncErrors.length > 0) return '⚠️'
    return '✅'
  }

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never'
    
    const now = Date.now()
    const diff = now - lastSyncTime
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  const handleSync = async () => {
    try {
      await syncData()
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      try {
        await clearCache()
      } catch (error) {
        console.error('Failed to clear cache:', error)
      }
    }
  }

  if (!showDetails && isOnline && queuedActions === 0 && syncErrors.length === 0) {
    // Don't show indicator when everything is working normally
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Indicator */}
      <button
        onClick={() => setShowDetailPanel(!showDetailPanel)}
        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-white text-sm font-medium transition-all hover:opacity-80 ${getStatusColor()}`}
        title={`Status: ${getStatusText()}`}
      >
        <span className="text-xs">{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
        {queuedActions > 0 && (
          <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
            {queuedActions}
          </span>
        )}
      </button>

      {/* Detail Panel */}
      {showDetailPanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDetailPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
                <button
                  onClick={() => setShowDetailPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Overview */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connection</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Sync</span>
                  <span className="text-sm font-medium">{formatLastSync()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Actions</span>
                  <span className="text-sm font-medium">{queuedActions}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cache Size</span>
                  <span className="text-sm font-medium">{formatCacheSize()}</span>
                </div>
              </div>

              {/* Sync Errors */}
              {syncErrors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-red-900 mb-2">Sync Errors</h4>
                  <div className="bg-red-50 rounded-md p-3">
                    <ul className="text-sm text-red-700 space-y-1">
                      {syncErrors.slice(0, 3).map((error, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span className="flex-1">{error}</span>
                        </li>
                      ))}
                      {syncErrors.length > 3 && (
                        <li className="text-red-600 font-medium">
                          +{syncErrors.length - 3} more errors
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleSync}
                  disabled={!isOnline || isSyncing}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSyncing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Sync Now</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClearCache}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear Cache</span>
                </button>
              </div>

              {/* Debug Info (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Debug Info</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Time since last sync: {syncStatus.timeSinceLastSync ? `${Math.floor(syncStatus.timeSinceLastSync / 1000)}s` : 'N/A'}</div>
                    <div>Has queued actions: {syncStatus.hasQueuedActions ? 'Yes' : 'No'}</div>
                    <div>Has errors: {syncStatus.hasErrors ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Simple offline banner component
export function OfflineBanner({ className = '' }: { className?: string }) {
  const { isOnline } = useOfflineData()

  if (isOnline) return null

  return (
    <div className={`bg-red-600 text-white px-4 py-2 text-center text-sm font-medium ${className}`}>
      <div className="flex items-center justify-center space-x-2">
        <span>📴</span>
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  )
}

// Sync status badge component
export function SyncStatusBadge({ className = '' }: { className?: string }) {
  const { isSyncing, queuedActions, syncErrors } = useOfflineData()

  if (!isSyncing && queuedActions === 0 && syncErrors.length === 0) {
    return null
  }

  const getStatus = () => {
    if (isSyncing) return { text: 'Syncing', color: 'bg-yellow-100 text-yellow-800', icon: '🔄' }
    if (syncErrors.length > 0) return { text: 'Sync Error', color: 'bg-red-100 text-red-800', icon: '⚠️' }
    if (queuedActions > 0) return { text: `${queuedActions} Pending`, color: 'bg-orange-100 text-orange-800', icon: '⏳' }
    return { text: 'Synced', color: 'bg-green-100 text-green-800', icon: '✅' }
  }

  const status = getStatus()

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color} ${className}`}>
      <span className="mr-1">{status.icon}</span>
      {status.text}
    </span>
  )
}