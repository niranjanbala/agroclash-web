'use client'

import React, { useState, useEffect } from 'react'
import { ServiceFactory } from '@/lib/services/factory'
import { MarketPrice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface MarketAnalyticsProps {
  className?: string
}

interface MarketInsight {
  type: 'opportunity' | 'warning' | 'trend' | 'seasonal'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  cropName: string
  expectedChange: number
  timeframe: string
}

export function MarketAnalytics({ className = '' }: MarketAnalyticsProps) {
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [marketData, setMarketData] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d')

  const marketService = ServiceFactory.getMarketService()

  useEffect(() => {
    loadAnalytics()
  }, [selectedTimeframe])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Load market data for analysis
      const prices = await marketService.getPrices()
      setMarketData(prices)
      
      // Generate insights based on market data
      const generatedInsights = await generateMarketInsights(prices)
      setInsights(generatedInsights)
      
    } catch (error) {
      console.error('Error loading market analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMarketInsights = async (prices: MarketPrice[]): Promise<MarketInsight[]> => {
    const insights: MarketInsight[] = []
    
    // Group prices by crop
    const cropPrices = prices.reduce((acc, price) => {
      if (!acc[price.crop_name]) {
        acc[price.crop_name] = []
      }
      acc[price.crop_name].push(price)
      return acc
    }, {} as Record<string, MarketPrice[]>)

    // Analyze each crop
    Object.entries(cropPrices).forEach(([cropName, cropPriceList]) => {
      const avgPrice = cropPriceList.reduce((sum, p) => sum + p.price_per_kg, 0) / cropPriceList.length
      const trendingUp = cropPriceList.filter(p => p.trend === 'up').length
      const trendingDown = cropPriceList.filter(p => p.trend === 'down').length
      
      // High opportunity crops
      if (trendingUp > trendingDown && avgPrice > 2.0) {
        insights.push({
          type: 'opportunity',
          title: `${cropName} showing strong upward trend`,
          description: `Average price of $${avgPrice.toFixed(2)}/kg with ${trendingUp} markets trending up`,
          impact: 'high',
          cropName,
          expectedChange: 15,
          timeframe: 'Next 2 weeks'
        })
      }
      
      // Price warnings
      if (trendingDown > trendingUp && avgPrice < 1.0) {
        insights.push({
          type: 'warning',
          title: `${cropName} prices declining`,
          description: `Consider holding or finding alternative markets. ${trendingDown} markets trending down`,
          impact: 'medium',
          cropName,
          expectedChange: -10,
          timeframe: 'Next week'
        })
      }
      
      // Seasonal opportunities
      if (isSeasonalOpportunity(cropName)) {
        insights.push({
          type: 'seasonal',
          title: `${cropName} entering peak season`,
          description: 'Historical data shows price increases during this period',
          impact: 'medium',
          cropName,
          expectedChange: 20,
          timeframe: 'Next month'
        })
      }
    })

    // Add general market trends
    const overallTrend = calculateOverallTrend(prices)
    if (overallTrend.strength > 0.6) {
      insights.push({
        type: 'trend',
        title: `Market showing ${overallTrend.direction} trend`,
        description: `${Math.round(overallTrend.strength * 100)}% of crops are trending ${overallTrend.direction}`,
        impact: overallTrend.strength > 0.8 ? 'high' : 'medium',
        cropName: 'Overall Market',
        expectedChange: overallTrend.direction === 'up' ? 12 : -8,
        timeframe: 'Next 2 weeks'
      })
    }

    return insights.slice(0, 6) // Return top 6 insights
  }

  const isSeasonalOpportunity = (cropName: string): boolean => {
    const currentMonth = new Date().getMonth()
    const seasonalCrops: Record<string, number[]> = {
      'Tomatoes': [5, 6, 7, 8], // Summer months
      'Corn': [7, 8, 9], // Late summer
      'Wheat': [5, 6], // Early summer
      'Lettuce': [3, 4, 9, 10], // Spring and fall
      'Peppers': [6, 7, 8, 9] // Summer to early fall
    }
    
    return seasonalCrops[cropName]?.includes(currentMonth) || false
  }

  const calculateOverallTrend = (prices: MarketPrice[]): { direction: 'up' | 'down', strength: number } => {
    const upTrending = prices.filter(p => p.trend === 'up').length
    const downTrending = prices.filter(p => p.trend === 'down').length
    const total = prices.length
    
    if (upTrending > downTrending) {
      return { direction: 'up', strength: upTrending / total }
    } else {
      return { direction: 'down', strength: downTrending / total }
    }
  }

  const getInsightIcon = (type: MarketInsight['type']) => {
    switch (type) {
      case 'opportunity': return '🚀'
      case 'warning': return '⚠️'
      case 'trend': return '📈'
      case 'seasonal': return '🌱'
      default: return '💡'
    }
  }

  const getInsightColor = (type: MarketInsight['type'], impact: MarketInsight['impact']) => {
    const baseColors = {
      opportunity: 'green',
      warning: 'red',
      trend: 'blue',
      seasonal: 'yellow'
    }
    
    const intensities = {
      high: '600',
      medium: '500',
      low: '400'
    }
    
    const color = baseColors[type]
    const intensity = intensities[impact]
    
    return {
      bg: `bg-${color}-50`,
      border: `border-${color}-200`,
      text: `text-${color}-${intensity}`,
      icon: `text-${color}-600`
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Analyzing market data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Market Analytics</h3>
          <p className="text-sm text-gray-600">AI-powered insights and recommendations</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Volatility</p>
              <p className="text-2xl font-semibold text-gray-900">
                {marketData.length > 0 ? 
                  `${Math.round((marketData.filter(p => p.trend !== 'stable').length / marketData.length) * 100)}%` : 
                  '0%'
                }
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Opportunities</p>
              <p className="text-2xl font-semibold text-gray-900">
                {insights.filter(i => i.type === 'opportunity').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">🚀</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {insights.filter(i => i.type === 'warning').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Market Insights</h4>
        
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const colors = getInsightColor(insight.type, insight.impact)
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-xl">{getInsightIcon(insight.type)}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-medium ${colors.text}`}>
                          {insight.title}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {insight.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Impact: {insight.impact}</span>
                          <span>Timeframe: {insight.timeframe}</span>
                          <span className={insight.expectedChange > 0 ? 'text-green-600' : 'text-red-600'}>
                            {insight.expectedChange > 0 ? '+' : ''}{insight.expectedChange}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {insight.impact} impact
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
            <p className="text-gray-600">
              Market analysis will appear here once sufficient data is available.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600">📈</span>
              </div>
              <span className="text-sm font-medium text-gray-900">View Trends</span>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600">🔍</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Price Alerts</span>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-yellow-600">💡</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Get Advice</span>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600">📊</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Export Data</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}