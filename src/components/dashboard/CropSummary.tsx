'use client'

import React, { useState } from 'react'
import { Crop } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface CropSummaryProps {
  crops: Crop[]
  onCropAction: (action: string, data?: any) => void
  loading?: boolean
  className?: string
}

export function CropSummary({ crops, onCropAction, loading = false, className = '' }: CropSummaryProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'ready' | 'harvested'>('all')

  const getStatusIcon = (status: Crop['status']) => {
    switch (status) {
      case 'planted': return '🌱'
      case 'growing': return '🌿'
      case 'flowering': return '🌸'
      case 'ready': return '🌾'
      case 'harvested': return '✅'
      default: return '🌱'
    }
  }

  const getStatusColor = (status: Crop['status']) => {
    switch (status) {
      case 'planted': return 'bg-green-100 text-green-800'
      case 'growing': return 'bg-blue-100 text-blue-800'
      case 'flowering': return 'bg-purple-100 text-purple-800'
      case 'ready': return 'bg-yellow-100 text-yellow-800'
      case 'harvested': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGrowthStageProgress = (stage: Crop['growth_stage']) => {
    const stages = ['seedling', 'vegetative', 'flowering', 'fruiting', 'mature']
    const currentIndex = stages.indexOf(stage)
    return ((currentIndex + 1) / stages.length) * 100
  }

  const getDaysToHarvest = (crop: Crop) => {
    if (!crop.expected_harvest_date) return null
    
    const harvestDate = new Date(crop.expected_harvest_date)
    const today = new Date()
    const diffTime = harvestDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const getFilteredCrops = () => {
    switch (filter) {
      case 'active':
        return crops.filter(crop => 
          crop.status === 'planted' || crop.status === 'growing' || crop.status === 'flowering'
        )
      case 'ready':
        return crops.filter(crop => crop.status === 'ready')
      case 'harvested':
        return crops.filter(crop => crop.status === 'harvested')
      default:
        return crops
    }
  }

  const filteredCrops = getFilteredCrops()

  const handleHarvestCrop = (crop: Crop) => {
    onCropAction('harvest_crop', { cropId: crop.id, cropName: crop.name })
  }

  const handleUpdateCrop = (crop: Crop) => {
    onCropAction('update_crop', { cropId: crop.id })
  }

  const handleAddCrop = () => {
    onCropAction('add_crop')
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Crop Summary</h2>
            <p className="text-sm text-gray-600">
              {crops.length} crop{crops.length !== 1 ? 's' : ''} across all plots
            </p>
          </div>
          <button
            onClick={handleAddCrop}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Crop</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All', count: crops.length },
            { key: 'active', label: 'Active', count: crops.filter(c => ['planted', 'growing', 'flowering'].includes(c.status)).length },
            { key: 'ready', label: 'Ready', count: crops.filter(c => c.status === 'ready').length },
            { key: 'harvested', label: 'Harvested', count: crops.filter(c => c.status === 'harvested').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading crops...</span>
          </div>
        ) : filteredCrops.length > 0 ? (
          <div className="space-y-4">
            {filteredCrops.map(crop => {
              const daysToHarvest = getDaysToHarvest(crop)
              const progress = getGrowthStageProgress(crop.growth_stage)
              
              return (
                <div
                  key={crop.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStatusIcon(crop.status)}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {crop.name}
                          {crop.variety && (
                            <span className="text-sm text-gray-600 ml-2">({crop.variety})</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Planted {formatDate(crop.sown_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
                        {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                      </span>
                      
                      {crop.status === 'ready' && (
                        <button
                          onClick={() => handleHarvestCrop(crop)}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                        >
                          Harvest
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleUpdateCrop(crop)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Growth Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Growth Stage: {crop.growth_stage}</span>
                      <span>{Math.round(progress)}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {daysToHarvest !== null && (
                      <div>
                        <span className="text-gray-600">Days to harvest:</span>
                        <span className={`ml-1 font-medium ${
                          daysToHarvest <= 0 ? 'text-yellow-600' :
                          daysToHarvest <= 7 ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                          {daysToHarvest <= 0 ? 'Ready!' : `${daysToHarvest} days`}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-1 font-medium">{crop.status}</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Stage:</span>
                      <span className="ml-1 font-medium">{crop.growth_stage}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No crops yet' : `No ${filter} crops`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start by adding crops to your plots'
                : `You don't have any ${filter} crops at the moment`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={handleAddCrop}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add First Crop</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}