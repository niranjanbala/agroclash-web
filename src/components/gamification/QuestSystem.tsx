'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { formatDate } from '@/lib/utils'

interface Quest {
  id: string
  name: string
  description: string
  quest_type: 'daily' | 'weekly' | 'monthly' | 'achievement'
  xp_reward: number
  requirements: any
  is_active: boolean
  start_date?: string
  end_date?: string
}

interface UserQuest {
  id: string
  user_id: string
  quest_id: string
  status: 'active' | 'completed' | 'failed' | 'expired'
  progress: any
  started_at: string
  completed_at?: string
}

interface QuestSystemProps {
  className?: string
}

export function QuestSystem({ className = '' }: QuestSystemProps) {
  const { user } = useAuth()
  const [quests, setQuests] = useState<Quest[]>([])
  const [userQuests, setUserQuests] = useState<UserQuest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'achievement'>('daily')

  useEffect(() => {
    if (user) {
      loadQuests()
    }
  }, [user])

  const loadQuests = async () => {
    try {
      setLoading(true)
      
      // Mock quest data - in real implementation, this would come from the database
      const mockQuests: Quest[] = [
        // Daily Quests
        {
          id: '1',
          name: 'Daily Harvest',
          description: 'Harvest at least 1 crop today',
          quest_type: 'daily',
          xp_reward: 25,
          requirements: { crops_to_harvest: 1 },
          is_active: true
        },
        {
          id: '2',
          name: 'Water Your Plants',
          description: 'Water 3 crops today',
          quest_type: 'daily',
          xp_reward: 15,
          requirements: { crops_to_water: 3 },
          is_active: true
        },
        {
          id: '3',
          name: 'Check Weather',
          description: 'Check the weather forecast',
          quest_type: 'daily',
          xp_reward: 10,
          requirements: { weather_checks: 1 },
          is_active: true
        },
        
        // Weekly Quests
        {
          id: '4',
          name: 'Weekly Planter',
          description: 'Plant 3 new crops this week',
          quest_type: 'weekly',
          xp_reward: 100,
          requirements: { crops_to_plant: 3 },
          is_active: true
        },
        {
          id: '5',
          name: 'Pest Control',
          description: 'Win 2 pest battles this week',
          quest_type: 'weekly',
          xp_reward: 75,
          requirements: { battles_to_win: 2 },
          is_active: true
        },
        {
          id: '6',
          name: 'Market Trader',
          description: 'Sell crops worth $100 this week',
          quest_type: 'weekly',
          xp_reward: 80,
          requirements: { sales_value: 100 },
          is_active: true
        },
        
        // Monthly Quests
        {
          id: '7',
          name: 'Monthly Explorer',
          description: 'Create a new plot this month',
          quest_type: 'monthly',
          xp_reward: 200,
          requirements: { plots_to_create: 1 },
          is_active: true
        },
        {
          id: '8',
          name: 'Clan Helper',
          description: 'Help 5 clan members this month',
          quest_type: 'monthly',
          xp_reward: 150,
          requirements: { clan_helps: 5 },
          is_active: true
        },
        
        // Achievement Quests
        {
          id: '9',
          name: 'Social Farmer',
          description: 'Join a clan',
          quest_type: 'achievement',
          xp_reward: 150,
          requirements: { join_clan: true },
          is_active: true
        },
        {
          id: '10',
          name: 'Master Harvester',
          description: 'Harvest 50 crops total',
          quest_type: 'achievement',
          xp_reward: 500,
          requirements: { total_harvests: 50 },
          is_active: true
        }
      ]

      // Mock user quest progress
      const mockUserQuests: UserQuest[] = [
        {
          id: '1',
          user_id: user!.id,
          quest_id: '1',
          status: 'active',
          progress: { crops_harvested: 0 },
          started_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: user!.id,
          quest_id: '2',
          status: 'completed',
          progress: { crops_watered: 3 },
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        },
        {
          id: '3',
          user_id: user!.id,
          quest_id: '4',
          status: 'active',
          progress: { crops_planted: 1 },
          started_at: new Date().toISOString()
        }
      ]

      setQuests(mockQuests)
      setUserQuests(mockUserQuests)
    } catch (error) {
      console.error('Error loading quests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getQuestsByType = (type: Quest['quest_type']) => {
    return quests.filter(quest => quest.quest_type === type && quest.is_active)
  }

  const getUserQuestProgress = (questId: string) => {
    return userQuests.find(uq => uq.quest_id === questId)
  }

  const calculateProgress = (quest: Quest, userQuest?: UserQuest): number => {
    if (!userQuest) return 0
    if (userQuest.status === 'completed') return 100

    const progress = userQuest.progress || {}
    const requirements = quest.requirements

    // Calculate progress based on quest type
    if (requirements.crops_to_harvest) {
      return Math.min((progress.crops_harvested || 0) / requirements.crops_to_harvest * 100, 100)
    }
    if (requirements.crops_to_water) {
      return Math.min((progress.crops_watered || 0) / requirements.crops_to_water * 100, 100)
    }
    if (requirements.crops_to_plant) {
      return Math.min((progress.crops_planted || 0) / requirements.crops_to_plant * 100, 100)
    }
    if (requirements.weather_checks) {
      return Math.min((progress.weather_checks || 0) / requirements.weather_checks * 100, 100)
    }
    if (requirements.battles_to_win) {
      return Math.min((progress.battles_won || 0) / requirements.battles_to_win * 100, 100)
    }
    if (requirements.sales_value) {
      return Math.min((progress.sales_value || 0) / requirements.sales_value * 100, 100)
    }
    if (requirements.plots_to_create) {
      return Math.min((progress.plots_created || 0) / requirements.plots_to_create * 100, 100)
    }
    if (requirements.clan_helps) {
      return Math.min((progress.clan_helps || 0) / requirements.clan_helps * 100, 100)
    }
    if (requirements.join_clan) {
      return progress.joined_clan ? 100 : 0
    }
    if (requirements.total_harvests) {
      return Math.min((progress.total_harvests || 0) / requirements.total_harvests * 100, 100)
    }

    return 0
  }

  const getQuestIcon = (questType: Quest['quest_type']): string => {
    const icons = {
      daily: '📅',
      weekly: '📊',
      monthly: '📆',
      achievement: '🏆'
    }
    return icons[questType]
  }

  const getQuestTypeColor = (questType: Quest['quest_type']): string => {
    const colors = {
      daily: 'text-blue-600',
      weekly: 'text-green-600',
      monthly: 'text-purple-600',
      achievement: 'text-yellow-600'
    }
    return colors[questType]
  }

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading quests...</p>
      </div>
    )
  }

  const activeQuests = getQuestsByType(activeTab)

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['daily', 'weekly', 'monthly', 'achievement'] as const).map(tab => {
            const questCount = getQuestsByType(tab).length
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{getQuestIcon(tab)}</span>
                  <span className="capitalize">{tab}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {questCount}
                  </span>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        {activeQuests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">{getQuestIcon(activeTab)}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} quests available
            </h3>
            <p className="text-gray-600">
              Check back later for new {activeTab} challenges!
            </p>
          </div>
        ) : (
          activeQuests.map(quest => {
            const userQuest = getUserQuestProgress(quest.id)
            const progress = calculateProgress(quest, userQuest)
            const isCompleted = userQuest?.status === 'completed'

            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                userQuest={userQuest}
                progress={progress}
                isCompleted={isCompleted}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

interface QuestCardProps {
  quest: Quest
  userQuest?: UserQuest
  progress: number
  isCompleted: boolean
}

function QuestCard({ quest, userQuest, progress, isCompleted }: QuestCardProps) {
  const getStatusColor = () => {
    if (isCompleted) return 'border-green-500 bg-green-50'
    if (userQuest) return 'border-blue-500 bg-blue-50'
    return 'border-gray-300 bg-white'
  }

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-green-600'
    if (progress >= 50) return 'bg-yellow-600'
    return 'bg-blue-600'
  }

  return (
    <div className={`border-2 rounded-lg p-4 transition-all ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{quest.name}</h3>
            {isCompleted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Completed
              </span>
            )}
            {userQuest && !isCompleted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                In Progress
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
          
          {/* Quest Type and Reward */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="capitalize">{quest.quest_type} Quest</span>
            <span>•</span>
            <span className="text-green-600 font-medium">+{quest.xp_reward} XP</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {userQuest && !isCompleted && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Completion Date */}
      {isCompleted && userQuest?.completed_at && (
        <div className="text-xs text-gray-500">
          Completed on {formatDate(userQuest.completed_at, 'long')}
        </div>
      )}

      {/* Quest Requirements Detail */}
      {!isCompleted && (
        <div className="text-xs text-gray-500 mt-2">
          {quest.requirements.crops_to_harvest && (
            <span>Harvest {quest.requirements.crops_to_harvest} crop{quest.requirements.crops_to_harvest > 1 ? 's' : ''}</span>
          )}
          {quest.requirements.crops_to_water && (
            <span>Water {quest.requirements.crops_to_water} crop{quest.requirements.crops_to_water > 1 ? 's' : ''}</span>
          )}
          {quest.requirements.crops_to_plant && (
            <span>Plant {quest.requirements.crops_to_plant} crop{quest.requirements.crops_to_plant > 1 ? 's' : ''}</span>
          )}
          {quest.requirements.weather_checks && (
            <span>Check weather forecast</span>
          )}
          {quest.requirements.battles_to_win && (
            <span>Win {quest.requirements.battles_to_win} pest battle{quest.requirements.battles_to_win > 1 ? 's' : ''}</span>
          )}
          {quest.requirements.sales_value && (
            <span>Sell crops worth ${quest.requirements.sales_value}</span>
          )}
          {quest.requirements.plots_to_create && (
            <span>Create {quest.requirements.plots_to_create} new plot{quest.requirements.plots_to_create > 1 ? 's' : ''}</span>
          )}
          {quest.requirements.clan_helps && (
            <span>Help {quest.requirements.clan_helps} clan member{quest.requirements.clan_helps > 1 ? 's' : ''}</span>
          )}
          {quest.requirements.join_clan && (
            <span>Join a clan</span>
          )}
          {quest.requirements.total_harvests && (
            <span>Harvest {quest.requirements.total_harvests} crops total</span>
          )}
        </div>
      )}
    </div>
  )
}