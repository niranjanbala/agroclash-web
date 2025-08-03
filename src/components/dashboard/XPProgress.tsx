'use client'

import React from 'react'

interface XPProgressProps {
  currentLevel: number
  currentXP: number
  xpToNextLevel: number
  className?: string
}

export function XPProgress({ currentLevel, currentXP, xpToNextLevel, className = '' }: XPProgressProps) {
  const totalXPForCurrentLevel = currentXP + xpToNextLevel
  const progressPercentage = (currentXP / totalXPForCurrentLevel) * 100

  const getLevelBadgeColor = (level: number) => {
    if (level >= 50) return 'bg-purple-600'
    if (level >= 25) return 'bg-yellow-600'
    if (level >= 10) return 'bg-blue-600'
    return 'bg-green-600'
  }

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Master Farmer'
    if (level >= 25) return 'Expert Farmer'
    if (level >= 10) return 'Skilled Farmer'
    if (level >= 5) return 'Farmer'
    return 'Novice Farmer'
  }

  const getNextLevelRewards = (level: number) => {
    const rewards = [
      'New crop varieties unlocked',
      'Advanced farming tools',
      'Weather prediction accuracy +10%',
      'Market insights access',
      'Clan leadership abilities'
    ]
    return rewards[level % rewards.length]
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Current Level Badge */}
        <div className="text-center mb-6">
          <div className={`w-20 h-20 ${getLevelBadgeColor(currentLevel)} rounded-full flex items-center justify-center mx-auto mb-3`}>
            <span className="text-white text-2xl font-bold">{currentLevel}</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">{getLevelTitle(currentLevel)}</h4>
          <p className="text-sm text-gray-600">Level {currentLevel}</p>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>XP Progress</span>
            <span>{currentXP.toLocaleString()} / {totalXPForCurrentLevel.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Level {currentLevel}</span>
            <span>{xpToNextLevel.toLocaleString()} XP to next level</span>
          </div>
        </div>

        {/* Next Level Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-gray-900">Next Level Rewards</h5>
            <span className="text-xs text-gray-500">Level {currentLevel + 1}</span>
          </div>
          <p className="text-sm text-gray-600">{getNextLevelRewards(currentLevel)}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-blue-600">{currentXP.toLocaleString()}</p>
            <p className="text-xs text-blue-600">Total XP</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-600">{Math.round(progressPercentage)}%</p>
            <p className="text-xs text-green-600">Level Progress</p>
          </div>
        </div>

        {/* Level Milestones */}
        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Recent Milestones</h5>
          <div className="space-y-2">
            {[
              { level: Math.max(1, currentLevel - 2), title: 'Crop Master', achieved: true },
              { level: Math.max(1, currentLevel - 1), title: 'Weather Watcher', achieved: true },
              { level: currentLevel, title: getLevelTitle(currentLevel), achieved: true },
              { level: currentLevel + 1, title: getLevelTitle(currentLevel + 1), achieved: false }
            ].map((milestone, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  milestone.achieved 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {milestone.achieved ? '✓' : milestone.level}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${milestone.achieved ? 'text-gray-900' : 'text-gray-500'}`}>
                    {milestone.title}
                  </p>
                  <p className="text-xs text-gray-500">Level {milestone.level}</p>
                </div>
                {!milestone.achieved && milestone.level === currentLevel + 1 && (
                  <span className="text-xs text-blue-600 font-medium">Next</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}