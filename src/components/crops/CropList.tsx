'use client'

import React from 'react'
import { Crop } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface CropListProps {
  crops: Crop[]
  selectedCropId?: string
  onCropSelect: (crop: Crop) => void
  onCropHarvest: (cropId: string) => void
}

export function CropList({ 
  crops, 
  selectedCropId, 
  onCropSelect, 
  onCropHarvest 
}: CropListProps) {
  if (crops.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No crops found</h3>
        <p className="text-gray-600">
          Start by adding crops to your plots to track their growth
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {crops.map((crop) => (
        <CropListItem
          key={crop.id}
          crop={crop}
          isSelected={crop.id === selectedCropId}
          onSelect={() => onCropSelect(crop)}
          onHarvest={() => onCropHarvest(crop.id)}
        />
      ))}
    </div>
  )
}

interface CropListItemProps {
  crop: Crop
  isSelected: boolean
  onSelect: () => void
  onHarvest: () => void
}

function CropListItem({ crop, isSelected, onSelect, onHarvest }: CropListItemProps) {
  const getStatusColor = (status: Crop['status']) => {
    switch (status) {
      case 'planted':
        return 'bg-blue-100 text-blue-800'
      case 'growing':
        return 'bg-green-100 text-green-800'
      case 'flowering':
        return 'bg-purple-100 text-purple-800'
      case 'ready':
        return 'bg-yellow-100 text-yellow-800'
      case 'harvested':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Crop['status']) => {
    switch (status) {
      case 'planted':
        return '🌱'
      case 'growing':
        return '🌿'
      case 'flowering':
        return '🌸'
      case 'ready':
        return '🌾'
      case 'harvested':
        return '✅'
      default:
        return '🌱'
    }
  }

  const calculateDaysFromPlanting = () => {
    const sownDate = new Date(crop.sown_date)
    const today = new Date()
    return Math.floor((today.getTime() - sownDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getDaysUntilHarvest = () => {
    if (!crop.expected_harvest_date) return null
    const harvestDate = new Date(crop.expected_harvest_date)
    const today = new Date()
    const days = Math.floor((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const daysFromPlanting = calculateDaysFromPlanting()
  const daysUntilHarvest = getDaysUntilHarvest()

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-green-500 bg-green-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          {/* Crop Name and Status */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getStatusIcon(crop.status)}</span>
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {crop.name}
              {crop.variety && (
                <span className="text-gray-600 font-normal"> ({crop.variety})</span>
              )}
            </h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}
            >
              {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
            </span>
          </div>

          {/* Crop Details */}
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Planted {formatDate(crop.sown_date)} ({daysFromPlanting} days ago)</span>
            </div>

            {crop.expected_harvest_date && (
              <div className="flex items-center text-xs text-gray-600">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {daysUntilHarvest !== null ? (
                    daysUntilHarvest > 0 ? (
                      `Harvest in ${daysUntilHarvest} days`
                    ) : daysUntilHarvest === 0 ? (
                      'Harvest today!'
                    ) : (
                      `${Math.abs(daysUntilHarvest)} days overdue`
                    )
                  ) : (
                    'No harvest date set'
                  )}
                </span>
              </div>
            )}

            {crop.quantity_planted && (
              <div className="flex items-center text-xs text-gray-600">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <span>
                  {crop.quantity_planted} planted
                  {crop.quantity_harvested && crop.quantity_harvested > 0 && (
                    <span className="text-green-600 ml-1">
                      ({crop.quantity_harvested} harvested)
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Growth Stage */}
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="capitalize">
                {crop.growth_stage.replace('_', ' ')} stage
              </span>
            </div>
          </div>

          {/* Harvest Date Alert */}
          {crop.status === 'ready' && (
            <div className="mt-2 flex items-center text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Ready for harvest!
            </div>
          )}

          {daysUntilHarvest !== null && daysUntilHarvest < 0 && crop.status !== 'harvested' && (
            <div className="mt-2 flex items-center text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Overdue for harvest
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 ml-2">
          {crop.status === 'ready' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onHarvest()
              }}
              className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
              title="Harvest crop"
            >
              🚜 Harvest
            </button>
          )}
        </div>
      </div>
    </div>
  )
}