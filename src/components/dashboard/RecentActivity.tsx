'use client'

import React from 'react'
import { XPLog } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface RecentActivityProps {
  activities: XPLog[]
  loading?: boolean
  className?: string
}

export function RecentActivity({ activities, loading = false, className = '' }: RecentActivityProps) {
  const getActivityIcon = (actionType: string) => {
    const iconMap: { [key: string]: string } = {
      'plant_crop': '🌱',
      'harvest_crop': '🌾',
      'create_plot': '📍',
      'update_crop': '✏️',
      'win_pest_battle': '⚔️',
      'level_up': '⭐',
      'complete_quest': '🎯',
      'join_clan': '🏰',
      'market_sale': '💰',
      'weather_alert': '🌦️',
      'badge_earned': '🏆',
      'daily_login': '📅'
    }
    return iconMap[actionType] || '📝'
  }

  const getActivityColor = (actionType: string) => {
    const colorMap: { [key: string]: string } = {
      'plant_crop': 'bg-green-100 text-green-600',
      'harvest_crop': 'bg-yellow-100 text-yellow-600',
      'create_plot': 'bg-blue-100 text-blue-600',
      'update_crop': 'bg-gray-100 text-gray-600',
      'win_pest_battle': 'bg-red-100 text-red-600',
      'level_up': 'bg-purple-100 text-purple-600',
      'complete_quest': 'bg-indigo-100 text-indigo-600',
      'join_clan': 'bg-orange-100 text-orange-600',
      'market_sale': 'bg-green-100 text-green-600',
      'weather_alert': 'bg-cyan-100 text-cyan-600',
      'badge_earned': 'bg-yellow-100 text-yellow-600',
      'daily_login': 'bg-gray-100 text-gray-600'
    }
    return colorMap[actionType] || 'bg-gray-100 text-gray-600'
  }

  const formatActivityDescription = (activity: XPLog) => {
    if (activity.description) {
      return activity.description
    }
    
    // Generate description based on action type
    const descriptions: { [key: string]: string } = {
      'plant_crop': 'Planted a new crop',
      'harvest_crop': 'Harvested crops',
      'create_plot': 'Created a new plot',
      'update_crop': 'Updated crop status',
      'win_pest_battle': 'Won a pest battle',
      'level_up': 'Leveled up!',
      'complete_quest': 'Completed a quest',
      'join_clan': 'Joined a clan',
      'market_sale': 'Sold crops at market',
      'weather_alert': 'Received weather alert',
      'badge_earned': 'Earned a new badge',
      'daily_login': 'Daily login bonus'
    }
    
    return descriptions[activity.action_type] || 'Performed an action'
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const activityDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return formatDate(dateString)
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-600">Your latest farming actions</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                {/* Activity Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.action_type)}`}>
                  <span className="text-sm">{getActivityIcon(activity.action_type)}</span>
                </div>
                
                {/* Activity Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatActivityDescription(activity)}
                    </p>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      {activity.xp_awarded > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          +{activity.xp_awarded} XP
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTimeAgo(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* View More Button */}
            <div className="pt-4 border-t border-gray-200">
              <button className="w-full text-center text-sm text-green-600 hover:text-green-800 font-medium">
                View All Activity
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h4>
            <p className="text-gray-600 text-sm">
              Start farming to see your activity here!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}