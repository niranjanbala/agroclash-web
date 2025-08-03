'use client'

import React, { useState } from 'react'
import { Plot } from '@/lib/types'

interface PlotFormProps {
  plot?: Plot
  onSave: (plotData: Partial<Plot>) => void
  onCancel: () => void
  onDelete?: () => void
}

export function PlotForm({ plot, onSave, onCancel, onDelete }: PlotFormProps) {
  const [formData, setFormData] = useState({
    name: plot?.name || '',
    description: plot?.description || '',
    soil_type: plot?.soil_type || '',
    irrigation_type: plot?.irrigation_type || 'Manual',
    is_active: plot?.is_active ?? true
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const soilTypes = [
    'Clay',
    'Sandy',
    'Loamy',
    'Silty',
    'Peaty',
    'Chalky',
    'Mixed',
    'Unknown'
  ]

  const irrigationTypes = [
    'Manual',
    'Drip',
    'Sprinkler',
    'Flood',
    'Furrow',
    'Center Pivot',
    'Micro-spray',
    'None'
  ]

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Plot name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Plot name must be at least 2 characters'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Plot name cannot exceed 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const plotData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        soil_type: formData.soil_type || undefined,
        irrigation_type: formData.irrigation_type,
        is_active: formData.is_active
      }

      await onSave(plotData)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to save plot. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Plot Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Plot Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter plot name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Optional description of the plot"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Soil Type */}
      <div>
        <label htmlFor="soil_type" className="block text-sm font-medium text-gray-700 mb-1">
          Soil Type
        </label>
        <select
          id="soil_type"
          name="soil_type"
          value={formData.soil_type}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          disabled={isSubmitting}
        >
          <option value="">Select soil type</option>
          {soilTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Irrigation Type */}
      <div>
        <label htmlFor="irrigation_type" className="block text-sm font-medium text-gray-700 mb-1">
          Irrigation Type
        </label>
        <select
          id="irrigation_type"
          name="irrigation_type"
          value={formData.irrigation_type}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          disabled={isSubmitting}
        >
          {irrigationTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleInputChange}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          disabled={isSubmitting}
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Plot is active
        </label>
      </div>

      {/* Plot Info */}
      {plot && (
        <div className="bg-gray-50 rounded-md p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Plot Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Area:</span>
              <span className="ml-1 font-medium">{plot.area_hectares.toFixed(2)} ha</span>
            </div>
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-1 font-medium">
                {new Date(plot.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <div>
          {onDelete && plot && (
            <button
              type="button"
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              disabled={isSubmitting}
            >
              Delete Plot
            </button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              plot ? 'Update Plot' : 'Create Plot'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}