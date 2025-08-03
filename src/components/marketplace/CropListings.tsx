'use client'

import React, { useState, useEffect } from 'react'
import { SupabaseCropService } from '@/lib/services/crop.service'
import { ServiceFactory } from '@/lib/services/factory'
import { Crop } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'

interface CropListingsProps {
  userId: string
  className?: string
}

export function CropListings({ userId, className = '' }: CropListingsProps) {
  const [harvestedCrops, setHarvestedCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const [showListingForm, setShowListingForm] = useState(false)

  const cropService = new SupabaseCropService()
  const marketService = ServiceFactory.getMarketService()

  useEffect(() => {
    loadHarvestedCrops()
  }, [userId])

  const loadHarvestedCrops = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const crops = await cropService.getCropsByStatus(userId, 'harvested')
      setHarvestedCrops(crops)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load harvested crops')
      console.error('Error loading harvested crops:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleListCrop = (crop: Crop) => {
    setSelectedCrop(crop)
    setShowListingForm(true)
  }

  const handleCancelListing = () => {
    setSelectedCrop(null)
    setShowListingForm(false)
  }

  const handleSubmitListing = async (listingData: {
    quantity: number
    pricePerKg: number
    description: string
  }) => {
    if (!selectedCrop) return

    try {
      await marketService.listCrop(selectedCrop.id, listingData.quantity, listingData.pricePerKg)
      
      // Show success message
      alert(`Successfully listed ${listingData.quantity}kg of ${selectedCrop.name} for ${formatCurrency(listingData.pricePerKg)}/kg!`)
      
      setShowListingForm(false)
      setSelectedCrop(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list crop')
      console.error('Error listing crop:', err)
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading your harvested crops...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={loadHarvestedCrops}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sell Your Crops</h3>
        <p className="text-gray-600">
          List your harvested crops for sale in the marketplace
        </p>
      </div>

      {/* Listing Form */}
      {showListingForm && selectedCrop && (
        <CropListingForm
          crop={selectedCrop}
          onSubmit={handleSubmitListing}
          onCancel={handleCancelListing}
        />
      )}

      {/* Harvested Crops */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Your Harvested Crops</h4>
        
        {harvestedCrops.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No harvested crops yet</h3>
            <p className="text-gray-600">
              Harvest your crops to start selling them in the marketplace
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {harvestedCrops.map(crop => (
              <CropCard
                key={crop.id}
                crop={crop}
                onList={() => handleListCrop(crop)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface CropCardProps {
  crop: Crop
  onList: () => void
}

function CropCard({ crop, onList }: CropCardProps) {
  const getEstimatedPrice = (cropName: string): number => {
    // Mock price estimation based on crop type
    const basePrices: { [key: string]: number } = {
      'tomatoes': 3.20,
      'corn': 0.80,
      'wheat': 0.90,
      'rice': 1.05,
      'potatoes': 0.65,
      'lettuce': 2.10,
      'peppers': 2.80,
      'carrots': 1.25,
      'onions': 0.85
    }
    
    return basePrices[cropName.toLowerCase()] || 1.50
  }

  const estimatedPrice = getEstimatedPrice(crop.name)
  const estimatedValue = crop.quantity_harvested ? crop.quantity_harvested * estimatedPrice : 0

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h5 className="font-medium text-gray-900">
            {crop.name}
            {crop.variety && (
              <span className="text-gray-600 font-normal"> ({crop.variety})</span>
            )}
          </h5>
          <p className="text-sm text-gray-600">
            Harvested {formatDate(crop.actual_harvest_date || crop.created_at)}
          </p>
        </div>
        <div className="text-2xl">🌾</div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium text-gray-900">
            {crop.quantity_harvested || 'Unknown'} kg
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Est. Price:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(estimatedPrice)}/kg
          </span>
        </div>
        
        {crop.quantity_harvested && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Est. Value:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(estimatedValue)}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onList}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
      >
        List for Sale
      </button>
    </div>
  )
}

interface CropListingFormProps {
  crop: Crop
  onSubmit: (data: { quantity: number; pricePerKg: number; description: string }) => void
  onCancel: () => void
}

function CropListingForm({ crop, onSubmit, onCancel }: CropListingFormProps) {
  const [formData, setFormData] = useState({
    quantity: crop.quantity_harvested || 0,
    pricePerKg: 0,
    description: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Set initial price based on market data
  useEffect(() => {
    const getMarketPrice = async () => {
      try {
        const marketService = ServiceFactory.getMarketService()
        const prices = await marketService.getPrices(crop.name)
        
        if (prices.length > 0) {
          const avgPrice = prices.reduce((sum, p) => sum + p.price_per_kg, 0) / prices.length
          setFormData(prev => ({ ...prev, pricePerKg: Math.round(avgPrice * 100) / 100 }))
        }
      } catch (error) {
        console.error('Error fetching market price:', error)
      }
    }

    getMarketPrice()
  }, [crop.name])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (formData.quantity > (crop.quantity_harvested || 0)) {
      newErrors.quantity = `Cannot exceed harvested quantity (${crop.quantity_harvested} kg)`
    }

    if (formData.pricePerKg <= 0) {
      newErrors.pricePerKg = 'Price must be greater than 0'
    }

    if (formData.pricePerKg > 100) {
      newErrors.pricePerKg = 'Price seems too high. Please verify.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'description' ? value : Number(value) }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const estimatedTotal = formData.quantity * formData.pricePerKg

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          List {crop.name} for Sale
        </h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (kg) *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="0.1"
              step="0.1"
              max={crop.quantity_harvested || undefined}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Available: {crop.quantity_harvested || 0} kg
            </p>
          </div>

          <div>
            <label htmlFor="pricePerKg" className="block text-sm font-medium text-gray-700 mb-1">
              Price per kg ($) *
            </label>
            <input
              type="number"
              id="pricePerKg"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleInputChange}
              min="0.01"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.pricePerKg ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.pricePerKg && (
              <p className="mt-1 text-sm text-red-600">{errors.pricePerKg}</p>
            )}
          </div>
        </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Optional description of your crop quality, organic certification, etc."
          />
        </div>

        {/* Estimated Total */}
        {estimatedTotal > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-800">
                Estimated Total Value:
              </span>
              <span className="text-lg font-bold text-green-900">
                {formatCurrency(estimatedTotal)}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            List for Sale
          </button>
        </div>
      </form>
    </div>
  )
}