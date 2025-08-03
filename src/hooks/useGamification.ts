'use client'

import React, { useState, useCallback } from 'react'
import { useAuth } from '../components/auth/AuthProvider'
import { ServiceFactory } from '@/lib/services/factory'
import { calculateLevelFromXP } from '@/lib/utils'

interface GamificationState {
  showXPGain: number | null
  showLevelUp: number | null
  showBadgeNotification: any | null
}

export function useGamification() {
  const { user, updateProfile } = useAuth()
  const [state, setState] = useState<GamificationState>({
    showXPGain: null,
    showLevelUp: null,
    showBadgeNotification: null
  })

  const xpService = ServiceFactory.getXPService()

  const awardXP = useCallback(async (
    actionType: string, 
    xpAmount: number, 
    description?: string
  ) => {
    if (!user) return

    try {
      // Award XP through the service
      const xpLog = await xpService.awardXP(user.id, actionType, xpAmount, description)
      
      // Calculate new totals
      const newXP = user.xp + xpLog.xp_awarded
      const oldLevel = user.level
      const newLevel = calculateLevelFromXP(newXP)
      
      // Update user profile
      await updateProfile({
        xp: newXP,
        level: newLevel
      })

      // Show XP gain animation
      setState(prev => ({ ...prev, showXPGain: xpLog.xp_awarded }))

      // Show level up animation if leveled up
      if (newLevel > oldLevel) {
        setTimeout(() => {
          setState(prev => ({ ...prev, showLevelUp: newLevel }))
        }, 1000) // Show after XP gain animation
      }

      return {
        xpAwarded: xpLog.xp_awarded,
        newXP,
        newLevel,
        leveledUp: newLevel > oldLevel
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
      throw error
    }
  }, [user, xpService, updateProfile])

  const clearXPGain = useCallback(() => {
    setState(prev => ({ ...prev, showXPGain: null }))
  }, [])

  const clearLevelUp = useCallback(() => {
    setState(prev => ({ ...prev, showLevelUp: null }))
  }, [])

  const clearBadgeNotification = useCallback(() => {
    setState(prev => ({ ...prev, showBadgeNotification: null }))
  }, [])

  const showBadgeEarned = useCallback((badge: any) => {
    setState(prev => ({ ...prev, showBadgeNotification: badge }))
  }, [])

  // Predefined XP actions with amounts
  const actions = {
    plantCrop: (description?: string) => awardXP('plant_crop', 10, description),
    waterCrop: (description?: string) => awardXP('water_crop', 5, description),
    harvestCrop: (description?: string) => awardXP('harvest_crop', 25, description),
    createPlot: (description?: string) => awardXP('create_plot', 15, description),
    winPestBattle: (description?: string) => awardXP('win_pest_battle', 20, description),
    joinClan: (description?: string) => awardXP('join_clan', 30, description),
    dailyLogin: (description?: string) => awardXP('daily_login', 5, description),
    completeQuest: (xpAmount: number, description?: string) => awardXP('complete_quest', xpAmount, description),
    helpClanMember: (description?: string) => awardXP('help_clan_member', 15, description),
    marketSale: (description?: string) => awardXP('market_sale', 20, description),
    weatherAlertAction: (description?: string) => awardXP('weather_alert_action', 10, description)
  }

  return {
    // State
    showXPGain: state.showXPGain,
    showLevelUp: state.showLevelUp,
    showBadgeNotification: state.showBadgeNotification,
    
    // Actions
    awardXP,
    actions,
    
    // UI Controls
    clearXPGain,
    clearLevelUp,
    clearBadgeNotification,
    showBadgeEarned,
    
    // User info
    currentXP: user?.xp || 0,
    currentLevel: user?.level || 1
  }
}

// Hook for tracking user progress and statistics
export function useUserProgress() {
  const { user } = useAuth()
  const [stats, setStats] = useState<{
    totalXP: number
    currentLevel: number
    xpToNextLevel: number
    totalBadges: number
    completedQuests: number
    activeCrops: number
    totalPlots: number
    loading: boolean
  }>({
    totalXP: 0,
    currentLevel: 1,
    xpToNextLevel: 0,
    totalBadges: 0,
    completedQuests: 0,
    activeCrops: 0,
    totalPlots: 0,
    loading: true
  })

  const loadStats = useCallback(async () => {
    if (!user) return

    try {
      setStats(prev => ({ ...prev, loading: true }))

      // In a real implementation, these would be actual API calls
      const mockStats = {
        totalXP: user.xp,
        currentLevel: user.level,
        xpToNextLevel: Math.max(0, (user.level * user.level * 100) - user.xp),
        totalBadges: 2, // Mock: user has earned 2 badges
        completedQuests: 5, // Mock: user has completed 5 quests
        activeCrops: 3, // Mock: user has 3 active crops
        totalPlots: 1, // Mock: user has 1 plot
        loading: false
      }

      setStats(mockStats)
    } catch (error) {
      console.error('Error loading user progress:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }, [user])

  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  return {
    ...stats,
    refresh: loadStats
  }
}

// Hook for managing quest progress
export function useQuestProgress() {
  const { user } = useAuth()
  const [questProgress, setQuestProgress] = useState<{
    dailyQuests: any[]
    weeklyQuests: any[]
    monthlyQuests: any[]
    achievements: any[]
    loading: boolean
  }>({
    dailyQuests: [],
    weeklyQuests: [],
    monthlyQuests: [],
    achievements: [],
    loading: true
  })

  const updateQuestProgress = useCallback(async (
    questId: string, 
    progressUpdate: any
  ) => {
    // In a real implementation, this would update quest progress in the database
    console.log('Updating quest progress:', questId, progressUpdate)
    
    // Mock implementation
    setQuestProgress(prev => ({
      ...prev,
      dailyQuests: prev.dailyQuests.map(quest =>
        quest.id === questId
          ? { ...quest, progress: { ...quest.progress, ...progressUpdate } }
          : quest
      )
    }))
  }, [])

  const completeQuest = useCallback(async (questId: string) => {
    // In a real implementation, this would mark the quest as completed
    console.log('Completing quest:', questId)
    
    // Mock implementation
    setQuestProgress(prev => ({
      ...prev,
      dailyQuests: prev.dailyQuests.map(quest =>
        quest.id === questId
          ? { ...quest, status: 'completed', completed_at: new Date().toISOString() }
          : quest
      )
    }))
  }, [])

  return {
    ...questProgress,
    updateQuestProgress,
    completeQuest
  }
}