'use client'

import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { XPBar, XPGain, LevelUp } from './XPBar'
import { BadgeSystem, BadgeNotification } from './BadgeSystem'
import { XPLog, XPSummary } from './XPLog'
import { QuestSystem } from './QuestSystem'
import { Badge } from '@/lib/types'

interface GamificationDashboardProps {
  className?: string
}

export function GamificationDashboard({ className = '' }: GamificationDashboardProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'quests' | 'activity'>('overview')
  const [showXPGain, setShowXPGain] = useState<number | null>(null)
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null)
  const [showBadgeNotification, setShowBadgeNotification] = useState<Badge | null>(null)

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to view your progress.</p>
      </div>
    )
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'badges', label: 'Badges', icon: '🏆' },
    { key: 'quests', label: 'Quests', icon: '🎯' },
    { key: 'activity', label: 'Activity', icon: '📈' }
  ] as const

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
          <p className="text-gray-600">Track your farming achievements and level up!</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{user.level}</div>
            <div className="text-gray-600">Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{user.xp}</div>
            <div className="text-gray-600">Total XP</div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <XPBar
          currentXP={user.xp}
          currentLevel={user.level}
          size="lg"
          showDetails={true}
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* XP Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">XP Summary</h3>
              <XPSummary />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <XPLog limit={5} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowXPGain(25)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🌱</div>
                  <div className="text-sm font-medium text-gray-700">Plant a Crop</div>
                  <div className="text-xs text-gray-500">+10 XP</div>
                </button>
                
                <button
                  onClick={() => setShowXPGain(50)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🌾</div>
                  <div className="text-sm font-medium text-gray-700">Harvest Crop</div>
                  <div className="text-xs text-gray-500">+25 XP</div>
                </button>
                
                <button
                  onClick={() => setShowLevelUp(user.level + 1)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="text-sm font-medium text-gray-700">Level Up Demo</div>
                  <div className="text-xs text-gray-500">Celebration</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Achievement Badges</h3>
              <button
                onClick={() => setShowBadgeNotification({
                  id: 'demo',
                  name: 'Demo Badge',
                  description: 'This is a demo notification',
                  icon: '🎯',
                  condition_type: 'xp',
                  condition_value: 100
                })}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Test Badge Notification
              </button>
            </div>
            <BadgeSystem />
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Challenges & Quests</h3>
            <QuestSystem />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* XP Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">XP Breakdown</h3>
              <XPSummary />
            </div>

            {/* Full Activity Log */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <XPLog limit={20} />
            </div>
          </div>
        )}
      </div>

      {/* Notifications and Overlays */}
      {showXPGain && (
        <XPGain
          amount={showXPGain}
          onComplete={() => setShowXPGain(null)}
        />
      )}

      {showLevelUp && (
        <LevelUp
          newLevel={showLevelUp}
          onComplete={() => setShowLevelUp(null)}
        />
      )}

      {showBadgeNotification && (
        <BadgeNotification
          badge={showBadgeNotification}
          onClose={() => setShowBadgeNotification(null)}
        />
      )}
    </div>
  )
}

// Leaderboard component for clan comparisons
interface LeaderboardProps {
  className?: string
}

export function Leaderboard({ className = '' }: LeaderboardProps) {
  const { user } = useAuth()
  const [leaderboardData, setLeaderboardData] = useState<Array<{
    id: string
    name: string
    level: number
    xp: number
    rank: number
  }>>([])
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    // Mock leaderboard data
    setTimeout(() => {
      const mockData = [
        { id: '1', name: 'FarmMaster2024', level: 12, xp: 15000, rank: 1 },
        { id: '2', name: 'GreenThumb', level: 10, xp: 12500, rank: 2 },
        { id: '3', name: 'CropKing', level: 9, xp: 10200, rank: 3 },
        { id: user?.id || '4', name: user?.name || 'You', level: user?.level || 1, xp: user?.xp || 0, rank: 4 },
        { id: '5', name: 'PlantLover', level: 8, xp: 8500, rank: 5 }
      ]
      setLeaderboardData(mockData.sort((a, b) => b.xp - a.xp))
      setLoading(false)
    }, 1000)
  }, [user])

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Leaderboard</h3>
      
      <div className="space-y-3">
        {leaderboardData.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              player.id === user?.id ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                index === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {player.name}
                  {player.id === user?.id && (
                    <span className="ml-2 text-xs text-green-600">(You)</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">Level {player.level}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-gray-900">{player.xp.toLocaleString()} XP</div>
              {index < 3 && (
                <div className="text-xs text-gray-500">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}