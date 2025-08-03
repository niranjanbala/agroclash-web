'use client'

import React, { useState, useEffect } from 'react'
import { Crop, MarketPrice } from '@/lib/types'
import { ServiceFactory } from '@/lib/services/factory'

interface MarketInsightsProps {
  crops: Crop[]
  loading?: boolean
  className?: string
}

interface CropInsight {
  cropName: string
  currentPrice: number
  trend: 'up' | 'down' | 'stable'
  priceChange: number
  recommendation: 'buy' | 'sell' | 'hold'
  userHas: number
}

export function MarketInsights({ crops, loading = false, className = '' }: MarketInsightsProps) {
  const [insights, setInsights] = useState<CropInsight[]>([])
  const [marketLoading, setMarketLoading] = useState(true)

  const marketService = ServiceFactory.getMarketService()

  useEffect(() => {
    loadMarketInsights()
  }, [crops])

  const loadMarketInsights = async () => {
    try {
      setMarketLoading(true)
      
      // Get market prices for all crops
      const marketPrices = await marketService.getPrices()
      
      // Get unique crop names from user's crops
      const userCropNames = [...new Set(crops.map(crop => crop.name))]
      
      // Create insights for user's crops and popular market crops
      const allCropNames = [...new Set([...userCropNames, 'Tomatoes', 'Corn', 'Wheat', 'Rice', 'Soybeans'])]
      
      const cropInsights: CropInsight[] = allCropNames.map(cropName => {
        const cropPrices = marketPrices.filter(price => price.crop_name === cropName)
        const latestPrice = cropPrices[0] || {
          crop_name: cropName,
          price_per_kg: Math.random() * 10 + 5, // Mock price
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          currency: 'USD',
          market_location: 'Local Market',
          date: new Date().toISOString()
        }
        
        const userCropCount = crops.filter(crop => crop.name === cropName).length
        
        // Generate mock insights
        const priceChange = (Math.random() - 0.5) * 2 // -1 to 1
        const recommendation = latestPrice.trend === 'up' ? 'sell' : 
                             latestPrice.trend === 'down' ? 'buy' : 'hold'
        
        return {
          cropName,
          currentPrice: latestPrice.price_per_kg,
          trend: latestPrice.trend,
          priceChange,
          recommendation,
          userHas: userCropCount
        }
      })
      
      // Sort by relevance (user crops first, then by price change)
      cropInsights.sort((a, b) => {
        if (a.userHas > 0 && b.userHas === 0) return -1
        if (a.userHas === 0 && b.userHas > 0) return 1
        return Math.abs(b.priceChange) - Math.abs(a.priceChange)
      })
      
      setInsights(cropInsights.slice(0, 6))
    } catch (error) {
      console.error('Error loading market insights:', error)
    } finally {
      setMarketLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'stable': return '➡️'
      default: return '📊'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'stable': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return 'bg-green-100 text-green-800'
      case 'sell': return 'bg-red-100 text-red-800'
      case 'hold': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  const formatPriceChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${(change * 100).toFixed(1)}%`
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Market Insights</h3>
            <p className="text-sm text-gray-600">Price trends and recommendations</p>
          </div>
          <button
            onClick={loadMarketInsights}
            disabled={marketLoading}
            className="text-sm text-green-600 hover:text-green-800 font-medium"
          >
            {marketLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading || marketLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map(insight => (
              <div
                key={insight.cropName}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{insight.cropName}</h4>
                    {insight.userHas > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        You have {insight.userHas}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg ${getTrendColor(insight.trend)}`}>
                      {getTrendIcon(insight.trend)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(insight.currentPrice)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm ${getTrendColor(insight.trend)}`}>
                      {formatPriceChange(insight.priceChange)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRecommendationColor(insight.recommendation)}`}>
                      {insight.recommendation.toUpperCase()}
                    </span>
                  </div>
                  
                  <button className="text-xs text-green-600 hover:text-green-800 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
            
            {/* Market Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Market Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-semibold text-green-600">
                    {insights.filter(i => i.trend === 'up').length}
                  </p>
                  <p className="text-xs text-green-600">Rising</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-lg font-semibold text-red-600">
                    {insights.filter(i => i.trend === 'down').length}
                  </p>
                  <p className="text-xs text-red-600">Falling</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-600">
                    {insights.filter(i => i.trend === 'stable').length}
                  </p>
                  <p className="text-xs text-gray-600">Stable</p>
                </div>
              </div>
            </div>
            
            {/* Quick Tips */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Market Tips</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sell crops when prices are trending upward</li>
                <li>• Consider diversifying your crop portfolio</li>
                <li>• Monitor seasonal price patterns</li>
                <li>• Check market demand before planting</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No market data</h4>
            <p className="text-gray-600 text-sm">
              Market insights will appear here when available
            </p>
          </div>
        )}
      </div>
    </div>
  )
}