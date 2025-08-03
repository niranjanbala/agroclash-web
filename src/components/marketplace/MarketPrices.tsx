'use client'

import React, { useState } from 'react'
import { MarketPrice } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'

interface MarketPricesProps {
  prices: MarketPrice[]
  loading: boolean
  searchQuery: string
  className?: string
}

export function MarketPrices({ prices, loading, searchQuery, className = '' }: MarketPricesProps) {
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'trend' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterTrend, setFilterTrend] = useState<'all' | 'up' | 'down' | 'stable'>('all')

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getSortedAndFilteredPrices = () => {
    let filteredPrices = prices

    // Apply trend filter
    if (filterTrend !== 'all') {
      filteredPrices = filteredPrices.filter(price => price.trend === filterTrend)
    }

    // Sort prices
    return filteredPrices.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.crop_name.toLowerCase()
          bValue = b.crop_name.toLowerCase()
          break
        case 'price':
          aValue = a.price_per_kg
          bValue = b.price_per_kg
          break
        case 'trend':
          aValue = a.trend
          bValue = b.trend
          break
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  const getTrendIcon = (trend: MarketPrice['trend']) => {
    switch (trend) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      case 'stable':
        return '➡️'
      default:
        return '➡️'
    }
  }

  const getTrendColor = (trend: MarketPrice['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'stable':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const sortedPrices = getSortedAndFilteredPrices()

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading market prices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Filters and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by trend:</span>
            <select
              value={filterTrend}
              onChange={(e) => setFilterTrend(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Trends</option>
              <option value="up">📈 Rising</option>
              <option value="down">📉 Falling</option>
              <option value="stable">➡️ Stable</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {sortedPrices.length} of {prices.length} listings
            {searchQuery && (
              <span className="ml-2 text-blue-600">
                for "{searchQuery}"
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Crop</span>
                  {sortBy === 'name' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Price/kg</span>
                  {sortBy === 'price' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('trend')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Trend</span>
                  {sortBy === 'trend' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market
              </th>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {sortBy === 'date' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPrices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {searchQuery ? (
                      <>
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium mb-2">No results found</h3>
                        <p>No crops found matching "{searchQuery}"</p>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-lg font-medium mb-2">No market data available</h3>
                        <p>Market prices will appear here when available</p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedPrices.map((price, index) => (
                <MarketPriceRow key={`${price.crop_name}-${price.variety}-${index}`} price={price} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface MarketPriceRowProps {
  price: MarketPrice
}

function MarketPriceRow({ price }: MarketPriceRowProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {price.crop_name}
              </div>
              {price.variety && (
                <div className="text-sm text-gray-500">
                  {price.variety}
                </div>
              )}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(price.price_per_kg)}
          </div>
          <div className="text-xs text-gray-500">
            per kg
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`flex items-center space-x-1 ${getTrendColor(price.trend)}`}>
            <span>{getTrendIcon(price.trend)}</span>
            <span className="text-sm font-medium capitalize">
              {price.trend}
            </span>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {price.market_location}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {formatDate(price.date)}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-green-600 hover:text-green-900 mr-3"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
          <button className="text-blue-600 hover:text-blue-900">
            Contact Seller
          </button>
        </td>
      </tr>
      
      {showDetails && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Quality Grade:</span>
                <span className="ml-2 text-gray-900">A+</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Volume Available:</span>
                <span className="ml-2 text-gray-900">500 kg</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Organic:</span>
                <span className="ml-2 text-gray-900">Yes</span>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="font-medium text-gray-700">Description:</span>
              <p className="mt-1 text-gray-600">
                Fresh, high-quality {price.crop_name.toLowerCase()} 
                {price.variety && ` (${price.variety})`} 
                available for immediate pickup or delivery within 50km radius.
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// Helper functions (moved outside component to avoid re-creation)
function getTrendIcon(trend: MarketPrice['trend']) {
  switch (trend) {
    case 'up':
      return '📈'
    case 'down':
      return '📉'
    case 'stable':
      return '➡️'
    default:
      return '➡️'
  }
}

function getTrendColor(trend: MarketPrice['trend']) {
  switch (trend) {
    case 'up':
      return 'text-green-600'
    case 'down':
      return 'text-red-600'
    case 'stable':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}