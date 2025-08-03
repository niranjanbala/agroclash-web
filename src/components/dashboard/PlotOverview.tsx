'use client'

import React, { useState } from 'react'
import { Plot } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface PlotOverviewProps {
  plots: Plot[]
  onPlotAction: (action: string, data?: any) => void
  loading?: boolean
  className?: string
}

export function PlotOverview({ plots, onPlotAction, loading = false, className = '' }: PlotOverviewProps) {
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)

  const formatArea = (hectares: number) => {
    if (hectares < 1) {
      return `${(hectares * 10000).toFixed(0)} m²`
    }
    return `${hectares.toFixed(2)} ha`
  }

  const getPlotStatusColor = (plot: Plot) => {
    // This would be based on crop status, weather conditions, etc.
    // For now, we'll use a simple random assignment
    const colors = ['bg-green-100 border-green-300', 'bg-yellow-100 border-yellow-300', 'bg-blue-100 border-blue-300']
    return colors[plot.id.length % colors.length]
  }

  const handleCreatePlot = () => {
    onPlotAction('create_plot', { 
      name: `Plot ${plots.length + 1}`,
      timestamp: Date.now()
    })
  }

  const handleViewPlot = (plot: Plot) => {
    setSelectedPlot(plot)
  }

  const handleEditPlot = (plot: Plot) => {
    onPlotAction('edit_plot', { plotId: plot.id })
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Plot Overview</h2>
            <p className="text-sm text-gray-600">
              {plots.length} plot{plots.length !== 1 ? 's' : ''} • {plots.reduce((sum, plot) => sum + plot.area_hectares, 0).toFixed(2)} ha total
            </p>
          </div>
          <button
            onClick={handleCreatePlot}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Plot</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading plots...</span>
          </div>
        ) : plots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plots.map(plot => (
              <div
                key={plot.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getPlotStatusColor(plot)}`}
                onClick={() => handleViewPlot(plot)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{plot.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditPlot(plot)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium">{formatArea(plot.area_hectares)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(plot.created_at)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>

                {/* Mini map placeholder */}
                <div className="mt-3 h-20 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">📍 Map View</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plots yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first plot to start managing your crops
            </p>
            <button
              onClick={handleCreatePlot}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create First Plot</span>
            </button>
          </div>
        )}
      </div>

      {/* Plot Detail Modal */}
      {selectedPlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedPlot.name}</h3>
                <button
                  onClick={() => setSelectedPlot(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">Plot Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Area:</span>
                      <span className="text-sm font-medium">{formatArea(selectedPlot.area_hectares)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm font-medium">{formatDate(selectedPlot.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Updated:</span>
                      <span className="text-sm font-medium">{formatDate(selectedPlot.updated_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        onPlotAction('view_crops', { plotId: selectedPlot.id })
                        setSelectedPlot(null)
                      }}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                    >
                      🌱 View Crops
                    </button>
                    <button
                      onClick={() => {
                        onPlotAction('add_crop', { plotId: selectedPlot.id })
                        setSelectedPlot(null)
                      }}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                    >
                      ➕ Add Crop
                    </button>
                    <button
                      onClick={() => {
                        onPlotAction('view_map', { plotId: selectedPlot.id })
                        setSelectedPlot(null)
                      }}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                    >
                      🗺️ View on Map
                    </button>
                    <button
                      onClick={() => {
                        onPlotAction('edit_plot', { plotId: selectedPlot.id })
                        setSelectedPlot(null)
                      }}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                    >
                      ✏️ Edit Plot
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Map placeholder */}
              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Location</h4>
                <div className="h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">🗺️</span>
                    <span className="text-sm text-gray-500">Interactive map would be shown here</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}