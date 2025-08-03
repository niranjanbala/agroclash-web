'use client'

import React from 'react'
import { Plot } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface PlotListProps {
  plots: Plot[]
  selectedPlotId?: string
  onPlotSelect: (plotId: string) => void
  onPlotEdit: (plot: Plot) => void
  onPlotDelete: (plotId: string) => void
}

export function PlotList({ 
  plots, 
  selectedPlotId, 
  onPlotSelect, 
  onPlotEdit, 
  onPlotDelete 
}: PlotListProps) {
  if (plots.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No plots yet</h3>
        <p className="text-gray-600 mb-4">
          Create your first plot to start managing your farm
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {plots.map((plot) => (
        <PlotListItem
          key={plot.id}
          plot={plot}
          isSelected={plot.id === selectedPlotId}
          onSelect={() => onPlotSelect(plot.id)}
          onEdit={() => onPlotEdit(plot)}
          onDelete={() => onPlotDelete(plot.id)}
        />
      ))}
    </div>
  )
}

interface PlotListItemProps {
  plot: Plot
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

function PlotListItem({ plot, isSelected, onSelect, onEdit, onDelete }: PlotListItemProps) {
  const activeCrops = plot.crops?.filter(crop => crop.status !== 'harvested').length || 0
  const totalCrops = plot.crops?.length || 0

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
          {/* Plot Name and Status */}
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {plot.name}
            </h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                plot.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {plot.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Plot Details */}
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>{plot.area_hectares.toFixed(2)} hectares</span>
            </div>

            {totalCrops > 0 && (
              <div className="flex items-center text-xs text-gray-600">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{activeCrops} active crop{activeCrops !== 1 ? 's' : ''}</span>
                {totalCrops > activeCrops && (
                  <span className="text-gray-400 ml-1">
                    ({totalCrops - activeCrops} harvested)
                  </span>
                )}
              </div>
            )}

            {plot.soil_type && (
              <div className="flex items-center text-xs text-gray-600">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{plot.soil_type} soil</span>
              </div>
            )}

            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Created {formatDate(plot.created_at)}</span>
            </div>
          </div>

          {/* Crops Preview */}
          {plot.crops && plot.crops.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {plot.crops.slice(0, 3).map((crop, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      crop.status === 'harvested'
                        ? 'bg-gray-100 text-gray-700'
                        : crop.status === 'ready'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {crop.name}
                  </span>
                ))}
                {plot.crops.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    +{plot.crops.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Menu */}
        <div className="flex-shrink-0 ml-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Edit plot"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Are you sure you want to delete "${plot.name}"? This action cannot be undone.`)) {
                  onDelete()
                }
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete plot"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}