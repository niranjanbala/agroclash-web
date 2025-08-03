'use client'

import React, { useState, useEffect } from 'react'
import { useOfflineData } from '@/hooks/useOfflineData'

interface OfflineDataManagerProps {
  className?: string
}

export function OfflineDataManager({ className = '' }: OfflineDataManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'cache'>('overview')
  const [queueDetails, setQueueDetails] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    queuedActions,
    syncErrors,
    formatCacheSize,
    syncData,
    clearCache,
    clearData,
    offlineService
  } = useOfflineData()

  useEffect(() => {
    if (activeTab === 'queue') {
      loadQueueDetails()
    }
  }, [activeTab])

  const loadQueueDetails = async () => {
    setLoading(true)
    try {
      const actions = await offlineService.getQueuedActions()
      setQueueDetails(actions)
    } catch (error) {
      console.error('Error loading queue details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetryAction = async (actionId: string) => {
    try {
      // In a real implementation, you'd retry the specific action
      await syncData()
      await loadQueueDetails()
    } catch (error) {
      console.error('Error retrying action:', error)
    }
  }

  const handleRemoveAction = async (actionId: string) => {
    try {
      await offlineService.removeAction(actionId)
      await loadQueueDetails()
    } catch (error) {
      console.error('Error removing action:', error)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getActionIcon = (type: string, entity: string) => {
    const icons = {
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️'
    }
    
    const entityIcons = {
      plot: '📍',
      crop: '🌱',
      notification: '🔔',
      xp_log: '⭐',
      user: '👤'
    }
    
    return `${icons[type as keyof typeof icons] || '📝'} ${entityIcons[entity as keyof typeof entityIcons] || '📄'}`
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'queue', label: 'Action Queue', icon: '📋' },
    { key: 'cache', label: 'Cache Management', icon: '💾' }
  ] as const

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Offline Data Manager</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage offline data synchronization and caching
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.key === 'queue' && queuedActions > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    {queuedActions}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isOnline ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className="text-sm">{isOnline ? '🌐' : '📴'}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Connection</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">⏳</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Pending Actions</p>
                    <p className="text-2xl font-semibold text-gray-900">{queuedActions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">💾</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Cache Size</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCacheSize()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Sync Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sync Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Sync:</span>
                  <span className="text-sm font-medium">
                    {lastSyncTime ? formatTimestamp(lastSyncTime) : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    isSyncing ? 'text-yellow-600' : 
                    syncErrors.length > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {isSyncing ? 'Syncing...' : 
                     syncErrors.length > 0 ? `${syncErrors.length} errors` : 'Up to date'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sync Errors */}
            {syncErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-900 mb-3">Sync Errors</h3>
                <ul className="space-y-2">
                  {syncErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start space-x-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => syncData()}
                disabled={!isOnline || isSyncing}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                onClick={() => clearCache()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Action Queue</h3>
              <button
                onClick={loadQueueDetails}
                disabled={loading}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading queue...</p>
              </div>
            ) : queueDetails.length > 0 ? (
              <div className="space-y-3">
                {queueDetails.map(action => (
                  <div key={action.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getActionIcon(action.type, action.entity)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {action.type} {action.entity}
                          </p>
                          <p className="text-xs text-gray-600">
                            ID: {action.entityId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(action.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {action.retryCount > 0 && (
                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                            {action.retryCount} retries
                          </span>
                        )}
                        
                        <button
                          onClick={() => handleRetryAction(action.id)}
                          className="text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          Retry
                        </button>
                        
                        <button
                          onClick={() => handleRemoveAction(action.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending actions</h3>
                <p className="text-gray-600">All changes have been synchronized</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cache' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Management</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage your offline data cache to free up storage space or reset data.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Current Cache Size</h4>
                  <p className="text-sm text-gray-600">Total storage used by offline data</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-gray-900">{formatCacheSize()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <h4 className="text-base font-medium text-yellow-900">Clear All Cache</h4>
                  <p className="text-sm text-yellow-700">
                    Remove all offline data and pending actions. This cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
                      clearCache()
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Clear Plots Data</h4>
                  <p className="text-sm text-gray-600 mb-3">Remove cached plot information</p>
                  <button
                    onClick={() => clearData('plots')}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  >
                    Clear Plots
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Clear Crops Data</h4>
                  <p className="text-sm text-gray-600 mb-3">Remove cached crop information</p>
                  <button
                    onClick={() => clearData('crops')}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  >
                    Clear Crops
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Clear Notifications</h4>
                  <p className="text-sm text-gray-600 mb-3">Remove cached notifications</p>
                  <button
                    onClick={() => clearData('notifications')}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  >
                    Clear Notifications
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Clear XP Logs</h4>
                  <p className="text-sm text-gray-600 mb-3">Remove cached XP history</p>
                  <button
                    onClick={() => clearData('xpLogs')}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  >
                    Clear XP Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}