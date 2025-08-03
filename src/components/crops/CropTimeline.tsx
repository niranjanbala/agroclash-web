'use client'

import React, { useState, useEffect } from 'react'
import { Crop } from '@/lib/types'
import { SupabaseCropService } from '@/lib/services/crop.service'
import { formatDate } from '@/lib/utils'

interface CropTimelineProps {
  crop: Crop
  className?: string
}

export function CropTimeline({ crop, className = '' }: CropTimelineProps) {
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  const cropService = new SupabaseCropService()

  useEffect(() => {
    loadTimeline()
    calculateProgress()
  }, [crop])

  const loadTimeline = async () => {
    try {
      setLoading(true)
      const timelineData = await cropService.getCropTimeline(crop.id)
      setTimeline(timelineData)
    } catch (error) {
      console.error('Error loading timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = () => {
    const progressPercentage = cropService.calculateCropProgress(crop)
    setProgress(progressPercentage)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'current':
        return 'bg-blue-500'
      case 'ready':
        return 'bg-yellow-500'
      case 'overdue':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700'
      case 'current':
        return 'text-blue-700'
      case 'ready':
        return 'text-yellow-700'
      case 'overdue':
        return 'text-red-700'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading timeline...</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Bar */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">Growth Progress</h4>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {crop.status === 'harvested' ? 'Completed' : 
           progress >= 100 ? 'Ready for harvest' :
           `${Math.round((100 - progress))}% remaining`}
        </div>
      </div>

      {/* Crop Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="font-medium text-gray-700">Status</label>
          <p className={`capitalize ${getStatusTextColor(crop.status)}`}>
            {crop.status.replace('_', ' ')}
          </p>
        </div>
        <div>
          <label className="font-medium text-gray-700">Growth Stage</label>
          <p className="text-gray-900 capitalize">
            {crop.growth_stage.replace('_', ' ')}
          </p>
        </div>
        <div>
          <label className="font-medium text-gray-700">Planted</label>
          <p className="text-gray-900">{formatDate(crop.sown_date, 'long')}</p>
        </div>
        {crop.expected_harvest_date && (
          <div>
            <label className="font-medium text-gray-700">Expected Harvest</label>
            <p className="text-gray-900">{formatDate(crop.expected_harvest_date, 'long')}</p>
          </div>
        )}
        {crop.quantity_planted && (
          <div>
            <label className="font-medium text-gray-700">Quantity Planted</label>
            <p className="text-gray-900">{crop.quantity_planted} units</p>
          </div>
        )}
        {crop.quantity_harvested && (
          <div>
            <label className="font-medium text-gray-700">Quantity Harvested</label>
            <p className="text-gray-900">{crop.quantity_harvested} units</p>
          </div>
        )}
      </div>

      {/* Recommended Actions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended Actions</h4>
        <div className="space-y-1">
          {cropService.getRecommendedActions(crop).map((action, index) => (
            <div key={index} className="flex items-center text-sm text-blue-800">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {action}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Growth Timeline</h4>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {timeline.map((event, index) => (
            <div key={event.id} className="relative flex items-start space-x-4 pb-4">
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 border-white ${getStatusColor(event.status)}`}>
                <span className="text-lg">{event.icon}</span>
              </div>
              
              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className={`text-sm font-medium ${getStatusTextColor(event.status)}`}>
                    {event.title}
                  </h5>
                  <span className="text-xs text-gray-500">
                    {formatDate(event.date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {event.description}
                </p>
                
                {/* Status badge */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    event.status === 'completed' ? 'bg-green-100 text-green-800' :
                    event.status === 'current' ? 'bg-blue-100 text-blue-800' :
                    event.status === 'ready' ? 'bg-yellow-100 text-yellow-800' :
                    event.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status === 'completed' ? '✓ Completed' :
                     event.status === 'current' ? '🔄 Current' :
                     event.status === 'ready' ? '⚡ Ready' :
                     event.status === 'overdue' ? '⚠️ Overdue' :
                     '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {crop.notes && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap">
            {crop.notes}
          </div>
        </div>
      )}
    </div>
  )
}