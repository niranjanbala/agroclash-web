'use client'

import React, { useState } from 'react'
import { usePerformance } from '@/hooks/usePerformance'

interface PerformanceMonitorProps {
  className?: string
  showInProduction?: boolean
}

export function PerformanceMonitor({ className = '', showInProduction = false }: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { metrics, config, updateConfig } = usePerformance()

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null
  }

  const getPerformanceStatus = () => {
    if (metrics.fps < 30 || metrics.memoryUsage > 150) return 'poor'
    if (metrics.fps < 45 || metrics.memoryUsage > 100) return 'fair'
    return 'good'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'poor': return 'bg-red-500'
      case 'fair': return 'bg-yellow-500'
      case 'good': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const status = getPerformanceStatus()

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Performance Indicator */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full ${getStatusColor(status)} text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center`}
        title={`Performance: ${status} (${metrics.fps} FPS)`}
      >
        <span className="text-sm font-bold">⚡</span>
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsVisible(false)}
          />
          
          {/* Panel */}
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">FPS</span>
                    <span className={`font-medium ${metrics.fps < 30 ? 'text-red-600' : metrics.fps < 45 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {metrics.fps}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${metrics.fps < 30 ? 'bg-red-500' : metrics.fps < 45 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(metrics.fps / 60 * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Memory Usage</span>
                    <span className={`font-medium ${metrics.memoryUsage > 150 ? 'text-red-600' : metrics.memoryUsage > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {metrics.memoryUsage} MB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${metrics.memoryUsage > 150 ? 'bg-red-500' : metrics.memoryUsage > 100 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(metrics.memoryUsage / 200 * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Device:</span>
                    <span className={`ml-1 font-medium ${metrics.isLowEndDevice ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.isLowEndDevice ? 'Low-end' : 'High-end'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Network:</span>
                    <span className={`ml-1 font-medium ${metrics.networkSpeed === 'slow' ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.networkSpeed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Optimization Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Lazy Loading</span>
                    <input
                      type="checkbox"
                      checked={config.enableLazyLoading}
                      onChange={(e) => updateConfig(prev => ({ ...prev, enableLazyLoading: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Reduce Animations</span>
                    <input
                      type="checkbox"
                      checked={config.reduceAnimations}
                      onChange={(e) => updateConfig(prev => ({ ...prev, reduceAnimations: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Optimize Images</span>
                    <input
                      type="checkbox"
                      checked={config.optimizeImages}
                      onChange={(e) => updateConfig(prev => ({ ...prev, optimizeImages: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Limit Requests</span>
                    <input
                      type="checkbox"
                      checked={config.limitConcurrentRequests}
                      onChange={(e) => updateConfig(prev => ({ ...prev, limitConcurrentRequests: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Virtualization</span>
                    <input
                      type="checkbox"
                      checked={config.useVirtualization}
                      onChange={(e) => updateConfig(prev => ({ ...prev, useVirtualization: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                </div>
              </div>

              {/* Performance Tips */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Performance Tips</h5>
                <ul className="text-xs text-blue-800 space-y-1">
                  {metrics.fps < 30 && <li>• Low FPS detected - enable animation reduction</li>}
                  {metrics.memoryUsage > 100 && <li>• High memory usage - enable virtualization</li>}
                  {metrics.isLowEndDevice && <li>• Low-end device detected - enable all optimizations</li>}
                  {metrics.networkSpeed === 'slow' && <li>• Slow network - enable image optimization</li>}
                  {status === 'good' && <li>• Performance is good - all systems optimal</li>}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Component for displaying performance warnings
export function PerformanceWarning() {
  const { metrics } = usePerformance()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || (!metrics.isLowEndDevice && metrics.fps > 30)) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-yellow-600 text-xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Performance Notice
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            {metrics.isLowEndDevice 
              ? 'Low-end device detected. Some features may be automatically optimized for better performance.'
              : 'Low frame rate detected. Consider enabling performance optimizations in settings.'
            }
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-400 hover:text-yellow-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}