'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Badge, UserBadge } from '@/lib/types'

interface BadgeSystemProps {
  className?: string
}

export function BadgeSystem({ className = '' }: BadgeSystemProps) {
  const { user } = useAuth()
  const [badges, setBadges] = useState<Badge[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBadges()
    }
  }, [user])

  const loadBadges = async () => {
    try {
      setLoading(true)
      // Mock data for now - in real implementation, this would come from the badge service
      const mockBadges: Badge[] = [
        {
          id: '1',
          name: 'First Steps',
          description: 'Welcome to AgroClash! Plant your first crop.',
          icon: '🌱',
          xp_requirement: 10,
          condition_type: 'xp',
          condition_value: 10
        },
        {
          id: '2',
          name: 'Green Thumb',
          description: 'Earn 100 XP from farming activities.',
          icon: '👍',
          xp_requirement: 100,
          condition_type: 'xp',
          condition_value: 100
        },
        {
          id: '3',
          name: 'Harvest Master',
          description: 'Successfully harvest 5 crops.',
          icon: '🌾',
          condition_type: 'harvest',
          condition_value: 5
        },
        {
          id: '4',
          name: 'Land Owner',
          description: 'Create 3 different plots.',
          icon: '🏞️',
          condition_type: 'plots',
          condition_value: 3
        },
        {
          id: '5',
          name: 'Farming Expert',
          description: 'Reach level 5.',
          icon: '🎓',
          xp_requirement: 2500,
          condition_type: 'xp',
          condition_value: 2500
        },
        {
          id: '6',
          name: 'Pest Fighter',
          description: 'Win 10 pest battles.',
          icon: '⚔️',
          condition_type: 'streak',
          condition_value: 10
        }
      ]

      // Mock user badges - user has earned first two badges
      const mockUserBadges: UserBadge[] = [
        {
          id: '1',
          user_id: user!.id,
          badge_id: '1',
          earned_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          user_id: user!.id,
          badge_id: '2',
          earned_at: '2024-01-02T00:00:00Z'
        }
      ]

      setBadges(mockBadges)
      setUserBadges(mockUserBadges)
    } catch (error) {
      console.error('Error loading badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeStatus = (badge: Badge): 'earned' | 'available' | 'locked' => {
    const userBadge = userBadges.find(ub => ub.badge_id === badge.id)
    if (userBadge) return 'earned'

    // Check if badge requirements are met
    if (badge.condition_type === 'xp' && user && user.xp >= badge.condition_value) {
      return 'available'
    }

    return 'locked'
  }

  const getBadgeProgress = (badge: Badge): number => {
    if (!user) return 0

    switch (badge.condition_type) {
      case 'xp':
        return Math.min((user.xp / badge.condition_value) * 100, 100)
      case 'harvest':
        // This would come from crop statistics in real implementation
        return Math.min((2 / badge.condition_value) * 100, 100) // Mock: user has 2 harvests
      case 'plots':
        // This would come from plot statistics in real implementation
        return Math.min((1 / badge.condition_value) * 100, 100) // Mock: user has 1 plot
      case 'streak':
        // This would come from pest battle statistics in real implementation
        return Math.min((3 / badge.condition_value) * 100, 100) // Mock: user has 3 wins
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading badges...</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map(badge => {
          const status = getBadgeStatus(badge)
          const progress = getBadgeProgress(badge)
          const userBadge = userBadges.find(ub => ub.badge_id === badge.id)

          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              status={status}
              progress={progress}
              earnedAt={userBadge?.earned_at}
            />
          )
        })}
      </div>
    </div>
  )
}

interface BadgeCardProps {
  badge: Badge
  status: 'earned' | 'available' | 'locked'
  progress: number
  earnedAt?: string
}

function BadgeCard({ badge, status, progress, earnedAt }: BadgeCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'earned':
        return 'border-green-500 bg-green-50'
      case 'available':
        return 'border-yellow-500 bg-yellow-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getIconOpacity = () => {
    switch (status) {
      case 'earned':
        return 'opacity-100'
      case 'available':
        return 'opacity-80'
      default:
        return 'opacity-40'
    }
  }

  return (
    <div className={`border-2 rounded-lg p-4 transition-all ${getStatusColor()}`}>
      <div className="text-center">
        {/* Badge Icon */}
        <div className={`text-4xl mb-2 ${getIconOpacity()}`}>
          {badge.icon}
        </div>

        {/* Badge Name */}
        <h3 className="font-semibold text-gray-900 mb-1">
          {badge.name}
        </h3>

        {/* Badge Description */}
        <p className="text-sm text-gray-600 mb-3">
          {badge.description}
        </p>

        {/* Status Badge */}
        <div className="mb-3">
          {status === 'earned' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Earned
            </span>
          )}
          {status === 'available' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              🎯 Available
            </span>
          )}
          {status === 'locked' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              🔒 Locked
            </span>
          )}
        </div>

        {/* Progress Bar for non-earned badges */}
        {status !== 'earned' && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {/* Earned Date */}
        {earnedAt && (
          <p className="text-xs text-gray-500">
            Earned on {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}

        {/* Requirements */}
        {status === 'locked' && (
          <div className="text-xs text-gray-500 mt-2">
            {badge.condition_type === 'xp' && (
              <span>Requires {badge.condition_value} XP</span>
            )}
            {badge.condition_type === 'harvest' && (
              <span>Harvest {badge.condition_value} crops</span>
            )}
            {badge.condition_type === 'plots' && (
              <span>Create {badge.condition_value} plots</span>
            )}
            {badge.condition_type === 'streak' && (
              <span>Win {badge.condition_value} battles</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Badge notification component
interface BadgeNotificationProps {
  badge: Badge
  onClose: () => void
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-white border-2 border-green-500 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">{badge.icon}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">Badge Earned!</h4>
            <p className="text-sm text-gray-600 mb-1">{badge.name}</p>
            <p className="text-xs text-gray-500">{badge.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}