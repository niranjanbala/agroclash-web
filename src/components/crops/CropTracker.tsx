'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { CropTimeline } from './CropTimeline'
import { CropForm } from './CropForm'
import { CropList } from './CropList'
import { CropStats } from './CropStats'
import { SupabaseCropService } from '@/lib/services/crop.service'
import { SupabasePlotService } from '@/lib/services/plot.service'
import { Crop, Plot } from '@/lib/types'

interface CropTrackerProps {
  className?: string
}

export function CropTracker({ className = '' }: CropTrackerProps) {
  const { user } = useAuth()
  const [crops, setCrops] = useState<Crop[]>([])
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'ready' | 'harvested'>('all')

  const cropService = new SupabaseCropService()
  const plotService = new SupabasePlotService()

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      // Load plots and crops
      const [userPlots, userCrops] = await Promise.all([
        plotService.getPlots(user.id),
        getAllUserCrops(user.id)
      ])
      
      setPlots(userPlots)
      setCrops(userCrops)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAllUserCrops = async (userId: string): Promise<Crop[]> => {
    const userPlots = await plotService.getPlots(userId)
    const allCrops: Crop[] = []
    
    for (const plot of userPlots) {
      const plotCrops = await cropService.getCrops(plot.id)
      allCrops.push(...plotCrops)
    }
    
    return allCrops
  }

  const handleCropCreate = async (cropData: Omit<Crop, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCrop = await cropService.assignCrop(cropData)
      setCrops(prev => [newCrop, ...prev])
      setSelectedCrop(newCrop)
      setIsCreating(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create crop')
      console.error('Error creating crop:', err)
    }
  }

  const handleCropUpdate = async (cropId: string, updates: Partial<Crop>) => {
    try {
      // For now, we'll update the crop status
      if (updates.status) {
        const updatedCrop = await cropService.updateCropStatus(
          cropId, 
          updates.status, 
          updates.growth_stage
        )
        setCrops(prev => prev.map(crop => 
          crop.id === cropId ? updatedCrop : crop
        ))
        
        if (selectedCrop?.id === cropId) {
          setSelectedCrop(updatedCrop)
        }
      }
      
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update crop')
      console.error('Error updating crop:', err)
    }
  }

  const handleCropHarvest = async (cropId: string) => {
    try {
      const result = await cropService.harvestCrop(cropId)
      setCrops(prev => prev.map(crop => 
        crop.id === cropId ? result.crop : crop
      ))
      
      if (selectedCrop?.id === cropId) {
        setSelectedCrop(result.crop)
      }

      // Award XP through gamification system (this would be handled by useGamification hook)
      // For now, show success message
      alert(`Crop harvested successfully! You earned ${result.xpAwarded} XP!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to harvest crop')
      console.error('Error harvesting crop:', err)
    }
  }

  const handleCropSelect = (crop: Crop) => {
    setSelectedCrop(crop)
    setIsEditing(false)
    setIsCreating(false)
  }

  const startCreating = () => {
    setIsCreating(true)
    setIsEditing(false)
    setSelectedCrop(null)
    setError(null)
  }

  const cancelCreating = () => {
    setIsCreating(false)
    setError(null)
  }

  const startEditing = () => {
    setIsEditing(true)
    setIsCreating(false)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const getFilteredCrops = () => {
    switch (filter) {
      case 'active':
        return crops.filter(crop => crop.status !== 'harvested')
      case 'ready':
        return crops.filter(crop => crop.status === 'ready')
      case 'harvested':
        return crops.filter(crop => crop.status === 'harvested')
      default:
        return crops
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to track your crops.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading crops...</p>
      </div>
    )
  }

  const filteredCrops = getFilteredCrops()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crop Tracker</h2>
          <p className="text-gray-600">Monitor your crops and track their growth progress</p>
        </div>
        
        <div className="flex space-x-2">
          {!isCreating && plots.length > 0 && (
            <button
              onClick={startCreating}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              🌱 Add New Crop
            </button>
          )}
          
          {isCreating && (
            <button
              onClick={cancelCreating}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No plots message */}
      {plots.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plots available</h3>
          <p className="text-gray-600 mb-4">
            You need to create plots before you can track crops
          </p>
        </div>
      )}

      {plots.length > 0 && (
        <>
          {/* Statistics */}
          <CropStats crops={crops} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Crop Form */}
              {isCreating && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Crop</h3>
                  <CropForm
                    plots={plots}
                    onSave={handleCropCreate}
                    onCancel={cancelCreating}
                  />
                </div>
              )}

              {/* Crop Timeline */}
              {selectedCrop && !isEditing && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCrop.name} Timeline
                    </h3>
                    <div className="flex space-x-2">
                      {selectedCrop.status === 'ready' && (
                        <button
                          onClick={() => handleCropHarvest(selectedCrop.id)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                        >
                          🚜 Harvest
                        </button>
                      )}
                      <button
                        onClick={startEditing}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <CropTimeline crop={selectedCrop} />
                </div>
              )}

              {/* Crop Edit Form */}
              {selectedCrop && isEditing && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Crop</h3>
                    <button
                      onClick={cancelEditing}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <CropForm
                    crop={selectedCrop}
                    plots={plots}
                    onSave={(updates) => handleCropUpdate(selectedCrop.id, updates)}
                    onCancel={cancelEditing}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Filter */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Crops</h3>
                <div className="space-y-2">
                  {[
                    { key: 'all', label: 'All Crops', count: crops.length },
                    { key: 'active', label: 'Active', count: crops.filter(c => c.status !== 'harvested').length },
                    { key: 'ready', label: 'Ready to Harvest', count: crops.filter(c => c.status === 'ready').length },
                    { key: 'harvested', label: 'Harvested', count: crops.filter(c => c.status === 'harvested').length }
                  ].map(filterOption => (
                    <button
                      key={filterOption.key}
                      onClick={() => setFilter(filterOption.key as any)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filter === filterOption.key
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{filterOption.label}</span>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {filterOption.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {filter === 'all' ? 'All Crops' : 
                   filter === 'active' ? 'Active Crops' :
                   filter === 'ready' ? 'Ready to Harvest' : 'Harvested Crops'}
                </h3>
                
                <CropList
                  crops={filteredCrops}
                  selectedCropId={selectedCrop?.id}
                  onCropSelect={handleCropSelect}
                  onCropHarvest={handleCropHarvest}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}