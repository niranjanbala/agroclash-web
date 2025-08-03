'use client'

import React from 'react'
import { formatXP, calculateLevelFromXP, getXPForLevel } from '@/lib/utils'

interface XPBarProps {
  currentXP: number
  currentLevel: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function XPBar({ 
  currentXP, 
  currentLevel, 
  showDetails = true, 
  size = 'md',
  className = '' 
}: XPBarProps) {
  const xpForCurrentLevel = getXPForLevel(currentLevel)
  const xpForNextLevel = getXPForLevel(currentLevel + 1)
  const xpProgress = currentXP - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const progressPercentage = (xpProgress / xpNeeded) * 100

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`${className}`}>
      {showDetails && (
        <div className={`flex justify-between items-center mb-2 ${textSizeClasses[size]}`}>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">Level {currentLevel}</span>
            <span className="text-gray-600">({formatXP(currentXP)} XP)</span>
          </div>
          <span className="text-gray-600">
            {formatXP(xpProgress)} / {formatXP(xpNeeded)}
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
        </div>
      </div>
      
      {showDetails && (
        <div className={`mt-1 ${textSizeClasses[size]} text-gray-600`}>
          {xpProgress >= xpNeeded ? (
            <span className="text-green-600 font-medium">Ready to level up!</span>
          ) : (
            <span>{formatXP(xpNeeded - xpProgress)} XP to next level</span>
          )}
        </div>
      )}
    </div>
  )
}

// Animated XP gain component
interface XPGainProps {
  amount: number
  onComplete?: () => void
}

export function XPGain({ amount, onComplete }: XPGainProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⭐</span>
          <span className="text-lg font-bold">+{amount} XP</span>
        </div>
      </div>
    </div>
  )
}

// Level up celebration component
interface LevelUpProps {
  newLevel: number
  onComplete?: () => void
}

export function LevelUp({ newLevel, onComplete }: LevelUpProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4 animate-pulse">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Level Up!</h2>
        <p className="text-xl text-gray-600 mb-4">
          You've reached <span className="font-bold text-green-600">Level {newLevel}</span>
        </p>
        <div className="text-4xl mb-4">🌟</div>
        <p className="text-sm text-gray-500">
          Keep farming to unlock more features and rewards!
        </p>
      </div>
    </div>
  )
}