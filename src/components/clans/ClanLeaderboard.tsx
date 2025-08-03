'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { MockClanService } from '@/lib/services/mock/clan.service'
import { User } from '@/lib/types'

interface ClanLeaderboardProps {
  clanId: string
  className?: string
}

export function ClanLeaderboard({ clanId, className = '' }: ClanLeaderboardProps) {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all-time' | 'monthly' | 'weekly'>('all-time')

  const clanService = new MockClanService()

  useEffect(() => {
    loadLeaderboard()
  }, [clanId, timeframe])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const members = await clanService.getClanLeaderboard(clanId)
      setLeaderboard(members)
    } catch (error) {
      console.error('Error loading clan leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50'
      case 2: return 'text-gray-600 bg-gray-50'
      case 3: return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getContributionData = (member: User) => {
    const memberData = member as any
    return {
      contribution: memberData.clan_contribution_xp || 0,
      percentage: member.xp > 0 ? Math.round(((memberData.clan_contribution_xp || 0) / member.xp) * 100) : 0
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const userRank = leaderboard.findIndex(member => member.id === user?.id) + 1

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Timeframe Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Clan Leaderboard</h3>
          <p className="text-sm text-gray-600">
            Ranked by contribution to clan XP
          </p>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(['all-time', 'monthly', 'weekly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeframe === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* User's Rank (if not in top 10) */}
      {userRank > 10 && userRank <= leaderboard.length && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-800">#{userRank}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Your Rank</p>
                <p className="text-xs text-blue-700">
                  {getContributionData(leaderboard[userRank - 1]).contribution.toLocaleString()} contribution XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-900">
                {leaderboard[userRank - 1].xp.toLocaleString()} XP
              </p>
              <p className="text-xs text-blue-700">Level {leaderboard[userRank - 1].level}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-medium text-gray-900 mb-6 text-center">Top Contributors</h4>
          
          <div className="flex justify-center items-end space-x-4">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-lg font-medium text-gray-600">
                  {leaderboard[1].name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 min-h-[80px] flex flex-col justify-end">
                <div className="text-2xl mb-1">🥈</div>
                <p className="text-sm font-medium text-gray-900">{leaderboard[1].name}</p>
                <p className="text-xs text-gray-600">
                  {getContributionData(leaderboard[1]).contribution.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-xl font-medium text-yellow-600">
                  {leaderboard[0].name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="bg-yellow-100 rounded-lg p-4 min-h-[100px] flex flex-col justify-end">
                <div className="text-3xl mb-2">🥇</div>
                <p className="text-sm font-medium text-gray-900">{leaderboard[0].name}</p>
                <p className="text-xs text-gray-600">
                  {getContributionData(leaderboard[0]).contribution.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-lg font-medium text-orange-600">
                  {leaderboard[2].name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="bg-orange-100 rounded-lg p-3 min-h-[80px] flex flex-col justify-end">
                <div className="text-2xl mb-1">🥉</div>
                <p className="text-sm font-medium text-gray-900">{leaderboard[2].name}</p>
                <p className="text-xs text-gray-600">
                  {getContributionData(leaderboard[2]).contribution.toLocaleString()} XP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">Full Rankings</h4>
        </div>
        
        <div className="divide-y divide-gray-200">
          {leaderboard.map((member, index) => {
            const rank = index + 1
            const isCurrentUser = member.id === user?.id
            const contributionData = getContributionData(member)
            const memberData = member as any
            
            return (
              <div 
                key={member.id} 
                className={`p-6 hover:bg-gray-50 ${isCurrentUser ? 'bg-green-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankColor(rank)}`}>
                      <span className="text-sm font-medium">
                        {typeof getRankIcon(rank) === 'string' && getRankIcon(rank).startsWith('#') 
                          ? getRankIcon(rank) 
                          : getRankIcon(rank)
                        }
                      </span>
                    </div>
                    
                    {/* Member Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {member.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-green-600">(You)</span>
                            )}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            memberData.clan_role === 'leader' ? 'bg-yellow-100 text-yellow-800' :
                            memberData.clan_role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {memberData.clan_role === 'leader' ? '👑' : 
                             memberData.clan_role === 'admin' ? '⭐' : '👤'} {memberData.clan_role}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Level {member.level}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {contributionData.contribution.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {contributionData.percentage}% of {member.xp.toLocaleString()} XP
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(contributionData.percentage, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings yet</h3>
            <p className="text-gray-600">
              Start contributing XP to your clan to appear on the leaderboard!
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard Stats */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {leaderboard.reduce((sum, m) => sum + getContributionData(m).contribution, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Contribution XP</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(leaderboard.reduce((sum, m) => sum + getContributionData(m).contribution, 0) / leaderboard.length).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Average Contribution</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {Math.max(...leaderboard.map(m => getContributionData(m).contribution)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Top Contribution</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}