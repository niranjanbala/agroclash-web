'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '@/lib/services/factory'
import { Crop } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface MarketListing {
  id: string
  cropId: string
  cropName: string
  variety?: string
  quantity: number
  pricePerKg: number
  totalValue: number
  status: 'active' | 'sold' | 'expired' | 'cancelled'
  listedAt: string
  expiresAt: string
  description?: string
  images?: string[]
}

interface ListingManagerProps {
  className?: string
}

export function ListingManager({ className = '' }: ListingManagerProps) {
  const { user } = useAuth()
  const [listings, setListings] = useState<MarketListing[]>([])
  const [availableCrops, setAvailableCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'expired'>('all')

  const marketService = ServiceFactory.getMarketService()
  const cropService = ServiceFactory.getCropService()

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load user's listings and available crops
      const [userListings, harvestedCrops] = await Promise.all([
        loadUserListings(),
        cropService.getCropsByStatus(user!.id, 'harvested')
      ])
      
      setListings(userListings)
      setAvailableCrops(harvestedCrops)
    } catch (error) {
      console.error('Error loading listing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserListings = async (): Promise<MarketListing[]> => {
    // Mock implementation - in real app, this would fetch from API
    return [
      {
        id: '1',
        cropId: 'crop-1',
        cropName: 'Tomatoes',
        variety: 'Cherry',
        quantity: 50,
        pricePerKg: 3.50,
        totalValue: 175,
        status: 'active',
        listedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Fresh, organic cherry tomatoes from my garden'
      },
      {
        id: '2',
        cropId: 'crop-2',
        cropName: 'Corn',
        variety: 'Sweet',
        quantity: 100,
        pricePerKg: 0.85,
        totalValue: 85,
        status: 'sold',
        listedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Sweet corn, perfect for summer meals'
      }
    ]
  }

  const handleCreateListing = async (listingData: Partial<MarketListing>) => {
    try {
      // In real implementation, this would call the API
      const newListing: MarketListing = {
        id: `listing-${Date.now()}`,
        cropId: listingData.cropId!,
        cropName: listingData.cropName!,
        variety: listingData.variety,
        quantity: listingData.quantity!,
        pricePerKg: listingData.pricePerKg!,
        totalValue: listingData.quantity! * listingData.pricePerKg!,
        status: 'active',
        listedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: listingData.description
      }

      setListings(prev => [newListing, ...prev])
      setShowCreateForm(false)
      
      // Award XP for listing
      // await xpService.awardXP(user!.id, 'create_listing', 10, 'Created marketplace listing')
      
    } catch (error) {
      console.error('Error creating listing:', error)
    }
  }

  const handleCancelListing = async (listingId: string) => {
    try {
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: 'cancelled' as const }
            : listing
        )
      )
    } catch (error) {
      console.error('Error cancelling listing:', error)
    }
  }

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true
    return listing.status === filter
  })

  const getStatusColor = (status: MarketListing['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'sold': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: MarketListing['status']) => {
    switch (status) {
      case 'active': return '🟢'
      case 'sold': return '✅'
      case 'expired': return '⏰'
      case 'cancelled': return '❌'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading your listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
          <p className="text-sm text-gray-600">Manage your crop listings and sales</p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          + Create Listing
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">🟢</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {listings.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sold</p>
              <p className="text-2xl font-semibold text-gray-900">
                {listings.filter(l => l.status === 'sold').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(listings.filter(l => l.status === 'sold').reduce((sum, l) => sum + l.totalValue, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Price/kg</p>
              <p className="text-2xl font-semibold text-gray-900">
                {listings.length > 0 ? 
                  formatCurrency(listings.reduce((sum, l) => sum + l.pricePerKg, 0) / listings.length) :
                  '$0.00'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['all', 'active', 'sold', 'expired'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === status
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} 
              ({status === 'all' ? listings.length : listings.filter(l => l.status === status).length})
            </button>
          ))}
        </nav>
      </div>

      {/* Listings */}
      <div className="bg-white rounded-lg shadow-md">
        {filteredListings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredListings.map(listing => (
              <div key={listing.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🌾</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {listing.cropName}
                          {listing.variety && (
                            <span className="text-gray-500"> ({listing.variety})</span>
                          )}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                          {getStatusIcon(listing.status)} {listing.status}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <span>{listing.quantity} kg</span>
                        <span>•</span>
                        <span>{formatCurrency(listing.pricePerKg)}/kg</span>
                        <span>•</span>
                        <span className="font-medium text-gray-900">
                          Total: {formatCurrency(listing.totalValue)}
                        </span>
                      </div>
                      
                      {listing.description && (
                        <p className="mt-2 text-sm text-gray-600">{listing.description}</p>
                      )}
                      
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Listed: {formatDate(listing.listedAt)}</span>
                        {listing.status === 'active' && (
                          <span>Expires: {formatDate(listing.expiresAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {listing.status === 'active' && (
                      <>
                        <button
                          onClick={() => setSelectedListing(listing)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCancelListing(listing.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No listings yet' : `No ${filter} listings`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Create your first listing to start selling your crops'
                : `You don't have any ${filter} listings at the moment`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Create Your First Listing
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showCreateForm && (
        <CreateListingModal
          availableCrops={availableCrops}
          onSubmit={handleCreateListing}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}

interface CreateListingModalProps {
  availableCrops: Crop[]
  onSubmit: (data: Partial<MarketListing>) => void
  onCancel: () => void
}

function CreateListingModal({ availableCrops, onSubmit, onCancel }: CreateListingModalProps) {
  const [formData, setFormData] = useState({
    cropId: '',
    quantity: '',
    pricePerKg: '',
    description: '',
    duration: '7' // days
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedCrop = availableCrops.find(crop => crop.id === formData.cropId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.cropId) newErrors.cropId = 'Please select a crop'
    if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = 'Please enter a valid quantity'
    if (!formData.pricePerKg || Number(formData.pricePerKg) <= 0) newErrors.pricePerKg = 'Please enter a valid price'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      cropId: formData.cropId,
      cropName: selectedCrop?.name || '',
      variety: selectedCrop?.variety,
      quantity: Number(formData.quantity),
      pricePerKg: Number(formData.pricePerKg),
      description: formData.description
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Listing</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Crop
            </label>
            <select
              value={formData.cropId}
              onChange={(e) => setFormData(prev => ({ ...prev, cropId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Choose a crop...</option>
              {availableCrops.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} {crop.variety && `(${crop.variety})`}
                </option>
              ))}
            </select>
            {errors.cropId && <p className="text-red-600 text-sm mt-1">{errors.cropId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter quantity"
            />
            {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per kg ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.pricePerKg}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerKg: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter price per kg"
            />
            {errors.pricePerKg && <p className="text-red-600 text-sm mt-1">{errors.pricePerKg}</p>}
          </div>

          {formData.quantity && formData.pricePerKg && (
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Total Value: {formatCurrency(Number(formData.quantity) * Number(formData.pricePerKg))}</strong>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Describe your crop quality, growing conditions, etc."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}