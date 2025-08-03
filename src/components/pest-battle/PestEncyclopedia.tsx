'use client'

import React, { useState } from 'react'

interface PestInfo {
  id: string
  name: string
  type: 'insect' | 'disease' | 'weed' | 'rodent'
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  health: number
  damage: number
  weakness: 'water' | 'fire' | 'poison' | 'physical'
  xpReward: number
  description: string
  realWorldInfo: string
  prevention: string[]
  treatment: string[]
  affectedCrops: string[]
}

interface PestEncyclopediaProps {
  className?: string
}

export function PestEncyclopedia({ className = '' }: PestEncyclopediaProps) {
  const [selectedPest, setSelectedPest] = useState<PestInfo | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'insect' | 'disease' | 'weed' | 'rodent'>('all')
  const [filterRarity, setFilterRarity] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')

  const pestDatabase: PestInfo[] = [
    {
      id: 'aphids',
      name: 'Aphids',
      type: 'insect',
      icon: '🐛',
      rarity: 'common',
      health: 60,
      damage: 8,
      weakness: 'water',
      xpReward: 15,
      description: 'Small green insects that suck plant juices',
      realWorldInfo: 'Aphids are small, soft-bodied insects that feed on plant sap. They reproduce rapidly and can quickly infest crops, causing stunted growth and yellowing leaves.',
      prevention: [
        'Encourage beneficial insects like ladybugs',
        'Use reflective mulch to confuse aphids',
        'Plant companion crops like marigolds',
        'Regular inspection of plants'
      ],
      treatment: [
        'Spray with water to dislodge aphids',
        'Apply insecticidal soap',
        'Use neem oil spray',
        'Release ladybugs or lacewings'
      ],
      affectedCrops: ['Tomatoes', 'Peppers', 'Lettuce', 'Roses', 'Beans']
    },
    {
      id: 'caterpillars',
      name: 'Caterpillars',
      type: 'insect',
      icon: '🐛',
      rarity: 'common',
      health: 80,
      damage: 12,
      weakness: 'poison',
      xpReward: 20,
      description: 'Leaf-eating larvae that can devastate crops',
      realWorldInfo: 'Caterpillars are the larval stage of moths and butterflies. They have voracious appetites and can quickly defoliate plants if left unchecked.',
      prevention: [
        'Use row covers during egg-laying season',
        'Encourage birds and beneficial wasps',
        'Regular monitoring for eggs',
        'Crop rotation to break life cycles'
      ],
      treatment: [
        'Hand-picking for small infestations',
        'Bacillus thuringiensis (Bt) spray',
        'Spinosad-based insecticides',
        'Pheromone traps for adults'
      ],
      affectedCrops: ['Cabbage', 'Broccoli', 'Corn', 'Tomatoes', 'Peppers']
    },
    {
      id: 'fungal-blight',
      name: 'Fungal Blight',
      type: 'disease',
      icon: '🍄',
      rarity: 'rare',
      health: 100,
      damage: 15,
      weakness: 'fire',
      xpReward: 30,
      description: 'Fungal infection that spreads quickly',
      realWorldInfo: 'Fungal blights are caused by various fungi that attack plant tissues, causing dark spots, wilting, and eventual plant death. They thrive in humid conditions.',
      prevention: [
        'Ensure good air circulation',
        'Avoid overhead watering',
        'Use disease-resistant varieties',
        'Practice crop rotation'
      ],
      treatment: [
        'Remove infected plant material',
        'Apply copper-based fungicides',
        'Use biological fungicides',
        'Improve drainage and air flow'
      ],
      affectedCrops: ['Tomatoes', 'Potatoes', 'Beans', 'Cucumbers', 'Grapes']
    },
    {
      id: 'weeds',
      name: 'Invasive Weeds',
      type: 'weed',
      icon: '🌿',
      rarity: 'common',
      health: 70,
      damage: 10,
      weakness: 'fire',
      xpReward: 18,
      description: 'Invasive plants competing for nutrients',
      realWorldInfo: 'Weeds compete with crops for water, nutrients, and sunlight. They can also harbor pests and diseases that affect nearby crops.',
      prevention: [
        'Use mulch to suppress weed growth',
        'Plant cover crops in off-season',
        'Regular cultivation and hoeing',
        'Maintain healthy, dense crop stands'
      ],
      treatment: [
        'Hand weeding for small areas',
        'Mechanical cultivation',
        'Selective herbicides',
        'Flame weeding for organic systems'
      ],
      affectedCrops: ['All crops', 'Especially young seedlings']
    },
    {
      id: 'field-mice',
      name: 'Field Mice',
      type: 'rodent',
      icon: '🐭',
      rarity: 'rare',
      health: 90,
      damage: 14,
      weakness: 'physical',
      xpReward: 25,
      description: 'Small rodents that eat seeds and roots',
      realWorldInfo: 'Field mice can cause significant damage by eating seeds, seedlings, and root vegetables. They are most active during cooler months.',
      prevention: [
        'Remove brush and debris near fields',
        'Use hardware cloth around vulnerable plants',
        'Encourage natural predators like owls',
        'Store seeds in rodent-proof containers'
      ],
      treatment: [
        'Live trapping and relocation',
        'Snap traps for severe infestations',
        'Rodenticides as last resort',
        'Habitat modification to reduce shelter'
      ],
      affectedCrops: ['Corn', 'Sunflowers', 'Root vegetables', 'Fruit trees']
    },
    {
      id: 'locust-swarm',
      name: 'Locust Swarm',
      type: 'insect',
      icon: '🦗',
      rarity: 'epic',
      health: 150,
      damage: 25,
      weakness: 'poison',
      xpReward: 50,
      description: 'Devastating swarm of locusts',
      realWorldInfo: 'Locust swarms are one of the most destructive agricultural pests, capable of consuming their own body weight in vegetation daily and traveling vast distances.',
      prevention: [
        'Early detection and monitoring systems',
        'Habitat management to prevent breeding',
        'Regional coordination for control efforts',
        'Barrier crops to protect valuable fields'
      ],
      treatment: [
        'Aerial spraying of approved insecticides',
        'Ground-based ULV applications',
        'Biological control agents',
        'Coordinated regional response'
      ],
      affectedCrops: ['All crops', 'Especially grains and vegetables']
    },
    {
      id: 'crop-destroyer',
      name: 'Crop Destroyer',
      type: 'disease',
      icon: '☠️',
      rarity: 'legendary',
      health: 200,
      damage: 30,
      weakness: 'fire',
      xpReward: 100,
      description: 'Legendary plant disease that destroys everything',
      realWorldInfo: 'This represents the most severe plant diseases like late blight or bacterial wilt that can destroy entire crops and spread rapidly under favorable conditions.',
      prevention: [
        'Use certified disease-free seeds',
        'Implement strict quarantine measures',
        'Practice excellent field sanitation',
        'Monitor weather conditions closely'
      ],
      treatment: [
        'Immediate removal and destruction of infected plants',
        'Application of systemic fungicides',
        'Soil sterilization in severe cases',
        'Professional consultation required'
      ],
      affectedCrops: ['All susceptible crops', 'Can spread between species']
    }
  ]

  const getFilteredPests = () => {
    return pestDatabase.filter(pest => {
      const typeMatch = filterType === 'all' || pest.type === filterType
      const rarityMatch = filterRarity === 'all' || pest.rarity === filterRarity
      return typeMatch && rarityMatch
    })
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insect': return 'bg-green-100 text-green-800'
      case 'disease': return 'bg-red-100 text-red-800'
      case 'weed': return 'bg-yellow-100 text-yellow-800'
      case 'rodent': return 'bg-brown-100 text-brown-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWeaknessIcon = (weakness: string) => {
    switch (weakness) {
      case 'water': return '💧'
      case 'fire': return '🔥'
      case 'poison': return '💨'
      case 'physical': return '✋'
      default: return '❓'
    }
  }

  const filteredPests = getFilteredPests()

  if (selectedPest) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Back Button */}
        <button
          onClick={() => setSelectedPest(null)}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
        >
          <span>←</span>
          <span>Back to Encyclopedia</span>
        </button>

        {/* Pest Detail */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-4xl">{selectedPest.icon}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{selectedPest.name}</h1>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedPest.type)} bg-opacity-80`}>
                      {selectedPest.type.charAt(0).toUpperCase() + selectedPest.type.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(selectedPest.rarity)} bg-opacity-80`}>
                      {selectedPest.rarity.charAt(0).toUpperCase() + selectedPest.rarity.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm opacity-90">XP Reward</div>
                <div className="text-2xl font-bold">+{selectedPest.xpReward}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Battle Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{selectedPest.health}</div>
                <div className="text-sm text-gray-600">Health</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{selectedPest.damage}</div>
                <div className="text-sm text-gray-600">Damage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{getWeaknessIcon(selectedPest.weakness)}</div>
                <div className="text-sm text-gray-600">Weakness: {selectedPest.weakness}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">+{selectedPest.xpReward}</div>
                <div className="text-sm text-gray-600">XP Reward</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 mb-4">{selectedPest.description}</p>
            <p className="text-gray-600 text-sm">{selectedPest.realWorldInfo}</p>
          </div>

          {/* Affected Crops */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Affected Crops</h3>
            <div className="flex flex-wrap gap-2">
              {selectedPest.affectedCrops.map(crop => (
                <span key={crop} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {crop}
                </span>
              ))}
            </div>
          </div>

          {/* Prevention */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🛡️ Prevention Methods</h3>
            <ul className="space-y-2">
              {selectedPest.prevention.map((method, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-gray-700">{method}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Treatment */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">⚕️ Treatment Options</h3>
            <ul className="space-y-2">
              {selectedPest.treatment.map((method, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span className="text-gray-700">{method}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pest Encyclopedia</h2>
        <p className="text-gray-600">
          Learn about different pests and diseases that threaten your crops
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Types</option>
                <option value="insect">Insects</option>
                <option value="disease">Diseases</option>
                <option value="weed">Weeds</option>
                <option value="rodent">Rodents</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Rarity:</span>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredPests.length} of {pestDatabase.length} pests
          </div>
        </div>
      </div>

      {/* Pest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPests.map(pest => (
          <div
            key={pest.id}
            onClick={() => setSelectedPest(pest)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{pest.icon}</span>
                </div>
                <div className="flex space-x-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(pest.type)}`}>
                    {pest.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(pest.rarity)}`}>
                    {pest.rarity}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{pest.name}</h3>
              <p className="text-sm text-gray-600">{pest.description}</p>
            </div>

            {/* Card Stats */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-semibold text-red-600">{pest.health}</div>
                  <div className="text-xs text-gray-600">Health</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">{pest.damage}</div>
                  <div className="text-xs text-gray-600">Damage</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">+{pest.xpReward}</div>
                  <div className="text-xs text-gray-600">XP</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Weakness:</span>
                  <div className="flex items-center space-x-1">
                    <span>{getWeaknessIcon(pest.weakness)}</span>
                    <span className="font-medium text-gray-900">{pest.weakness}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPests.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pests found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more pests.</p>
        </div>
      )}
    </div>
  )
}