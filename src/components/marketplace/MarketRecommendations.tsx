'use client'

import React, { useState, useEffect } from 'react'
import { ServiceFactory } from '@/lib/services/factory'
import { formatCurrency } from '@/lib/utils'

interface Recommendation {
  cropName: string
  reason: string
  expectedPrice: number
}

interface MarketRecommendationsProps {
  userId: string
  className?: string
}

export function MarketRecommendations({ userId, className = '' }: MarketRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'planting' | 'selling' | 'market'>('all')

  const marketService = ServiceFactory.getMarketService()

  useEffect(() => {
    loadRecommendations()
  }, [userId])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const recs = await marketService.getRecommendations(userId)
      setRecommendations(recs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
      console.error('Error loading recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationIcon = (reason: string): string => {
    if (reason.toLowerCase().includes('demand')) return '📈'
    if (reason.toLowerCase().includes('weather')) return '🌤️'
    if (reason.toLowerCase().includes('season')) return '📅'
    if (reason.toLowerCase().includes('price')) return '💰'
    if (reason.toLowerCase().includes('export')) return '🚢'
    return '💡'
  }

  const getRecommendationCategory = (reason: string): 'planting' | 'selling' | 'market' => {
    if (reason.toLowerCase().includes('plant') || reason.toLowerCase().includes('grow')) return 'planting'
    if (reason.toLowerCase().includes('sell') || reason.toLowerCase().includes('harvest')) return 'selling'
    return 'market'
  }

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => getRecommendationCategory(rec.reason) === selectedCategory)

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading personalized recommendations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={loadRecommendations}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
            <p className="text-gray-600">
              Personalized insights based on market trends and your farming history
            </p>
          </div>
          
          <button
            onClick={loadRecommendations}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', icon: '💡' },
            { key: 'planting', label: 'Planting', icon: '🌱' },
            { key: 'selling', label: 'Selling', icon: '💰' },
            { key: 'market', label: 'Market', icon: '📊' }
          ].map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🤔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No recommendations available
              </h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'Check back later for personalized farming insights'
                  : `No ${selectedCategory} recommendations at this time`
                }
              </p>
            </div>
          </div>
        ) : (
          filteredRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={index}
              recommendation={recommendation}
              category={getRecommendationCategory(recommendation.reason)}
            />
          ))
        )}
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">📊</span>
              <h5 className="font-medium text-blue-900">Trending Crops</h5>
            </div>
            <p className="text-sm text-blue-800">
              Tomatoes and peppers are showing strong upward price trends this month. 
              Consider increasing production for next season.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🌱</span>
              <h5 className="font-medium text-green-900">Seasonal Opportunity</h5>
            </div>
            <p className="text-sm text-green-800">
              Cool-season crops like lettuce and spinach are ideal for planting now. 
              Market demand typically increases in the coming months.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <h5 className="font-medium text-yellow-900">Price Alert</h5>
            </div>
            <p className="text-sm text-yellow-800">
              Corn prices have been volatile recently. Monitor daily changes 
              before making large selling decisions.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🚀</span>
              <h5 className="font-medium text-purple-900">Growth Opportunity</h5>
            </div>
            <p className="text-sm text-purple-800">
              Organic certification could increase your crop values by 20-30%. 
              Consider transitioning some plots to organic farming.
            </p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-green-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Review your current crop portfolio
              </p>
              <p className="text-sm text-gray-600">
                Analyze which crops are performing well and consider adjusting your planting strategy
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-green-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Monitor weather patterns
              </p>
              <p className="text-sm text-gray-600">
                Stay updated on weather forecasts to optimize planting and harvesting timing
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-green-600">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Diversify your crop selection
              </p>
              <p className="text-sm text-gray-600">
                Consider planting a mix of high-value and stable crops to balance risk and reward
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: Recommendation
  category: 'planting' | 'selling' | 'market'
}

function RecommendationCard({ recommendation, category }: RecommendationCardProps) {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'planting':
        return 'border-green-500 bg-green-50'
      case 'selling':
        return 'border-yellow-500 bg-yellow-50'
      case 'market':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'planting':
        return '🌱'
      case 'selling':
        return '💰'
      case 'market':
        return '📊'
      default:
        return '💡'
    }
  }

  const getRecommendationIcon = (reason: string): string => {
    if (reason.toLowerCase().includes('demand')) return '📈'
    if (reason.toLowerCase().includes('weather')) return '🌤️'
    if (reason.toLowerCase().includes('season')) return '📅'
    if (reason.toLowerCase().includes('price')) return '💰'
    if (reason.toLowerCase().includes('export')) return '🚢'
    return '💡'
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${getCategoryColor(category)} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-2xl">{getRecommendationIcon(recommendation.reason)}</div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-gray-900">
                {recommendation.cropName}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                category === 'planting' ? 'bg-green-100 text-green-800' :
                category === 'selling' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              {recommendation.reason}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Expected Price: <span className="font-semibold text-green-600">
                  {formatCurrency(recommendation.expectedPrice)}/kg
                </span>
              </div>
              
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}