'use client'

import React, { useState, useEffect } from 'react'
import { ServiceFactory } from '@/lib/services/factory'
import { MarketPrice } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'

interface MarketTrendsProps {
  className?: string
}

export function MarketTrends({ className = '' }: MarketTrendsProps) {
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes')
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(14)
  const [trendData, setTrendData] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const marketService = ServiceFactory.getMarketService()

  const popularCrops = [
    'Tomatoes', 'Corn', 'Wheat', 'Rice', 'Potatoes', 
    'Lettuce', 'Peppers', 'Carrots', 'Onions'
  ]

  useEffect(() => {
    loadTrendData()
  }, [selectedCrop, selectedPeriod])

  const loadTrendData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const trends = await marketService.getMarketTrends(selectedCrop, selectedPeriod)
      setTrendData(trends)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trend data')
      console.error('Error loading trend data:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateTrendStats = () => {
    if (trendData.length < 2) return null

    const prices = trendData.map(d => d.price_per_kg)
    const currentPrice = prices[prices.length - 1]
    const previousPrice = prices[prices.length - 2]
    const oldestPrice = prices[0]
    
    const dailyChange = currentPrice - previousPrice
    const dailyChangePercent = (dailyChange / previousPrice) * 100
    
    const periodChange = currentPrice - oldestPrice
    const periodChangePercent = (periodChange / oldestPrice) * 100
    
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    
    return {
      currentPrice,
      dailyChange,
      dailyChangePercent,
      periodChange,
      periodChangePercent,
      avgPrice,
      maxPrice,
      minPrice,
      volatility: ((maxPrice - minPrice) / avgPrice) * 100
    }
  }

  const getTrendDirection = (changePercent: number) => {
    if (changePercent > 5) return { icon: '📈', color: 'text-green-600', label: 'Strong Up' }
    if (changePercent > 0) return { icon: '↗️', color: 'text-green-500', label: 'Up' }
    if (changePercent < -5) return { icon: '📉', color: 'text-red-600', label: 'Strong Down' }
    if (changePercent < 0) return { icon: '↘️', color: 'text-red-500', label: 'Down' }
    return { icon: '➡️', color: 'text-gray-500', label: 'Stable' }
  }

  const stats = calculateTrendStats()
  const trendDirection = stats ? getTrendDirection(stats.periodChangePercent) : null

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="crop-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Crop:
              </label>
              <select
                id="crop-select"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {popularCrops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 mb-1">
                Time Period:
              </label>
              <select
                id="period-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value) as 7 | 14 | 30)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
          </div>

          <button
            onClick={loadTrendData}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Trend Statistics */}
      {stats && trendDirection && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedCrop} Price Analysis
            </h3>
            <div className={`flex items-center space-x-2 ${trendDirection.color}`}>
              <span className="text-2xl">{trendDirection.icon}</span>
              <span className="font-medium">{trendDirection.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.currentPrice)}
              </div>
              <div className="text-sm text-gray-600">Current Price</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                stats.periodChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.periodChangePercent >= 0 ? '+' : ''}{stats.periodChangePercent.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">{selectedPeriod}-Day Change</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.avgPrice)}
              </div>
              <div className="text-sm text-gray-600">Average Price</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.volatility.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Volatility</div>
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Price Range</h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Low: {formatCurrency(stats.minPrice)}</span>
                  <span>High: {formatCurrency(stats.maxPrice)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full"
                    style={{ width: '100%' }}
                  />
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full -mt-2.5 border-2 border-white"
                    style={{ 
                      marginLeft: `${((stats.currentPrice - stats.minPrice) / (stats.maxPrice - stats.minPrice)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price History</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading price data...</p>
          </div>
        ) : trendData.length > 0 ? (
          <div className="space-y-4">
            {/* Simple Chart */}
            <div className="relative h-64 bg-gray-50 rounded-lg p-4">
              <div className="flex items-end justify-between h-full">
                {trendData.map((dataPoint, index) => {
                  const maxPrice = Math.max(...trendData.map(d => d.price_per_kg))
                  const minPrice = Math.min(...trendData.map(d => d.price_per_kg))
                  const height = ((dataPoint.price_per_kg - minPrice) / (maxPrice - minPrice)) * 80 + 10
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center group"
                      style={{ width: `${100 / trendData.length}%` }}
                    >
                      <div className="text-xs text-gray-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(dataPoint.price_per_kg)}
                      </div>
                      <div
                        className="bg-green-500 rounded-t w-3 hover:bg-green-600 transition-colors cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`${formatDate(dataPoint.date)}: ${formatCurrency(dataPoint.price_per_kg)}`}
                      />
                      <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                        {formatDate(dataPoint.date)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trendData.slice(-10).reverse().map((dataPoint, index) => {
                    const prevPrice = index < trendData.length - 1 ? 
                      trendData[trendData.length - 2 - index].price_per_kg : 
                      dataPoint.price_per_kg
                    const change = dataPoint.price_per_kg - prevPrice
                    const changePercent = prevPrice !== 0 ? (change / prevPrice) * 100 : 0

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(dataPoint.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(dataPoint.price_per_kg)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {index === trendData.length - 1 ? (
                            <span className="text-gray-500">-</span>
                          ) : (
                            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent.toFixed(1)}%)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dataPoint.market_location}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trend data available</h3>
            <p className="text-gray-600">
              Price history will appear here when data is available
            </p>
          </div>
        )}
      </div>

      {/* Market Insights */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
          
          <div className="space-y-3">
            {stats.periodChangePercent > 10 && (
              <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                <span className="text-green-600">📈</span>
                <div>
                  <p className="text-sm font-medium text-green-800">Strong Upward Trend</p>
                  <p className="text-sm text-green-700">
                    {selectedCrop} prices have increased significantly by {stats.periodChangePercent.toFixed(1)}% 
                    over the past {selectedPeriod} days. Consider selling if you have inventory.
                  </p>
                </div>
              </div>
            )}
            
            {stats.periodChangePercent < -10 && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                <span className="text-red-600">📉</span>
                <div>
                  <p className="text-sm font-medium text-red-800">Strong Downward Trend</p>
                  <p className="text-sm text-red-700">
                    {selectedCrop} prices have decreased by {Math.abs(stats.periodChangePercent).toFixed(1)}% 
                    over the past {selectedPeriod} days. Consider waiting before selling or buying for future planting.
                  </p>
                </div>
              </div>
            )}
            
            {stats.volatility > 20 && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-600">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-yellow-800">High Volatility</p>
                  <p className="text-sm text-yellow-700">
                    {selectedCrop} prices are highly volatile ({stats.volatility.toFixed(1)}% range). 
                    Consider timing your sales carefully and monitor daily price changes.
                  </p>
                </div>
              </div>
            )}
            
            {Math.abs(stats.periodChangePercent) <= 5 && stats.volatility <= 15 && (
              <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600">📊</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">Stable Market</p>
                  <p className="text-sm text-blue-700">
                    {selectedCrop} prices are relatively stable with low volatility. 
                    Good time for consistent planning and regular sales.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}