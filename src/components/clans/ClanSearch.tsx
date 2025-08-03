'use client'

import React, { useState, useEffect } from 'react'
import { MockClanService } from '@/lib/services/mock/clan.service'
import { Clan } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface ClanSearchProps {
  onJoinClan: (clanId: string) => void
  onCreateClan: (name: string, description: string) => void
  userClan: Clan | null
  className?: string
}

export function ClanSearch({ onJoinClan, onCreateClan, userClan, className = '' }: ClanSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Clan[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  })
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  const clanService = new MockClanService()

  useEffect(() => {
    // Load initial clans
    handleSearch('')
  }, [])

  const handleSearch = async (query: string = searchQuery) => {
    try {
      setLoading(true)
      const results = await clanService.searchClans(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching clans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors: Record<string, string> = {}
    
    if (!createForm.name.trim()) {
      errors.name = 'Clan name is required'
    } else if (createForm.name.length < 3) {
      errors.name = 'Clan name must be at least 3 characters'
    } else if (createForm.name.length > 50) {
      errors.name = 'Clan name must be less than 50 characters'
    }
    
    if (createForm.description && createForm.description.length > 500) {
      errors.description = 'Description must be less than 500 characters'
    }
    
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors)
      return
    }

    try {
      await onCreateClan(createForm.name.trim(), createForm.description.trim())
      setCreateForm({ name: '', description: '' })
      setCreateErrors({})
      setShowCreateForm(false)
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const getClanStrength = (clan: Clan): 'High' | 'Medium' | 'Low' => {
    const score = clan.member_count * 10 + clan.total_xp / 1000
    if (score > 500) return 'High'
    if (score > 200) return 'Medium'
    return 'Low'
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'High': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {userClan ? 'Discover Other Clans' : 'Find a Clan to Join'}
          </h3>
          <p className="text-sm text-gray-600">
            {userClan 
              ? 'Explore other clans in the community'
              : 'Join a clan to collaborate with other farmers and compete together'
            }
          </p>
        </div>
        
        {!userClan && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            + Create Clan
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search clans by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Searching clans...</p>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map(clan => {
            const strength = getClanStrength(clan)
            const avgXP = Math.round(clan.total_xp / clan.member_count)
            
            return (
              <div key={clan.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{clan.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(strength)}`}>
                        {strength} Activity
                      </span>
                      {clan.member_count >= 45 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Nearly Full
                        </span>
                      )}
                    </div>
                    
                    {clan.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed">{clan.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{clan.member_count}</p>
                        <p className="text-gray-600">Members</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{clan.total_xp.toLocaleString()}</p>
                        <p className="text-gray-600">Total XP</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{avgXP.toLocaleString()}</p>
                        <p className="text-gray-600">Avg XP/Member</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(clan.created_at, 'short')}</p>
                        <p className="text-gray-600">Founded</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-6">
                    {userClan ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-2xl">🏰</span>
                        </div>
                        <p className="text-xs text-gray-500">Already in clan</p>
                      </div>
                    ) : clan.member_count >= 50 ? (
                      <div className="text-center">
                        <button
                          disabled
                          className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
                        >
                          Full
                        </button>
                        <p className="text-xs text-gray-500 mt-1">Clan is full</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <button
                          onClick={() => onJoinClan(clan.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        >
                          Join Clan
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          {50 - clan.member_count} spots left
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No clans found' : 'No clans available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No clans match "${searchQuery}". Try a different search term.`
                  : 'Be the first to create a clan in your area!'
                }
              </p>
              {!userClan && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Create New Clan
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Clan Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Clan</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setCreateForm({ name: '', description: '' })
                  setCreateErrors({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clan Name *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter clan name"
                  maxLength={50}
                />
                {createErrors.name && (
                  <p className="text-red-600 text-sm mt-1">{createErrors.name}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {createForm.name.length}/50 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe your clan's goals and values..."
                  maxLength={500}
                />
                {createErrors.description && (
                  <p className="text-red-600 text-sm mt-1">{createErrors.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {createForm.description.length}/500 characters
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> As the clan creator, you'll become the clan leader and be responsible for managing members and clan activities.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setCreateForm({ name: '', description: '' })
                    setCreateErrors({})
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!createForm.name.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Clan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}