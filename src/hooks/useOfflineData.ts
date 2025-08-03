import { useState, useEffect, useCallback } from 'react'
import { ServiceFactory } from '@/lib/services/factory'
import { MockOfflineService } from '@/lib/services/mock/offline.service'

interface UseOfflineDataOptions {
  autoSync?: boolean
  syncInterval?: number
  maxRetries?: number
}

interface OfflineDataState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  queuedActions: number
  syncErrors: string[]
  cacheSize: number
}

export function useOfflineData(options: UseOfflineDataOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 30000, // 30 seconds
    maxRetries = 3
  } = options

  const [state, setState] = useState<OfflineDataState>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    queuedActions: 0,
    syncErrors: [],
    cacheSize: 0
  })

  // Get offline service (mock for now)
  const offlineService = new MockOfflineService()

  // Update state helper
  const updateState = useCallback((updates: Partial<OfflineDataState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Load initial state
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const [lastSyncTime, queuedActions, cacheSize] = await Promise.all([
          offlineService.getLastSyncTime(),
          offlineService.getQueuedActions(),
          offlineService.getCacheSize()
        ])

        updateState({
          isOnline: offlineService.isOnline(),
          lastSyncTime,
          queuedActions: queuedActions.length,
          cacheSize
        })
      } catch (error) {
        console.error('Error loading offline state:', error)
      }
    }

    loadInitialState()
  }, [offlineService, updateState])

  // Monitor network status
  useEffect(() => {
    const unsubscribe = offlineService.onNetworkStatusChange((isOnline) => {
      updateState({ isOnline })
      
      if (isOnline && autoSync) {
        // Trigger sync when coming back online
        syncData()
      }
    })

    return unsubscribe
  }, [offlineService, autoSync, updateState])

  // Auto-sync interval
  useEffect(() => {
    if (!autoSync || !state.isOnline) return

    const interval = setInterval(() => {
      syncData()
    }, syncInterval)

    return () => clearInterval(interval)
  }, [autoSync, state.isOnline, syncInterval])

  // Sync data function
  const syncData = useCallback(async () => {
    if (state.isSyncing || !state.isOnline) return

    updateState({ isSyncing: true, syncErrors: [] })

    try {
      const result = await offlineService.syncData()
      
      const [queuedActions, cacheSize] = await Promise.all([
        offlineService.getQueuedActions(),
        offlineService.getCacheSize()
      ])

      updateState({
        isSyncing: false,
        lastSyncTime: Date.now(),
        queuedActions: queuedActions.length,
        syncErrors: result.errors,
        cacheSize
      })

      return result
    } catch (error) {
      console.error('Sync failed:', error)
      updateState({
        isSyncing: false,
        syncErrors: [`Sync failed: ${error}`]
      })
      throw error
    }
  }, [state.isSyncing, state.isOnline, offlineService, updateState])

  // Store data offline
  const storeData = useCallback(async (key: string, data: any) => {
    try {
      await offlineService.storeData(key as any, data)
      
      // Update cache size
      const cacheSize = await offlineService.getCacheSize()
      updateState({ cacheSize })
    } catch (error) {
      console.error('Error storing offline data:', error)
      throw error
    }
  }, [offlineService, updateState])

  // Get data from offline storage
  const getData = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      return await offlineService.getData<T>(key as any)
    } catch (error) {
      console.error('Error getting offline data:', error)
      return null
    }
  }, [offlineService])

  // Queue an action for later sync
  const queueAction = useCallback(async (
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: string,
    entityId: string,
    data: any
  ) => {
    try {
      await offlineService.queueAction({
        type,
        entity: entity as any,
        entityId,
        data
      })

      // Update queued actions count
      const queuedActions = await offlineService.getQueuedActions()
      updateState({ queuedActions: queuedActions.length })

      // Try to sync immediately if online
      if (state.isOnline && autoSync) {
        setTimeout(() => syncData(), 100)
      }
    } catch (error) {
      console.error('Error queueing action:', error)
      throw error
    }
  }, [offlineService, state.isOnline, autoSync, syncData, updateState])

  // Clear offline data
  const clearData = useCallback(async (key?: string) => {
    try {
      await offlineService.clearData(key as any)
      
      const [queuedActions, cacheSize] = await Promise.all([
        offlineService.getQueuedActions(),
        offlineService.getCacheSize()
      ])

      updateState({
        queuedActions: queuedActions.length,
        cacheSize
      })
    } catch (error) {
      console.error('Error clearing offline data:', error)
      throw error
    }
  }, [offlineService, updateState])

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      await offlineService.clearCache()
      updateState({
        queuedActions: 0,
        cacheSize: 0,
        lastSyncTime: null
      })
    } catch (error) {
      console.error('Error clearing cache:', error)
      throw error
    }
  }, [offlineService, updateState])

  // Get sync status
  const getSyncStatus = useCallback(() => {
    return {
      isOnline: state.isOnline,
      isSyncing: state.isSyncing,
      hasQueuedActions: state.queuedActions > 0,
      hasErrors: state.syncErrors.length > 0,
      lastSyncTime: state.lastSyncTime,
      timeSinceLastSync: state.lastSyncTime ? Date.now() - state.lastSyncTime : null
    }
  }, [state])

  // Format cache size for display
  const formatCacheSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return {
    // State
    ...state,
    
    // Actions
    syncData,
    storeData,
    getData,
    queueAction,
    clearData,
    clearCache,
    
    // Utilities
    getSyncStatus,
    formatCacheSize: () => formatCacheSize(state.cacheSize),
    
    // Service instance (for advanced usage)
    offlineService
  }
}

// Hook for offline-aware data fetching
export function useOfflineQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    staleTime?: number
    refetchOnReconnect?: boolean
    fallbackData?: T
  } = {}
) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnReconnect = true,
    fallbackData
  } = options

  const [data, setData] = useState<T | null>(fallbackData || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number | null>(null)

  const { isOnline, getData: getOfflineData, storeData } = useOfflineData()

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // Check if we have cached data
      const cachedData = await getOfflineData<{ data: T; timestamp: number }>(key)
      
      if (cachedData && !forceRefresh) {
        const isStale = Date.now() - cachedData.timestamp > staleTime
        
        if (!isStale || !isOnline) {
          setData(cachedData.data)
          setLastFetch(cachedData.timestamp)
          setLoading(false)
          return cachedData.data
        }
      }

      // Fetch fresh data if online
      if (isOnline) {
        const freshData = await fetcher()
        const timestamp = Date.now()
        
        // Cache the fresh data
        await storeData(key, { data: freshData, timestamp })
        
        setData(freshData)
        setLastFetch(timestamp)
        setLoading(false)
        return freshData
      } else {
        // Use cached data if offline
        if (cachedData) {
          setData(cachedData.data)
          setLastFetch(cachedData.timestamp)
        } else if (fallbackData) {
          setData(fallbackData)
        } else {
          throw new Error('No cached data available and device is offline')
        }
        setLoading(false)
        return data
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      
      // Try to use cached data as fallback
      const cachedData = await getOfflineData<{ data: T; timestamp: number }>(key)
      if (cachedData) {
        setData(cachedData.data)
        setLastFetch(cachedData.timestamp)
      }
      
      throw err
    }
  }, [key, fetcher, staleTime, isOnline, getOfflineData, storeData, fallbackData, data])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refetch when coming back online
  useEffect(() => {
    if (isOnline && refetchOnReconnect && lastFetch) {
      const isStale = Date.now() - lastFetch > staleTime
      if (isStale) {
        fetchData(true)
      }
    }
  }, [isOnline, refetchOnReconnect, lastFetch, staleTime, fetchData])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    isStale: lastFetch ? Date.now() - lastFetch > staleTime : true,
    lastFetch
  }
}