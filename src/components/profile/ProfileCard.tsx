'use client'

import React from 'react'
import { useAuth } from '../auth/AuthProvider'
import { formatXP, calculateLevelFromXP, getXPForLevel } from '@/lib/utils'

interface ProfileCardProps {
  showDetails?: boolean
  className?: string
}

export function ProfileCard({ showDetails = true, className = '' }: ProfileCardProps) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const currentLevel = user.level
  const currentXP = user.xp
  const xpForCurrentLevel = getXPForLevel(currentLevel)
  const xpForNextLevel = getXPForLevel(currentLevel + 1)
  const xpProgress = currentXP - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const progressPercentage = (xpProgress / xpNeeded) * 100

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200">
              <span className="text-2xl font-bold text-green-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {user.name}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {user.email}
          </p>
          
          {/* Level and XP */}
          <div className="flex items-center space-x-2 mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Level {currentLevel}
            </span>
            <span className="text-sm text-gray-600">
              {formatXP(currentXP)} XP
            </span>
          </div>
        </div>

        {/* Clan Badge */}
        {user.clan_id && (
          <div className="flex-shrink-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🏰 Clan Member
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-6 space-y-4">
          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress to Level {currentLevel + 1}</span>
              <span>{formatXP(xpProgress)} / {formatXP(xpNeeded)} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {currentLevel}
              </div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatXP(currentXP)}
              </div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
          </div>

          {/* Location */}
          {user.location && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {user.location.latitude.toFixed(2)}, {user.location.longitude.toFixed(2)}
              </span>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              Member since {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for navigation bars
export function ProfileCardCompact({ className = '' }: { className?: string }) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Avatar */}
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-sm font-bold text-green-600">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.name}
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">
            Level {user.level}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-600">
            {formatXP(user.xp)} XP
          </span>
        </div>
      </div>
    </div>
  )
}