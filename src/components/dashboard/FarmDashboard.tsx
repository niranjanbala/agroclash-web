'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '@/lib/services/factory'
import { Plot, Crop, WeatherData, XPLog } from '@/lib/types'
import { PlotOverview } from './PlotOverview'
import { CropSummary } from './CropSummary'
import { WeatherWidget } from './WeatherWidget'
import { XPProgress } from './XPProgress'
import { QuickActions } from './QuickActions'
import { RecentActivity } from './RecentActivity'
import { MarketInsights } from './MarketInsights'
import { NotificationBell } from '../notifications/NotificationBell'
import { OfflineIndicator } from '../offline/OfflineIndicator'
import { useOfflineData } from '@/hooks/useOfflineData'

interface DashboardStats {
  totalPlots: number
  totalCrops: number
  activeCrops: number
  readyToHarvest: number
  totalXP: number
  currentLevel: number
  xpToNextLevel: number
}

interface FarmDashboardProps {
  className?: string
}

export function FarmDashboard({ className = '' }: FarmDashboardProps) {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalPlots: 0,
    totalCrops: 0,
    activeCrops: 0,
    readyToHarvest: 0,
    totalXP: 0,
    currentLevel: 1,
    xpToNextLevel: 100
  })
  const [plots, setPlots] = useState<Plot[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [recentActivity, setRecentActivity] = useState<XPLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const { isOnline, queueAction } = useOfflineData()
  
  const plotService = ServiceFactory.getPlotService()
  const cropService = ServiceFactory.getCropService()
  const weatherService = ServiceFactory.getWeatherService()
  const xpService = ServiceFactory.getXPService()

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async (isRefresh = false) => {
    if (!user) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Load all dashboard data in parallel
      const [
        userPlots,
        userCrops,
        weatherData,
        xpLogs,
        levelProgress
      ] = await Promise.allSettled([
        plotService.getPlots(user.id),
        getAllUserCrops(user.id),
        getWeatherForUser(),
        xpService.getXPLogs(user.id, 10),
        xpService.getLevelProgress(user.id)
      ])

      // Process plots
      const plotsData = userPlots.status === 'fulfilled' ? userPlots.value : []
      setPlots(plotsData)

      // Process crops
      const cropsData = userCrops.status === 'fulfilled' ? userCrops.value : []
      setCrops(cropsData)

      // Process weather
      const weatherResult = weatherData.status === 'fulfilled' ? weatherData.value : null
      setWeather(weatherResult)

      // Process recent activity
      const activityData = xpLogs.status === 'fulfilled' ? xpLogs.value : []
      setRecentActivity(activityData)

      // Process level progress
      const progressData = levelProgress.status === 'fulfilled' ? levelProgress.value : {
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: 100
      }

      // Calculate dashboard stats
      const activeCrops = cropsData.filter(crop => 
        crop.status === 'planted' || crop.status === 'growing' || crop.status === 'flowering'
      )
      const readyToHarvest = cropsData.filter(crop => crop.status === 'ready')

      setStats({
        totalPlots: plotsData.length,
        totalCrops: cropsData.length,
        activeCrops: activeCrops.length,
        readyToHarvest: readyToHarvest.length,
        totalXP: progressData.currentXP,
        currentLevel: progressData.currentLevel,
        xpToNextLevel: progressData.xpToNextLevel
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getAllUserCrops = async (userId: string): Promise<Crop[]> => {
    const userPlots = await plotService.getPlots(userId)
    const allCrops = await Promise.all(
      userPlots.map(plot => cropService.getCrops(plot.id))
    )
    return allCrops.flat()
  }

  const getWeatherForUser = async (): Promise<WeatherData | null> => {
    if (!user?.location) return null
    
    try {
      return await weatherService.getForecast({
        latitude: user.location.latitude,
        longitude: user.location.longitude
      })
    } catch (error) {
      console.error('Error loading weather:', error)
      return null
    }
  }

  const handleRefresh = () => {
    loadDashboardData(true)
  }

  const handleQuickAction = async (action: string, data?: any) => {
    if (!user) return

    try {
      // Queue action for offline support
      await queueAction('CREATE', action, `${action}-${Date.now()}`, {
        userId: user.id,
        action,
        data,
        timestamp: Date.now()
      })

      // Refresh dashboard after action
      setTimeout(() => loadDashboardData(true), 500)
    } catch (error) {
      console.error('Error performing quick action:', error)
    }
  }

  if (!user) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🌱</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AgroClash</h2>
          <p className="text-gray-600 mb-6">Sign in to start managing your farm</p>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your farm dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🌱</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AgroClash</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <OfflineIndicator />
              <NotificationBell />
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Refresh dashboard"
              >
                <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">Level {stats.currentLevel}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📍</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Plots</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPlots}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">🌱</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Crops</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeCrops}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">🌾</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ready to Harvest</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.readyToHarvest}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">⭐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total XP</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalXP.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Plot Overview */}
            <PlotOverview 
              plots={plots} 
              onPlotAction={handleQuickAction}
              loading={refreshing}
            />

            {/* Crop Summary */}
            <CropSummary 
              crops={crops}
              onCropAction={handleQuickAction}
              loading={refreshing}
            />

            {/* Market Insights */}
            <MarketInsights 
              crops={crops}
              loading={refreshing}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* XP Progress */}
            <XPProgress 
              currentLevel={stats.currentLevel}
              currentXP={stats.totalXP}
              xpToNextLevel={stats.xpToNextLevel}
            />

            {/* Weather Widget */}
            {weather && (
              <WeatherWidget 
                weather={weather}
                loading={refreshing}
              />
            )}

            {/* Quick Actions */}
            <QuickActions 
              onAction={handleQuickAction}
              stats={stats}
            />

            {/* Recent Activity */}
            <RecentActivity 
              activities={recentActivity}
              loading={refreshing}
            />
          </div>
        </div>

        {/* Mobile-friendly bottom navigation would go here */}
        {/* This would be implemented as a separate component for mobile */}
      </main>
    </div>
  )
}