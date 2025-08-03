'use client'

import React, { useState } from 'react'
import { WeatherAlert } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface WeatherAlertsProps {
  alerts: WeatherAlert[]
  className?: string
}

export function WeatherAlerts({ alerts, className = '' }: WeatherAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const getAlertColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  const getAlertIcon = (type: WeatherAlert['type'], severity: WeatherAlert['severity']) => {
    const icons = {
      rain: severity === 'high' ? '🌧️' : '🌦️',
      drought: '☀️',
      frost: '❄️',
      storm: severity === 'high' ? '⛈️' : '🌩️',
      heat: '🔥'
    }
    return icons[type] || '⚠️'
  }

  const getAlertTextColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-800'
      case 'medium':
        return 'text-yellow-800'
      case 'low':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  const getActionRecommendations = (alert: WeatherAlert): string[] => {
    const recommendations: string[] = []

    switch (alert.type) {
      case 'rain':
        if (alert.severity === 'high') {
          recommendations.push('Ensure proper field drainage')
          recommendations.push('Postpone harvesting activities')
          recommendations.push('Secure equipment and materials')
        } else {
          recommendations.push('Plan indoor activities')
          recommendations.push('Check irrigation systems')
        }
        break
      
      case 'drought':
        recommendations.push('Increase irrigation frequency')
        recommendations.push('Apply mulch to retain moisture')
        recommendations.push('Monitor crop stress levels')
        break
      
      case 'frost':
        recommendations.push('Cover sensitive plants')
        recommendations.push('Use frost protection methods')
        recommendations.push('Delay planting tender crops')
        break
      
      case 'storm':
        recommendations.push('Secure loose equipment')
        recommendations.push('Harvest ready crops if possible')
        recommendations.push('Check structural integrity of greenhouses')
        break
      
      case 'heat':
        recommendations.push('Increase watering frequency')
        recommendations.push('Provide shade for sensitive crops')
        recommendations.push('Avoid midday field work')
        break
    }

    return recommendations
  }

  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id))

  if (activeAlerts.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Weather Alerts</h3>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {activeAlerts.length} Active Alert{activeAlerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {activeAlerts.map(alert => {
          const recommendations = getActionRecommendations(alert)
          
          return (
            <WeatherAlertCard
              key={alert.id}
              alert={alert}
              recommendations={recommendations}
              onDismiss={() => handleDismissAlert(alert.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface WeatherAlertCardProps {
  alert: WeatherAlert
  recommendations: string[]
  onDismiss: () => void
}

function WeatherAlertCard({ alert, recommendations, onDismiss }: WeatherAlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const alertColor = getAlertColor(alert.severity)
  const alertIcon = getAlertIcon(alert.type, alert.severity)
  const textColor = getAlertTextColor(alert.severity)

  const isActive = new Date(alert.start_time) <= new Date() && 
                   (!alert.end_time || new Date(alert.end_time) > new Date())

  return (
    <div className={`border-2 rounded-lg p-4 ${alertColor} transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Alert Icon */}
          <div className="text-2xl">{alertIcon}</div>
          
          {/* Alert Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`font-semibold ${textColor}`}>
                {alert.title}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {alert.severity.toUpperCase()}
              </span>
              {isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ACTIVE
                </span>
              )}
            </div>
            
            <p className={`text-sm ${textColor} mb-2`}>
              {alert.description}
            </p>
            
            {/* Time Information */}
            <div className="text-xs text-gray-600 mb-2">
              <span>Starts: {formatDate(alert.start_time, 'long')} at {new Date(alert.start_time).toLocaleTimeString()}</span>
              {alert.end_time && (
                <span className="ml-4">
                  Ends: {formatDate(alert.end_time, 'long')} at {new Date(alert.end_time).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {isExpanded ? 'Hide Details' : 'View Recommendations'}
              </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Recommended Actions:
                </h5>
                <ul className="space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>

                {/* Impact Assessment */}
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                  <h6 className="text-sm font-medium text-gray-900 mb-1">
                    Potential Farm Impact:
                  </h6>
                  <div className="text-sm text-gray-700">
                    {alert.type === 'rain' && alert.severity === 'high' && (
                      <span>High risk of flooding and crop damage. Harvest delays likely.</span>
                    )}
                    {alert.type === 'drought' && (
                      <span>Increased irrigation costs. Monitor crop stress levels closely.</span>
                    )}
                    {alert.type === 'frost' && (
                      <span>Risk of crop damage, especially for tender plants and seedlings.</span>
                    )}
                    {alert.type === 'storm' && (
                      <span>Potential structural damage and crop loss from high winds.</span>
                    )}
                    {alert.type === 'heat' && (
                      <span>Heat stress on crops. Increased water requirements.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 ml-2"
          title="Dismiss alert"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Helper functions (moved outside component to avoid re-creation)
function getAlertColor(severity: WeatherAlert['severity']) {
  switch (severity) {
    case 'high':
      return 'border-red-500 bg-red-50'
    case 'medium':
      return 'border-yellow-500 bg-yellow-50'
    case 'low':
      return 'border-blue-500 bg-blue-50'
    default:
      return 'border-gray-500 bg-gray-50'
  }
}

function getAlertIcon(type: WeatherAlert['type'], severity: WeatherAlert['severity']) {
  const icons = {
    rain: severity === 'high' ? '🌧️' : '🌦️',
    drought: '☀️',
    frost: '❄️',
    storm: severity === 'high' ? '⛈️' : '🌩️',
    heat: '🔥'
  }
  return icons[type] || '⚠️'
}

function getAlertTextColor(severity: WeatherAlert['severity']) {
  switch (severity) {
    case 'high':
      return 'text-red-800'
    case 'medium':
      return 'text-yellow-800'
    case 'low':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
  }
}