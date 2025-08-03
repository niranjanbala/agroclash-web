'use client'

import React, { useState, useEffect } from 'react'
import { ApiConfigManager, ApiConfig } from '@/lib/config/api.config'
import { ServiceFactory } from '@/lib/services/factory'
import { ApiMonitor, ServiceHealth, ApiUsage } from '@/lib/services/monitoring/api-monitor'

export function ApiConfigDashboard() {
  const [config, setConfig] = useState<ApiConfig | null>(null)
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([])
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'health' | 'usage' | 'logs'>('config')

  const apiConfig = ApiConfigManager.getInstance()
  const apiMonitor = ApiMonitor.getInstance()

  useEffect(() => {
    loadDashboardData()
    
    // Set up periodic refresh
    const interval = setInterval(loadDashboardData, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [currentConfig, health, usage] = await Promise.all([
        Promise.resolve(apiConfig.getConfig()),
        Promise.resolve(apiMonitor.getServiceHealth()),
        Promise.resolve(apiMonitor.getUsageStats())
      ])

      setConfig(currentConfig)
      setServiceHealth(health)
      setApiUsage(usage)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigUpdate = async (updates: Partial<ApiConfig>) => {
    if (!config) return

    try {
      setSaving(true)
      apiConfig.updateConfig(updates)
      
      // Validate the new configuration
      const validation = apiConfig.validate()
      if (!validation.valid) {
        alert(`Configuration validation failed:\n${validation.errors.join('\n')}`)
        return
      }

      // Reset services to apply new configuration
      ServiceFactory.resetServices()
      
      // Reload dashboard data
      await loadDashboardData()
      
      alert('Configuration updated successfully!')
    } catch (error) {
      console.error('Error updating configuration:', error)
      alert('Failed to update configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleServiceProviderChange = (service: keyof ApiConfig['services'], provider: string) => {
    if (!config) return

    const updatedConfig = {
      ...config,
      services: {
        ...config.services,
        [service]: {
          ...config.services[service],
          provider
        }
      }
    }

    setConfig(updatedConfig)
  }

  const handleServiceConfigChange = (
    service: keyof ApiConfig['services'], 
    configKey: string, 
    value: string
  ) => {
    if (!config) return

    const updatedConfig = {
      ...config,
      services: {
        ...config.services,
        [service]: {
          ...config.services[service],
          config: {
            ...config.services[service].config,
            [configKey]: value
          }
        }
      }
    }

    setConfig(updatedConfig)
  }

  const testServiceConnection = async (service: keyof ApiConfig['services']) => {
    try {
      let serviceInstance: any

      switch (service) {
        case 'weather':
          serviceInstance = ServiceFactory.getWeatherService()
          break
        case 'market':
          serviceInstance = ServiceFactory.getMarketService()
          break
        case 'notifications':
          serviceInstance = ServiceFactory.getNotificationService()
          break
        default:
          alert('Service testing not implemented')
          return
      }

      if (serviceInstance && typeof serviceInstance.healthCheck === 'function') {
        const isHealthy = await serviceInstance.healthCheck()
        alert(isHealthy ? 'Service connection successful!' : 'Service connection failed!')
      } else {
        alert('Health check not available for this service')
      }
    } catch (error) {
      console.error('Service test error:', error)
      alert(`Service test failed: ${error.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'unhealthy': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getUsageColor = (usage: ApiUsage) => {
    const percentage = (usage.calls / usage.limit) * 100
    if (percentage > 90) return 'text-red-600'
    if (percentage > 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Loading API configuration...</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">API Configuration Dashboard</h1>
        <p className="text-gray-600">Manage API integrations and monitor service health</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'config', label: 'Configuration' },
            { key: 'health', label: 'Service Health' },
            { key: 'usage', label: 'API Usage' },
            { key: 'logs', label: 'Monitoring' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Global Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Global Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Mode
                </label>
                <select
                  value={config.mode}
                  onChange={(e) => handleConfigUpdate({ mode: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="mock">Mock</option>
                  <option value="real">Real</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fallback Strategy
                </label>
                <select
                  value={config.fallback.strategy}
                  onChange={(e) => handleConfigUpdate({
                    fallback: { ...config.fallback, strategy: e.target.value as any }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="mock">Mock</option>
                  <option value="cache">Cache</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="fallback-enabled"
                  checked={config.fallback.enabled}
                  onChange={(e) => handleConfigUpdate({
                    fallback: { ...config.fallback, enabled: e.target.checked }
                  })}
                  className="mr-2"
                />
                <label htmlFor="fallback-enabled" className="text-sm font-medium text-gray-700">
                  Enable Fallback
                </label>
              </div>
            </div>
          </div>

          {/* Service Configurations */}
          {Object.entries(config.services).map(([serviceName, serviceConfig]) => (
            <div key={serviceName} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">{serviceName} Service</h3>
                <button
                  onClick={() => testServiceConnection(serviceName as any)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Test Connection
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider
                  </label>
                  <select
                    value={serviceConfig.provider}
                    onChange={(e) => handleServiceProviderChange(serviceName as any, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="mock">Mock</option>
                    {serviceName === 'weather' && <option value="openweathermap">OpenWeatherMap</option>}
                    {serviceName === 'market' && (
                      <>
                        <option value="coinapi">CoinAPI</option>
                        <option value="custom">Custom</option>
                      </>
                    )}
                    {serviceName === 'auth' && (
                      <>
                        <option value="firebase">Firebase</option>
                        <option value="supabase">Supabase</option>
                        <option value="custom">Custom</option>
                      </>
                    )}
                    {serviceName === 'notifications' && (
                      <>
                        <option value="firebase">Firebase</option>
                        <option value="onesignal">OneSignal</option>
                        <option value="pusher">Pusher</option>
                      </>
                    )}
                    {serviceName === 'storage' && (
                      <>
                        <option value="firebase">Firebase</option>
                        <option value="supabase">Supabase</option>
                        <option value="aws-s3">AWS S3</option>
                      </>
                    )}
                  </select>
                </div>

                {serviceConfig.provider !== 'mock' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={serviceConfig.config.apiKey || ''}
                      onChange={(e) => handleServiceConfigChange(serviceName as any, 'apiKey', e.target.value)}
                      placeholder="Enter API key"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                )}
              </div>

              {serviceConfig.provider !== 'mock' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base URL
                    </label>
                    <input
                      type="url"
                      value={serviceConfig.config.baseUrl || ''}
                      onChange={(e) => handleServiceConfigChange(serviceName as any, 'baseUrl', e.target.value)}
                      placeholder="https://api.example.com"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate Limit (calls/hour)
                    </label>
                    <input
                      type="number"
                      value={serviceConfig.config.rateLimit || ''}
                      onChange={(e) => handleServiceConfigChange(serviceName as any, 'rateLimit', e.target.value)}
                      placeholder="1000"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={() => handleConfigUpdate(config)}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* Service Health Tab */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceHealth.map(health => (
              <div key={health.service} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{health.service}</h3>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(health.status)}`}>
                    {health.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time:</span>
                    <span className="text-sm font-medium">{health.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime:</span>
                    <span className="text-sm font-medium">{health.uptime.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Error Rate:</span>
                    <span className="text-sm font-medium">{health.errorRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Check:</span>
                    <span className="text-sm font-medium">
                      {new Date(health.lastCheck).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {health.details && (
                  <div className="mt-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    {health.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Usage Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiUsage.map(usage => (
              <div key={usage.service} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold capitalize mb-4">{usage.service}</h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Calls Made:</span>
                    <span className={`text-sm font-medium ${getUsageColor(usage)}`}>
                      {usage.calls.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Limit:</span>
                    <span className="text-sm font-medium">{usage.limit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining:</span>
                    <span className="text-sm font-medium">{usage.remaining.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reset Time:</span>
                    <span className="text-sm font-medium">
                      {new Date(usage.resetTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Usage Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Usage</span>
                    <span>{((usage.calls / usage.limit) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (usage.calls / usage.limit) > 0.9 ? 'bg-red-600' :
                        (usage.calls / usage.limit) > 0.7 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min((usage.calls / usage.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">System Overview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const overview = apiMonitor.getSystemOverview()
                return (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{overview.totalCalls}</div>
                      <div className="text-sm text-gray-600">Total Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{overview.errorRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{overview.averageResponseTime.toFixed(0)}ms</div>
                      <div className="text-sm text-gray-600">Avg Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{overview.healthyServices}/{overview.totalServices}</div>
                      <div className="text-sm text-gray-600">Healthy Services</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent API Calls</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiMonitor.getMetrics(undefined, 60 * 60 * 1000).slice(0, 10).map((metric, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {metric.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metric.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          metric.status < 400 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {metric.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metric.responseTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}