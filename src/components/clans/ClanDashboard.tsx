'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ClanOverview } from './ClanOverview'
import { ClanMembers } from './ClanMembers'
import { ClanLeaderboard } from './ClanLeaderboard'
import { ClanSearch } from './ClanSearch'
import { ClanInvites } from './ClanInvites'
import { MockClanService } from '@/lib/services/mock/clan.service'
import { Clan } from '@/lib/types'

interface ClanDashboardProps {
  className?: string
}

export function ClanDashboard({ className = '' }: ClanDashboardProps) {
  const { user } = useAuth()
  const [userClan, setUserClan] = useState<Clan | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'leaderboard' | 'search' | 'invites'>('overview')
  const [pendingInvites, setPendingInvites] = useState<any[]>([])

  const clanService = new MockClanService()

  useEffect(() => {
    if (user) {
      loadClanData()
    }
  }, [user])

  const loadClanData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load user's clan and pending invites
      const [clan, invites] = await Promise.all([
        clanService.getUserClan(user.id),
        clanService.getUserInvites(user.id)
      ])
      
      setUserClan(clan)
      setPendingInvites(invites)
      
      // Set default tab based on clan membership
      if (!clan) {
        setActiveTab('search')
      }
    } catch (error) {
      console.error('Error loading clan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClan = async (clanId: string) => {
    if (!user) return

    try {
      await clanService.joinClan(user.id, clanId)
      await loadClanData() // Reload data
    } catch (error) {
      console.error('Error joining clan:', error)
      alert(error instanceof Error ? error.message : 'Failed to join clan')
    }
  }

  const handleLeaveClan = async () => {
    if (!user || !userClan) return

    const confirmed = window.confirm(
      'Are you sure you want to leave this clan? This action cannot be undone.'
    )
    
    if (!confirmed) return

    try {
      await clanService.leaveClan(user.id)
      await loadClanData() // Reload data
    } catch (error) {
      console.error('Error leaving clan:', error)
      alert(error instanceof Error ? error.message : 'Failed to leave clan')
    }
  }

  const handleCreateClan = async (name: string, description: string) => {
    if (!user) return

    try {
      await clanService.createClan(name, description, user.id)
      await loadClanData() // Reload data
    } catch (error) {
      console.error('Error creating clan:', error)
      alert(error instanceof Error ? error.message : 'Failed to create clan')
    }
  }

  const handleInviteResponse = async (inviteId: string, accept: boolean) => {
    try {
      await clanService.respondToInvite(inviteId, accept)
      await loadClanData() // Reload data
    } catch (error) {
      console.error('Error responding to invite:', error)
      alert(error instanceof Error ? error.message : 'Failed to respond to invite')
    }
  }

  if (!user) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏰</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Join the Community</h3>
          <p className="text-gray-600">Sign in to join or create a clan and connect with other farmers.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading clan information...</p>
        </div>
      </div>
    )
  }

  const tabs = userClan ? [
    { key: 'overview', label: 'Overview', icon: '🏰' },
    { key: 'members', label: 'Members', icon: '👥' },
    { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { key: 'search', label: 'Find Clans', icon: '🔍' },
    ...(pendingInvites.length > 0 ? [{ key: 'invites', label: 'Invites', icon: '📨' }] : [])
  ] : [
    { key: 'search', label: 'Find Clans', icon: '🔍' },
    ...(pendingInvites.length > 0 ? [{ key: 'invites', label: 'Invites', icon: '📨' }] : [])
  ] as const

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userClan ? `${userClan.name}` : 'Clans'}
          </h2>
          <p className="text-gray-600">
            {userClan 
              ? 'Collaborate with your clan members and compete together'
              : 'Join a clan to collaborate with other farmers and compete together'
            }
          </p>
        </div>
        
        {userClan && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Your Clan</p>
              <p className="font-medium text-gray-900">{userClan.member_count} members</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏰</span>
            </div>
          </div>
        )}
      </div>

      {/* Pending Invites Alert */}
      {pendingInvites.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                You have {pendingInvites.length} pending clan invite{pendingInvites.length > 1 ? 's' : ''}!
                <button
                  onClick={() => setActiveTab('invites')}
                  className="ml-2 font-medium underline hover:no-underline"
                >
                  View invites
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

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
                {tab.key === 'invites' && pendingInvites.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {pendingInvites.length}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && userClan && (
          <ClanOverview 
            clan={userClan} 
            onLeaveClan={handleLeaveClan}
            onRefresh={loadClanData}
          />
        )}

        {activeTab === 'members' && userClan && (
          <ClanMembers clanId={userClan.id} />
        )}

        {activeTab === 'leaderboard' && userClan && (
          <ClanLeaderboard clanId={userClan.id} />
        )}

        {activeTab === 'search' && (
          <ClanSearch 
            onJoinClan={handleJoinClan}
            onCreateClan={handleCreateClan}
            userClan={userClan}
          />
        )}

        {activeTab === 'invites' && (
          <ClanInvites 
            invites={pendingInvites}
            onRespond={handleInviteResponse}
          />
        )}
      </div>
    </div>
  )
}