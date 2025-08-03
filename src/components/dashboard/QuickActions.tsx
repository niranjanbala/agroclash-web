'use client'

import React from 'react'

interface QuickActionsProps {
  onAction: (action: string, data?: any) => void
  stats: {
    totalPlots: number
    totalCrops: number
    activeCrops: number
    readyToHarvest: number
  }
  className?: string
}

export function QuickActions({ onAction, stats, className = '' }: QuickActionsProps) {
  const actions = [
    {
      id: 'add_plot',
      title: 'Add Plot',
      description: 'Create a new farming plot',
      icon: '📍',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => onAction('add_plot')
    },
    {
      id: 'add_crop',
      title: 'Plant Crop',
      description: 'Add crops to your plots',
      icon: '🌱',
      color: 'bg-green-600 hover:bg-green-700',
      action: () => onAction('add_crop')
    },
    {
      id: 'harvest_ready',
      title: 'Harvest Crops',
      description: `${stats.readyToHarvest} crops ready`,
      icon: '🌾',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      action: () => onAction('harvest_ready'),
      badge: stats.readyToHarvest > 0 ? stats.readyToHarvest : undefined,
      disabled: stats.readyToHarvest === 0
    },
    {
      id: 'check_weather',
      title: 'Weather',
      description: 'View weather forecast',
      icon: '🌤️',
      color: 'bg-cyan-600 hover:bg-cyan-700',
      action: () => onAction('check_weather')
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Buy and sell crops',
      icon: '💰',
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => onAction('marketplace')
    },
    {
      id: 'pest_battle',
      title: 'Pest Battle',
      description: 'Defend your crops',
      icon: '⚔️',
      color: 'bg-red-600 hover:bg-red-700',
      action: () => onAction('pest_battle')
    }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600">Common farming tasks</p>
      </div>

      {/* Actions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-3">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={action.disabled}
              className={`relative w-full p-4 rounded-lg text-white text-left transition-colors ${
                action.disabled 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : action.color
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
                {action.badge && (
                  <div className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {action.badge}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Additional Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Farm Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Plots:</span>
              <span className="font-medium">{stats.totalPlots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Crops:</span>
              <span className="font-medium">{stats.totalCrops}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Crops:</span>
              <span className="font-medium text-green-600">{stats.activeCrops}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ready to Harvest:</span>
              <span className={`font-medium ${stats.readyToHarvest > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
                {stats.readyToHarvest}
              </span>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">💡 Farming Tips</h4>
          <div className="space-y-2">
            {stats.readyToHarvest > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  🌾 You have {stats.readyToHarvest} crop{stats.readyToHarvest !== 1 ? 's' : ''} ready for harvest!
                </p>
              </div>
            )}
            
            {stats.totalPlots === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  📍 Start by creating your first plot to begin farming.
                </p>
              </div>
            )}
            
            {stats.totalPlots > 0 && stats.totalCrops === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  🌱 Add some crops to your plots to start growing!
                </p>
              </div>
            )}
            
            {stats.activeCrops > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">
                  ⚔️ Don't forget to check for pests and defend your crops!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}