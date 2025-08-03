'use client'

import React from 'react'
import { Crop } from '@/lib/types'

interface CropStatsProps {
  crops: Crop[]
  className?: string
}

export function CropStats({ crops, className = '' }: CropStatsProps) {
  const totalCrops = crops.length
  const activeCrops = crops.filter(crop => crop.status !== 'harvested').length
  const readyForHarvest = crops.filter(crop => crop.status === 'ready').length
  const harvestedCrops = crops.filter(crop => crop.status === 'harvested').length

  const cropsByStatus = crops.reduce((acc, crop) => {
    acc[crop.status] = (acc[crop.status] || 0) + 1
    return acc
  }, {} as { [key: string]: number })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted':
        return 'text-blue-600'
      case 'growing':
        return 'text-green-600'
      case 'flowering':
        return 'text-purple-600'
      case 'ready':
        return 'text-yellow-600'
      case 'harvested':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
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

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total Crops */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Crops</p>
            <p className="text-2xl font-semibold text-gray-900">{totalCrops}</p>
          </div>
        </div>
      </div>

      {/* Active Crops */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Active Crops</p>
            <p className="text-2xl font-semibold text-gray-900">{activeCrops}</p>
          </div>
        </div>
      </div>

      {/* Ready for Harvest */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Ready to Harvest</p>
            <p className="text-2xl font-semibold text-gray-900">{readyForHarvest}</p>
          </div>
        </div>
        {readyForHarvest > 0 && (
          <div className="mt-2">
            <div className="flex items-center text-xs text-yellow-700">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Action needed!
            </div>
          </div>
        )}
      </div>

      {/* Harvested Crops */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Harvested</p>
            <p className="text-2xl font-semibold text-gray-900">{harvestedCrops}</p>
          </div>
        </div>
      </div>

      {/* Detailed Status Breakdown */}
      {totalCrops > 0 && (
        <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Status Breakdown</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(cropsByStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl mb-1">{getStatusIcon(status)}</div>
                <div className={`text-lg font-semibold ${getStatusColor(status)}`}>
                  {count}
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Crop Progress</span>
              <span>{harvestedCrops} of {totalCrops} harvested</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${totalCrops > 0 ? (harvestedCrops / totalCrops) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}