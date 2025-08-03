'use client'

import React, { useState } from 'react'
import { Crop, Plot } from '@/lib/types'

interface CropFormProps {
  crop?: Crop
  plots: Plot[]
  onSave: (cropData: Partial<Crop>) => void
  onCancel: () => void
}

export function CropForm({ crop, plots, onSave, onCancel }: CropFormProps) {
  const [formData, setFormData] = useState({
    plot_id: crop?.plot_id || (plots.length > 0 ? plots[0].id : ''),
    name: crop?.name || '',
    variety: crop?.variety || '',
    sown_date: crop?.sown_date || new Date().toISOString().split('T')[0],
    expected_harvest_date: crop?.expected_harvest_date || '',
    status: crop?.status || 'planted',
    growth_stage: crop?.growth_stage || 'seedling',
    quantity_planted: crop?.quantity_planted || '',
    notes: crop?.notes || ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cropTypes = [
    'Tomatoes',
    'Corn',
    'Wheat',
    'Rice',
    'Potatoes',
    'Lettuce',
    'Peppers',
    'Carrots',
    'Onions',
    'Beans',
    'Peas',
    'Spinach',
    'Broccoli',
    'Cabbage',
    'Cucumbers',
    'Squash',
    'Pumpkins',
    'Eggplant',
    'Radishes',
    'Beets'
  ]

  const cropStatuses: Crop['status'][] = ['planted', 'growing', 'flowering', 'ready', 'harvested']
  const growthStages: Crop['growth_stage'][] = ['seedling', 'vegetative', 'flowering', 'fruiting', 'mature']

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.plot_id) {
      newErrors.plot_id = 'Please select a plot'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Crop name is required'
    }

    if (!formData.sown_date) {
      newErrors.sown_date = 'Sown date is required'
    } else {
      const sownDate = new Date(formData.sown_date)
      const today = new Date()
      if (sownDate > today) {
        newErrors.sown_date = 'Sown date cannot be in the future'
      }
    }

    if (formData.expected_harvest_date) {
      const sownDate = new Date(formData.sown_date)
      const harvestDate = new Date(formData.expected_harvest_date)
      if (harvestDate <= sownDate) {
        newErrors.expected_harvest_date = 'Harvest date must be after sown date'
      }
    }

    if (formData.quantity_planted && isNaN(Number(formData.quantity_planted))) {
      newErrors.quantity_planted = 'Quantity must be a number'
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

    try {
      const cropData: Partial<Crop> = {
        plot_id: formData.plot_id,
        name: formData.name.trim(),
        variety: formData.variety.trim() || undefined,
        sown_date: formData.sown_date,
        expected_harvest_date: formData.expected_harvest_date || undefined,
        status: formData.status,
        growth_stage: formData.growth_stage,
        quantity_planted: formData.quantity_planted ? Number(formData.quantity_planted) : undefined,
        notes: formData.notes.trim() || undefined
      }

      await onSave(cropData)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to save crop. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const calculateExpectedHarvestDate = (cropName: string, sownDate: string) => {
    if (!sownDate) return ''

    // Typical growing periods for different crops (in days)
    const growingPeriods: { [key: string]: number } = {
      'lettuce': 45,
      'radishes': 30,
      'spinach': 40,
      'peas': 60,
      'beans': 70,
      'carrots': 75,
      'onions': 90,
      'broccoli': 80,
      'cabbage': 90,
      'tomatoes': 85,
      'peppers': 90,
      'cucumbers': 60,
      'squash': 50,
      'corn': 90,
      'potatoes': 90,
      'wheat': 120,
      'rice': 120
    }

    const days = growingPeriods[cropName.toLowerCase()] || 75 // Default to 75 days
    const sown = new Date(sownDate)
    const harvest = new Date(sown)
    harvest.setDate(sown.getDate() + days)
    
    return harvest.toISOString().split('T')[0]
  }

  // Auto-calculate expected harvest date when crop name or sown date changes
  React.useEffect(() => {
    if (formData.name && formData.sown_date && !crop) {
      const expectedDate = calculateExpectedHarvestDate(formData.name, formData.sown_date)
      setFormData(prev => ({ ...prev, expected_harvest_date: expectedDate }))
    }
  }, [formData.name, formData.sown_date, crop])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Plot Selection */}
      <div>
        <label htmlFor="plot_id" className="block text-sm font-medium text-gray-700 mb-1">
          Plot *
        </label>
        <select
          id="plot_id"
          name="plot_id"
          value={formData.plot_id}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.plot_id ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting || !!crop}
        >
          <option value="">Select a plot</option>
          {plots.map(plot => (
            <option key={plot.id} value={plot.id}>
              {plot.name} ({plot.area_hectares.toFixed(2)} ha)
            </option>
          ))}
        </select>
        {errors.plot_id && (
          <p className="mt-1 text-sm text-red-600">{errors.plot_id}</p>
        )}
      </div>

      {/* Crop Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Crop Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          list="crop-types"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter crop name"
          disabled={isSubmitting}
        />
        <datalist id="crop-types">
          {cropTypes.map(type => (
            <option key={type} value={type} />
          ))}
        </datalist>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Variety */}
      <div>
        <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
          Variety (Optional)
        </label>
        <input
          type="text"
          id="variety"
          name="variety"
          value={formData.variety}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="e.g., Cherry, Roma, Beefsteak"
          disabled={isSubmitting}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sown_date" className="block text-sm font-medium text-gray-700 mb-1">
            Sown Date *
          </label>
          <input
            type="date"
            id="sown_date"
            name="sown_date"
            value={formData.sown_date}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.sown_date ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.sown_date && (
            <p className="mt-1 text-sm text-red-600">{errors.sown_date}</p>
          )}
        </div>

        <div>
          <label htmlFor="expected_harvest_date" className="block text-sm font-medium text-gray-700 mb-1">
            Expected Harvest Date
          </label>
          <input
            type="date"
            id="expected_harvest_date"
            name="expected_harvest_date"
            value={formData.expected_harvest_date}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.expected_harvest_date ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.expected_harvest_date && (
            <p className="mt-1 text-sm text-red-600">{errors.expected_harvest_date}</p>
          )}
        </div>
      </div>

      {/* Status and Growth Stage (for editing) */}
      {crop && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={isSubmitting}
            >
              {cropStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="growth_stage" className="block text-sm font-medium text-gray-700 mb-1">
              Growth Stage
            </label>
            <select
              id="growth_stage"
              name="growth_stage"
              value={formData.growth_stage}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={isSubmitting}
            >
              {growthStages.map(stage => (
                <option key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Quantity Planted */}
      <div>
        <label htmlFor="quantity_planted" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity Planted
        </label>
        <input
          type="number"
          id="quantity_planted"
          name="quantity_planted"
          value={formData.quantity_planted}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.quantity_planted ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Number of plants/seeds"
          min="1"
          disabled={isSubmitting}
        />
        {errors.quantity_planted && (
          <p className="mt-1 text-sm text-red-600">{errors.quantity_planted}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Optional notes about this crop"
          disabled={isSubmitting}
        />
      </div>

      {/* Error Display */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
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
            crop ? 'Update Crop' : 'Add Crop'
          )}
        </button>
      </div>
    </form>
  )
}