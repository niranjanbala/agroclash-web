'use client'

import React from 'react'
import { formatDate } from '@/lib/utils'

interface ClanInvite {
  id: string
  clan_id: string
  inviter_id: string
  invitee_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  clan?: {
    id: string
    name: string
    description?: string
    member_count: number
    total_xp: number
  }
  inviter?: {
    id: string
    name: string
    email: string
  }
}

interface ClanInvitesProps {
  invites: ClanInvite[]
  onRespond: (inviteId: string, accept: boolean) => void
  className?: string
}

export function ClanInvites({ invites, onRespond, className = '' }: ClanInvitesProps) {
  const handleAccept = (inviteId: string) => {
    onRespond(inviteId, true)
  }

  const handleDecline = (inviteId: string) => {
    onRespond(inviteId, false)
  }

  if (invites.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📨</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invites</h3>
          <p className="text-gray-600">
            You don't have any clan invitations at the moment. Explore clans to find one that interests you!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Clan Invitations</h3>
        <p className="text-sm text-gray-600">
          You have {invites.length} pending clan invitation{invites.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Invites List */}
      <div className="space-y-4">
        {invites.map(invite => {
          const clan = invite.clan
          const inviter = invite.inviter
          
          if (!clan || !inviter) {
            return null // Skip invites with missing data
          }

          const avgXP = Math.round(clan.total_xp / clan.member_count)
          
          return (
            <div key={invite.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Invite Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xl">🏰</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{clan.name}</h4>
                      <p className="text-sm text-gray-600">
                        Invited by <span className="font-medium">{inviter.name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Clan Description */}
                  {clan.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed">{clan.description}</p>
                  )}

                  {/* Clan Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">{clan.member_count}</p>
                      <p className="text-xs text-gray-600">Members</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">{clan.total_xp.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Total XP</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">{avgXP.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Avg XP</p>
                    </div>
                  </div>

                  {/* Invite Details */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Invited {formatDate(invite.created_at)}</span>
                    <span>•</span>
                    <span>{50 - clan.member_count} spots remaining</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 ml-6">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleAccept(invite.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleDecline(invite.id)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                    >
                      ✗ Decline
                    </button>
                  </div>
                </div>
              </div>

              {/* Warning for full clans */}
              {clan.member_count >= 45 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Almost full!</strong> This clan only has {50 - clan.member_count} spots remaining. 
                        Accept quickly if you're interested.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Clan Benefits Preview */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h5 className="text-sm font-medium text-blue-900 mb-2">What you'll get:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Collaborate with {clan.member_count} other farmers</li>
                  <li>• Participate in clan challenges and competitions</li>
                  <li>• Share knowledge and get farming tips</li>
                  <li>• Earn bonus XP for clan activities</li>
                  <li>• Access to clan-exclusive features</li>
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">About Clan Invitations</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• You can only be a member of one clan at a time</p>
          <p>• Accepting an invitation will make you a clan member immediately</p>
          <p>• You can leave a clan at any time from the clan overview page</p>
          <p>• Declined invitations cannot be undone - you'll need a new invitation</p>
        </div>
      </div>
    </div>
  )
}