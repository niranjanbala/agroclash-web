'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { XPLog as XPLogType } from '@/lib/types'
import { formatDate, formatXP } from '@/lib/utils'
import { ServiceFactory } from '@/lib/services/factory'

interface XPLogProps {
  limit?: number
  showTitle?: boolean
  className?: string
}

export function XPLog({ limit = 10, showTitle = true, className = '' }: XPLogProps) {
  const { user } = useAuth()
  const [xpLogs, setXpLogs] = useState<XPLogType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const xpService = ServiceFactory.getXPService()

  useEffect(() => {
    if (user) {
      loadXPLogs()
    }
  }, [user, limit])

  const loadXPLogs = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const logs = await xpService.getXPLogs(user.id, limit)
      setXpLogs(logs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load XP logs')
      console.error('Error loading XP logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (actionType: string): string => {
    const icons: { [key: string]: string } = {
      'plant_crop': '🌱',
      'water_crop': '💧',
      'harvest_crop': '🌾',
      'create_plot': '🏞️',
      'win_pest_battle': '⚔️',
      'join_clan': '🏰',
      'daily_login': '📅',
      'complete_quest': '🎯',
      'help_clan_member': '🤝',
      'market_sale': '💰',
      'weather_alert_action': '🌦️',
      'welcome_bonus': '🎉'
    }
    return icons[actionType] || '⭐'
  }

  const getActionColor = (actionType: string): string => {
    const colors: { [key: string]: string } = {
      'plant_crop': 'text-green-600',
      'water_crop': 'text-blue-600',
      'harvest_crop': 'text-yellow-600',
      'create_plot': 'text-purple-600',
      'win_pest_battle': 'text-red-600',
      'join_clan': 'text-indigo-600',
      'daily_login': 'text-gray-600',
      'complete_quest': 'text-orange-600',
      'help_clan_member': 'text-pink-600',
      'market_sale': 'text-green-700',
      'weather_alert_action': 'text-blue-700',
      'welcome_bonus': 'text-purple-700'
    }
    return colors[actionType] || 'text-gray-600'
  }

  const formatActionType = (actionType: string): string => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading XP history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="text-red-600 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadXPLogs}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    )
  }

  if (xpLogs.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No XP history yet</h3>
        <p className="text-gray-600">
          Start farming activities to earn XP and see your progress here
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent XP Activity</h3>
      )}
      
      <div className="space-y-3">
        {xpLogs.map((log, index) => (
          <XPLogItem key={log.id} log={log} isLatest={index === 0} />
        ))}
      </div>

      {xpLogs.length >= limit && (
        <div className="text-center mt-4">
          <button
            onClick={() => loadXPLogs()}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Load more activity
          </button>
        </div>
      )}
    </div>
  )
}

interface XPLogItemProps {
  log: XPLogType
  isLatest: boolean
}

function XPLogItem({ log, isLatest }: XPLogItemProps) {
  const actionIcon = getActionIcon(log.action_type)
  const actionColor = getActionColor(log.action_type)
  const actionName = formatActionType(log.action_type)

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
      isLatest ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      {/* Action Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isLatest ? 'bg-green-100' : 'bg-white'
      }`}>
        <span className="text-lg">{actionIcon}</span>
      </div>

      {/* Action Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {actionName}
          </p>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-semibold ${actionColor}`}>
              +{log.xp_awarded} XP
            </span>
            {isLatest && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                New
              </span>
            )}
          </div>
        </div>
        
        {log.description && (
          <p className="text-sm text-gray-600 truncate mt-1">
            {log.description}
          </p>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(log.created_at, 'long')} • {new Date(log.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

// XP Summary component
interface XPSummaryProps {
  className?: string
}

export function XPSummary({ className = '' }: XPSummaryProps) {
  const { user } = useAuth()
  const [summary, setSummary] = useState<{
    todayXP: number
    weekXP: number
    monthXP: number
    totalXP: number
  }>({
    todayXP: 0,
    weekXP: 0,
    monthXP: 0,
    totalXP: 0
  })
  const [loading, setLoading] = useState(true)

  const xpService = ServiceFactory.getXPService()

  useEffect(() => {
    if (user) {
      loadXPSummary()
    }
  }, [user])

  const loadXPSummary = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get all XP logs for calculations
      const allLogs = await xpService.getXPLogs(user.id, 1000)
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const todayXP = allLogs
        .filter(log => new Date(log.created_at) >= today)
        .reduce((sum, log) => sum + log.xp_awarded, 0)

      const weekXP = allLogs
        .filter(log => new Date(log.created_at) >= weekAgo)
        .reduce((sum, log) => sum + log.xp_awarded, 0)

      const monthXP = allLogs
        .filter(log => new Date(log.created_at) >= monthAgo)
        .reduce((sum, log) => sum + log.xp_awarded, 0)

      setSummary({
        todayXP,
        weekXP,
        monthXP,
        totalXP: user.xp
      })
    } catch (error) {
      console.error('Error loading XP summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">
          {formatXP(summary.todayXP)}
        </div>
        <div className="text-sm text-blue-700">Today</div>
      </div>
      
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {formatXP(summary.weekXP)}
        </div>
        <div className="text-sm text-green-700">This Week</div>
      </div>
      
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">
          {formatXP(summary.monthXP)}
        </div>
        <div className="text-sm text-purple-700">This Month</div>
      </div>
      
      <div className="text-center p-4 bg-yellow-50 rounded-lg">
        <div className="text-2xl font-bold text-yellow-600">
          {formatXP(summary.totalXP)}
        </div>
        <div className="text-sm text-yellow-700">Total XP</div>
      </div>
    </div>
  )
}