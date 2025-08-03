'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { LeafletMap } from '../maps/LeafletMap'
import { PlotForm } from './PlotForm'
import { PlotList } from './PlotList'
import { SupabasePlotService } from '@/lib/services/plot.service'
import { Plot } from '@/lib/types'

interface PlotManagerProps {
  className?: string
}

export function PlotManager({ className = '' }: PlotManagerProps) {
  const { user } = useAuth()
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060])

  const plotService = new SupabasePlotService()

  // Load plots on component mount
  useEffect(() => {
    if (user) {
      loadPlots()
      
      // Set map center to user's location if available
      if (user.location) {
        setMapCenter([user.location.latitude, user.location.longitude])
      }
    }
  }, [user])

  const loadPlots = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const userPlots = await plotService.getPlots(user.id)
      setPlots(userPlots)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plots')
      console.error('Error loading plots:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePlotCreate = async (geometry: GeoJSON.Polygon) => {
    if (!user) return

    try {
      // Validate geometry
      const validation = plotService.validatePlotGeometry(geometry)
      if (!validation.isValid) {
        setError(`Invalid plot geometry: ${validation.errors.join(', ')}`)
        return
      }

      // Create plot with default name
      const plotData = {
        user_id: user.id,
        name: `Plot ${plots.length + 1}`,
        description: 'New farming plot',
        geometry,
        soil_type: 'Unknown',
        irrigation_type: 'Manual',
        is_active: true
      }

      const newPlot = await plotService.createPlot(plotData)
      setPlots(prev => [newPlot, ...prev])
      setSelectedPlot(newPlot)
      setIsCreating(false)
      setIsEditing(true) // Open edit form for the new plot
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plot')
      console.error('Error creating plot:', err)
    }
  }

  const handlePlotEdit = async (plotId: string, geometry: GeoJSON.Polygon) => {
    try {
      // Validate geometry
      const validation = plotService.validatePlotGeometry(geometry)
      if (!validation.isValid) {
        setError(`Invalid plot geometry: ${validation.errors.join(', ')}`)
        return
      }

      const updatedPlot = await plotService.updatePlot(plotId, { geometry })
      setPlots(prev => prev.map(plot => 
        plot.id === plotId ? updatedPlot : plot
      ))
      
      if (selectedPlot?.id === plotId) {
        setSelectedPlot(updatedPlot)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plot')
      console.error('Error updating plot:', err)
    }
  }

  const handlePlotSelect = (plotId: string) => {
    const plot = plots.find(p => p.id === plotId)
    setSelectedPlot(plot || null)
    setIsEditing(false)
    setIsCreating(false)
  }

  const handlePlotUpdate = async (plotId: string, updates: Partial<Plot>) => {
    try {
      const updatedPlot = await plotService.updatePlot(plotId, updates)
      setPlots(prev => prev.map(plot => 
        plot.id === plotId ? updatedPlot : plot
      ))
      
      if (selectedPlot?.id === plotId) {
        setSelectedPlot(updatedPlot)
      }
      
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plot')
      console.error('Error updating plot:', err)
    }
  }

  const handlePlotDelete = async (plotId: string) => {
    if (!confirm('Are you sure you want to delete this plot? This action cannot be undone.')) {
      return
    }

    try {
      await plotService.deletePlot(plotId)
      setPlots(prev => prev.filter(plot => plot.id !== plotId))
      
      if (selectedPlot?.id === plotId) {
        setSelectedPlot(null)
      }
      
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plot')
      console.error('Error deleting plot:', err)
    }
  }

  const startCreating = () => {
    setIsCreating(true)
    setIsEditing(false)
    setSelectedPlot(null)
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

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to manage your plots.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plot Manager</h2>
          <p className="text-gray-600">Manage your farming plots and track their status</p>
        </div>
        
        <div className="flex space-x-2">
          {!isCreating && (
            <button
              onClick={startCreating}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              ➕ Add New Plot
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Farm Map</h3>
              <div className="text-sm text-gray-600">
                {plots.length} plot{plots.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <LeafletMap
              center={mapCenter}
              zoom={15}
              height="500px"
              plots={plots.map(plot => ({
                id: plot.id,
                name: plot.name,
                geometry: plot.geometry,
                status: plot.is_active ? 'active' : 'inactive'
              }))}
              onPlotCreate={handlePlotCreate}
              onPlotEdit={handlePlotEdit}
              onPlotSelect={handlePlotSelect}
              editMode={isCreating}
              selectedPlotId={selectedPlot?.id}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plot Form */}
          {(isEditing && selectedPlot) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Plot</h3>
                <button
                  onClick={cancelEditing}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <PlotForm
                plot={selectedPlot}
                onSave={(updates) => handlePlotUpdate(selectedPlot.id, updates)}
                onCancel={cancelEditing}
                onDelete={() => handlePlotDelete(selectedPlot.id)}
              />
            </div>
          )}

          {/* Plot Details */}
          {selectedPlot && !isEditing && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Plot Details</h3>
                <button
                  onClick={startEditing}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedPlot.name}</p>
                </div>
                
                {selectedPlot.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{selectedPlot.description}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Area</label>
                  <p className="text-gray-900">{selectedPlot.area_hectares.toFixed(2)} hectares</p>
                </div>
                
                {selectedPlot.soil_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Soil Type</label>
                    <p className="text-gray-900">{selectedPlot.soil_type}</p>
                  </div>
                )}
                
                {selectedPlot.irrigation_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Irrigation</label>
                    <p className="text-gray-900">{selectedPlot.irrigation_type}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedPlot.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedPlot.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                
                {selectedPlot.crops && selectedPlot.crops.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Crops</label>
                    <div className="space-y-1">
                      {selectedPlot.crops.map((crop, index) => (
                        <p key={index} className="text-sm text-gray-900">
                          {crop.name} ({crop.status})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plot List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plots</h3>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading plots...</p>
              </div>
            ) : (
              <PlotList
                plots={plots}
                selectedPlotId={selectedPlot?.id}
                onPlotSelect={handlePlotSelect}
                onPlotEdit={(plot) => {
                  setSelectedPlot(plot)
                  startEditing()
                }}
                onPlotDelete={handlePlotDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}