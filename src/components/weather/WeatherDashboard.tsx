'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { WeatherForecast } from './WeatherForecast'
import { WeatherAlerts } from './WeatherAlerts'
import { WeatherHistory } from './WeatherHistory'
import { ServiceFactory } from '@/lib/services/factory'
import { WeatherData, WeatherAlert } from '@/lib/types'

interface WeatherDashboardProps {
  className?: string
}

export function WeatherDashboard({ className = '' }: WeatherDashboardProps) {
  const { user } = useAuth()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const weatherService = ServiceFactory.getWeatherService()

  useEffect(() => {
    if (user?.location) {
      loadWeatherData()
      
      // Set up periodic updates every 30 minutes
      const interval = setInterval(loadWeatherData, 30 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [user?.location])

  const loadWeatherData = async () => {
    if (!user?.location) return

    try {
      setLoading(true)
      setError(null)

      const [forecast, alertsData] = await Promise.all([
        weatherService.getForecast(user.location),
        weatherService.getAlerts(user.location)
      ])

      setWeatherData(forecast)
      setAlerts(alertsData)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
      console.error('Error loading weather data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadWeatherData()
  }

  if (!user?.location) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Location Required</h3>
        <p className="text-gray-600 mb-4">
          Please add your location to your profile to view weather information
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Add Location
        </button>
      </div>
    )
  }

  if (loading && !weatherData) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading weather data...</p>
      </div>
    )
  }

  if (error && !weatherData) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Weather Unavailable</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weather Center</h2>
          <p className="text-gray-600">
            Stay informed about weather conditions for your farm
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              '🔄 Refresh'
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && weatherData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Weather data may be outdated. {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {weatherData && (
        <>
          {/* Current Weather */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Conditions</h3>
              <div className="text-4xl">{weatherData.current.icon}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {weatherData.current.temperature}°C
                </div>
                <div className="text-sm text-gray-600">Temperature</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {weatherData.current.humidity}%
                </div>
                <div className="text-sm text-gray-600">Humidity</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {weatherData.current.wind_speed} km/h
                </div>
                <div className="text-sm text-gray-600">Wind Speed</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">
                  {weatherData.current.description}
                </div>
                <div className="text-sm text-gray-600">Conditions</div>
              </div>
            </div>
          </div>

          {/* Weather Alerts */}
          {alerts.length > 0 && (
            <WeatherAlerts alerts={alerts} />
          )}

          {/* 7-Day Forecast */}
          <WeatherForecast forecast={weatherData.forecast} />

          {/* Weather History */}
          <WeatherHistory location={user.location} />
        </>
      )}
    </div>
  )
}