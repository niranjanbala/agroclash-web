'use client'

import React from 'react'
import { WeatherForecast as WeatherForecastType } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface WeatherForecastProps {
  forecast: WeatherForecastType[]
  className?: string
}

export function WeatherForecast({ forecast, className = '' }: WeatherForecastProps) {
  const getTemperatureColor = (temp: number): string => {
    if (temp >= 30) return 'text-red-600'
    if (temp >= 25) return 'text-orange-600'
    if (temp >= 20) return 'text-yellow-600'
    if (temp >= 15) return 'text-green-600'
    if (temp >= 10) return 'text-blue-600'
    return 'text-purple-600'
  }

  const getPrecipitationColor = (chance: number): string => {
    if (chance >= 80) return 'text-blue-800'
    if (chance >= 60) return 'text-blue-600'
    if (chance >= 40) return 'text-blue-400'
    if (chance >= 20) return 'text-blue-300'
    return 'text-gray-400'
  }

  const getFarmingAdvice = (day: WeatherForecastType): string[] => {
    const advice: string[] = []
    
    if (day.precipitation_chance > 70) {
      advice.push('High chance of rain - avoid outdoor work')
      advice.push('Ensure proper drainage in fields')
    } else if (day.precipitation_chance > 40) {
      advice.push('Possible rain - plan indoor activities')
    } else if (day.precipitation_chance < 20 && day.temperature_max > 25) {
      advice.push('Hot and dry - increase irrigation')
    }
    
    if (day.temperature_max > 30) {
      advice.push('Very hot - protect crops from heat stress')
    } else if (day.temperature_min < 5) {
      advice.push('Cold weather - protect sensitive plants')
    }
    
    if (day.humidity > 80) {
      advice.push('High humidity - watch for fungal diseases')
    } else if (day.humidity < 40) {
      advice.push('Low humidity - increase watering frequency')
    }
    
    return advice
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Forecast</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {forecast.map((day, index) => {
          const isToday = index === 0
          const advice = getFarmingAdvice(day)
          
          return (
            <div
              key={day.date}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                isToday 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Date */}
              <div className="text-center mb-3">
                <div className={`text-sm font-medium ${
                  isToday ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {isToday ? 'Today' : formatDate(day.date)}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </div>

              {/* Weather Icon */}
              <div className="text-center mb-3">
                <div className="text-3xl mb-1">{day.icon}</div>
                <div className="text-xs text-gray-600 leading-tight">
                  {day.description}
                </div>
              </div>

              {/* Temperature */}
              <div className="text-center mb-3">
                <div className={`text-lg font-bold ${getTemperatureColor(day.temperature_max)}`}>
                  {day.temperature_max}°
                </div>
                <div className="text-sm text-gray-600">
                  {day.temperature_min}°
                </div>
              </div>

              {/* Weather Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">💧 Rain</span>
                  <span className={getPrecipitationColor(day.precipitation_chance)}>
                    {day.precipitation_chance}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">💨 Humidity</span>
                  <span className="text-gray-700">{day.humidity}%</span>
                </div>
              </div>

              {/* Farming Advice */}
              {advice.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-1 font-medium">
                    Farm Tips:
                  </div>
                  <div className="space-y-1">
                    {advice.slice(0, 2).map((tip, tipIndex) => (
                      <div key={tipIndex} className="text-xs text-gray-600 leading-tight">
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Activities */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-1 font-medium">
                  Recommended:
                </div>
                <div className="flex flex-wrap gap-1">
                  {day.precipitation_chance < 30 && (
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      🌱 Planting
                    </span>
                  )}
                  {day.temperature_max < 25 && day.precipitation_chance < 50 && (
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      🚜 Field Work
                    </span>
                  )}
                  {day.precipitation_chance > 60 && (
                    <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                      🏠 Indoor Tasks
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-3">Weekly Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Average Temperature</div>
            <div className="text-xl font-bold text-gray-900">
              {Math.round(forecast.reduce((sum, day) => sum + (day.temperature_max + day.temperature_min) / 2, 0) / forecast.length)}°C
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Rain Days</div>
            <div className="text-xl font-bold text-blue-600">
              {forecast.filter(day => day.precipitation_chance > 50).length} days
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Best Farm Days</div>
            <div className="text-xl font-bold text-green-600">
              {forecast.filter(day => 
                day.precipitation_chance < 30 && 
                day.temperature_max < 30 && 
                day.temperature_max > 15
              ).length} days
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}