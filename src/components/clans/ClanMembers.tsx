'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { MockClanService } from '@/lib/services/mock/clan.service'
import { User } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface ClanMembersProps {
  clanId: string
  className?: string
}

export function ClanMembers({ clanId, className = '' }: ClanMembersProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'xp' | 'contribution' | 'joined'>('xp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  const clanService = new MockClanService()

  useEffect(() => {
    loadMembers()
  }, [clanId])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const clanMembers = await clanService.getClanMembers(clanId)
      setMembers(clanMembers)
    } catch (error) {
      console.error('Error loading clan members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortedAndFilteredMembers = () => {
    let filteredMembers = members

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    return filteredMembers.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'level':
          aValue = a.level
          bValue = b.level
          break
        case 'xp':
          aValue = a.xp
          bValue = b.xp
          break
        case 'contribution':
          aValue = (a as any).clan_contribution_xp || 0
          bValue = (b as any).clan_contribution_xp || 0
          break
        case 'joined':
          aValue = new Date((a as any).clan_joined_at || a.created_at).getTime()
          bValue = new Date((b as any).clan_joined_at || b.created_at).getTime()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return '👑'
      case 'admin': return '⭐'
      case 'member': return '👤'
      default: return '👤'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'bg-yellow-100 text-yellow-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'member': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return '↕️'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const currentUserMember = members.find(m => m.id === user?.id)
  const isAdmin = currentUserMember && ((currentUserMember as any).clan_role === 'admin' || (currentUserMember as any).clan_role === 'leader')

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading clan members...</p>
        </div>
      </div>
    )
  }

  const sortedMembers = getSortedAndFilteredMembers()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Clan Members</h3>
          <p className="text-sm text-gray-600">
            {sortedMembers.length} of {members.length} members
          </p>
        </div>
        
        <div className="w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Member</span>
                    <span>{getSortIcon('name')}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('level')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Level</span>
                    <span>{getSortIcon('level')}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('xp')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Total XP</span>
                    <span>{getSortIcon('xp')}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('contribution')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Contribution</span>
                    <span>{getSortIcon('contribution')}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('joined')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Joined</span>
                    <span>{getSortIcon('joined')}</span>
                  </div>
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMembers.map((member, index) => {
                const memberData = member as any
                const isCurrentUser = member.id === user?.id
                
                return (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-green-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-green-600">(You)</span>
                              )}
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(memberData.clan_role)}`}>
                              {getRoleIcon(memberData.clan_role)} {memberData.clan_role}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.level}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.xp.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(memberData.clan_contribution_xp || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.xp > 0 ? `${Math.round(((memberData.clan_contribution_xp || 0) / member.xp) * 100)}%` : '0%'} of total
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(memberData.clan_joined_at || member.created_at)}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!isCurrentUser && memberData.clan_role !== 'leader' && (
                          <div className="flex justify-end space-x-2">
                            {memberData.clan_role === 'member' && (
                              <button className="text-blue-600 hover:text-blue-900">
                                Promote
                              </button>
                            )}
                            {memberData.clan_role === 'admin' && (
                              <button className="text-yellow-600 hover:text-yellow-900">
                                Demote
                              </button>
                            )}
                            <button className="text-red-600 hover:text-red-900">
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {sortedMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No members found' : 'No members yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No members match "${searchQuery}"`
                : 'Invite some farmers to join your clan!'
              }
            </p>
          </div>
        )}
      </div>

      {/* Member Stats */}
      {sortedMembers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(sortedMembers.reduce((sum, m) => sum + m.level, 0) / sortedMembers.length)}
              </p>
              <p className="text-sm text-gray-600">Average Level</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(sortedMembers.reduce((sum, m) => sum + m.xp, 0) / sortedMembers.length).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Average XP</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {Math.max(...sortedMembers.map(m => m.level))}
              </p>
              <p className="text-sm text-gray-600">Highest Level</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {sortedMembers.reduce((sum, m) => sum + ((m as any).clan_contribution_xp || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Contribution</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}