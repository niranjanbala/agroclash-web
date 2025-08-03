'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { MockClanService } from '@/lib/services/mock/clan.service'
import { Clan, User } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface ClanOverviewProps {
  clan: Clan
  onLeaveClan: () => void
  onRefresh: () => void
  className?: string
}

export function ClanOverview({ clan, onLeaveClan, onRefresh, className = '' }: ClanOverviewProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const clanService = new MockClanService()

  useEffect(() => {
    loadClanData()
  }, [clan.id])

  const loadClanData = async () => {
    try {
      setLoading(true)
      const clanMembers = await clanService.getClanMembers(clan.id)
      setMembers(clanMembers)
    } catch (error) {
      console.error('Error loading clan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async () => {
    if (!user || !inviteEmail.trim()) return

    try {
      // In a real implementation, this would find user by email and send invite
      console.log(`Inviting ${inviteEmail} to clan ${clan.name}`)
      setInviteEmail('')
      setShowInviteModal(false)
      alert('Invite sent successfully!')
    } catch (error) {
      console.error('Error sending invite:', error)
      alert('Failed to send invite')
    }
  }

  const userMember = members.find(m => m.id === user?.id)
  const isLeader = userMember && (userMember as any).clan_role === 'leader'
  const isAdmin = userMember && ((userMember as any).clan_role === 'admin' || (userMember as any).clan_role === 'leader')

  const getClanLevel = (totalXP: number): number => {
    return Math.floor(Math.sqrt(totalXP / 1000)) + 1
  }

  const getXPForNextLevel = (currentLevel: number): number => {
    return Math.pow(currentLevel, 2) * 1000
  }

  const clanLevel = getClanLevel(clan.total_xp)
  const nextLevelXP = getXPForNextLevel(clanLevel)
  const currentLevelXP = getXPForNextLevel(clanLevel - 1)
  const progressXP = clan.total_xp - currentLevelXP
  const neededXP = nextLevelXP - currentLevelXP
  const progressPercentage = (progressXP / neededXP) * 100

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading clan overview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clan Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-semibold text-gray-900">{clan.member_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">⭐</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clan Level</p>
              <p className="text-2xl font-semibold text-gray-900">{clanLevel}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600">🏆</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total XP</p>
              <p className="text-2xl font-semibold text-gray-900">{clan.total_xp.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Founded</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatDate(clan.created_at, 'short')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clan Level Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Clan Progress</h3>
          <span className="text-sm text-gray-600">Level {clanLevel}</span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress to Level {clanLevel + 1}</span>
            <span>{progressXP.toLocaleString()} / {neededXP.toLocaleString()} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {neededXP - progressXP > 0 ? 
              `${(neededXP - progressXP).toLocaleString()} XP needed for next level` :
              'Ready to level up!'
            }
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Avg XP per Member</p>
            <p className="text-gray-600">{Math.round(clan.total_xp / clan.member_count).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Daily Goal</p>
            <p className="text-gray-600">{Math.round(neededXP / 30).toLocaleString()} XP</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Weekly Goal</p>
            <p className="text-gray-600">{Math.round(neededXP / 4).toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      {/* Clan Description */}
      {clan.description && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About Our Clan</h3>
          <p className="text-gray-600 leading-relaxed">{clan.description}</p>
        </div>
      )}

      {/* Recent Members */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Members</h3>
          <span className="text-sm text-gray-600">{members.length} total</span>
        </div>
        
        <div className="space-y-3">
          {members.slice(0, 5).map(member => {
            const memberData = member as any
            return (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Level {member.level}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        memberData.clan_role === 'leader' ? 'bg-yellow-100 text-yellow-800' :
                        memberData.clan_role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {memberData.clan_role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{member.xp.toLocaleString()} XP</p>
                  <p className="text-xs text-gray-600">
                    Contribution: {memberData.clan_contribution_xp?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        
        {members.length > 5 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              and {members.length - 5} more members...
            </p>
          </div>
        )}
      </div>

      {/* Clan Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clan Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600">📨</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Invite Members</span>
              </div>
            </button>
          )}
          
          <button
            onClick={onRefresh}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600">🔄</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Refresh Data</span>
            </div>
          </button>
          
          <button
            onClick={onLeaveClan}
            className="flex items-center justify-center p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <div className="text-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600">🚪</span>
              </div>
              <span className="text-sm font-medium text-red-900">Leave Clan</span>
            </div>
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invite New Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter user's email address"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}