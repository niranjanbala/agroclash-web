'use client'

import React, { useState, useEffect } from 'react'
import { ServiceFactory } from '@/lib/services/factory'
import { WeatherData, Location } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface WeatherHistoryProps {
  location: Location
  className?: string
}

export function WeatherHistory({ location, className = '' }: WeatherHistoryProps) {
  const [historicalData, setHistoricalData] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(7)

  const weatherService = ServiceFactory.getWeatherService()

  useEffect(() => {
    loadHistoricalData()
  }, [location, selectedPeriod])

  const loadHistoricalData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await weatherService.getHistoricalData(location, selectedPeriod)
      setHistoricalData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load historical data')
      console.error('Error loading historical weather data:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateAverages = () => {
    if (historicalData.length === 0) return null

    const totalTemp = historicalData.reduce((sum, day) => sum + day.current.temperature, 0)
    const totalHumidity = historicalData.reduce((sum, day) => sum + day.current.humidity, 0)
    const totalWindSpeed = historicalData.reduce((sum, day) => sum + day.current.wind_speed, 0)

    return {
      avgTemperature: Math.round(totalTemp / historicalData.length),
      avgHumidity: Math.round(totalHumidity / historicalData.length),
      avgWindSpeed: Math.round(totalWindSpeed / historicalData.length),
      hottestDay: Math.max(...historicalData.map(d => d.current.temperature)),
      coldestDay: Math.min(...historicalData.map(d => d.current.temperature))
    }
  }

  const getTemperatureTrend = () => {
    if (historicalData.length < 3) return 'stable'
    
    const recent = historicalData.slice(-3).map(d => d.current.temperature)
    const earlier = historicalData.slice(0, 3).map(d => d.current.temperature)
    
    const recentAvg = recent.reduce((sum, temp) => sum + temp, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, temp) => sum + temp, 0) / earlier.length
    
    const difference = recentAvg - earlierAvg
    
    if (difference > 2) return 'warming'
    if (difference < -2) return 'cooling'
    return 'stable'
  }

  const averages = calculateAverages()
  const trend = getTemperatureTrend()

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather History</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading historical data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather History</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={loadHistoricalData}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Weather History</h3>
        
        {/* Period Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days as 7 | 14 | 30)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedPeriod === days
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {averages && (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {averages.avgTemperature}°C
              </div>
              <div className="text-sm text-gray-600">Avg Temp</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {averages.avgHumidity}%
              </div>
              <div className="text-sm text-gray-600">Avg Humidity</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {averages.avgWindSpeed} km/h
              </div>
              <div className="text-sm text-gray-600">Avg Wind</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {averages.hottestDay}°C
              </div>
              <div className="text-sm text-gray-600">Hottest</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {averages.coldestDay}°C
              </div>
              <div className="text-sm text-gray-600">Coldest</div>
            </div>
          </div>

          {/* Temperature Trend */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Temperature Trend:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                trend === 'warming' ? 'bg-red-100 text-red-800' :
                trend === 'cooling' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {trend === 'warming' ? '📈 Warming' :
                 trend === 'cooling' ? '📉 Cooling' :
                 '➡️ Stable'}
              </span>
            </div>
          </div>

          {/* Historical Data Chart (Simple) */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Temperature Chart</h4>
            <div className="relative h-32 bg-gray-50 rounded-lg p-4">
              <div className="flex items-end justify-between h-full">
                {historicalData.slice(-14).map((day, index) => {
                  const maxTemp = Math.max(...historicalData.map(d => d.current.temperature))
                  const minTemp = Math.min(...historicalData.map(d => d.current.temperature))
                  const height = ((day.current.temperature - minTemp) / (maxTemp - minTemp)) * 80 + 10
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center"
                      style={{ width: `${100 / Math.min(historicalData.length, 14)}%` }}
                    >
                      <div className="text-xs text-gray-600 mb-1">
                        {day.current.temperature}°
                      </div>
                      <div
                        className="bg-blue-500 rounded-t w-2"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Farming Insights */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-green-900 mb-2">
              📊 Farming Insights
            </h4>
            <div className="space-y-2 text-sm text-green-800">
              {averages.avgTemperature > 25 && (
                <div>• Recent temperatures have been high - consider heat-resistant crops</div>
              )}
              {averages.avgTemperature < 15 && (
                <div>• Cool weather period - good for cool-season crops like lettuce and peas</div>
              )}
              {averages.avgHumidity > 70 && (
                <div>• High humidity levels - monitor for fungal diseases</div>
              )}
              {averages.avgHumidity < 50 && (
                <div>• Low humidity - increase irrigation frequency</div>
              )}
              {trend === 'warming' && (
                <div>• Warming trend detected - adjust planting schedules accordingly</div>
              )}
              {trend === 'cooling' && (
                <div>• Cooling trend - protect sensitive plants from cold</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}