'use client'

import React from 'react'
import { WeatherData } from '@/lib/types'

interface WeatherWidgetProps {
  weather: WeatherData
  loading?: boolean
  className?: string
}

export function WeatherWidget({ weather, loading = false, className = '' }: WeatherWidgetProps) {
  const getWeatherIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      'clear-day': '☀️',
      'clear-night': '🌙',
      'rain': '🌧️',
      'snow': '❄️',
      'sleet': '🌨️',
      'wind': '💨',
      'fog': '🌫️',
      'cloudy': '☁️',
      'partly-cloudy-day': '⛅',
      'partly-cloudy-night': '🌙',
      'thunderstorm': '⛈️'
    }
    return iconMap[icon] || '🌤️'
  }

  const getAlertIcon = (type: string) => {
    const alertIcons: { [key: string]: string } = {
      'rain': '🌧️',
      'drought': '☀️',
      'frost': '❄️',
      'storm': '⛈️',
      'heat': '🔥'
    }
    return alertIcons[type] || '⚠️'
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Weather</h3>
      </div>

      {/* Current Weather */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{getWeatherIcon(weather.current.icon)}</span>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(weather.current.temperature)}°C
              </p>
              <p className="text-sm text-gray-600">{weather.current.description}</p>
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-600">
            <div className="space-y-1">
              <div>💧 {weather.current.humidity}%</div>
              <div>💨 {weather.current.wind_speed} km/h</div>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">3-Day Forecast</h4>
          <div className="grid grid-cols-3 gap-3">
            {weather.forecast.slice(0, 3).map((day, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">
                  {index === 0 ? 'Today' : 
                   index === 1 ? 'Tomorrow' : 
                   new Date(day.date).toLocaleDateString('en', { weekday: 'short' })
                  }
                </p>
                <div className="text-2xl mb-1">{getWeatherIcon(day.icon)}</div>
                <div className="text-xs">
                  <span className="font-medium">{Math.round(day.temperature_max)}°</span>
                  <span className="text-gray-500 ml-1">{Math.round(day.temperature_min)}°</span>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {day.precipitation_chance}% 🌧️
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Alerts */}
        {weather.alerts && weather.alerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Weather Alerts</h4>
            <div className="space-y-2">
              {weather.alerts.slice(0, 2).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{getAlertIcon(alert.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.start_time).toLocaleDateString()} - {new Date(alert.end_time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No alerts message */}
        {(!weather.alerts || weather.alerts.length === 0) && (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm text-gray-600">No weather alerts</p>
          </div>
        )}
      </div>
    </div>
  )
}