import { useState, useEffect, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  loadTime: number
  renderTime: number
  isLowEndDevice: boolean
  networkSpeed: 'slow' | 'fast' | 'unknown'
}

interface PerformanceConfig {
  enableLazyLoading: boolean
  reduceAnimations: boolean
  optimizeImages: boolean
  limitConcurrentRequests: boolean
  useVirtualization: boolean
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    isLowEndDevice: false,
    networkSpeed: 'unknown'
  })

  const [config, setConfig] = useState<PerformanceConfig>({
    enableLazyLoading: true,
    reduceAnimations: false,
    optimizeImages: true,
    limitConcurrentRequests: false,
    useVirtualization: false
  })

  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsInterval = useRef<NodeJS.Timeout>()
  const memoryInterval = useRef<NodeJS.Timeout>()

  // Detect device capabilities
  const detectDeviceCapabilities = useCallback(() => {
    const isLowEnd = 
      // Check memory (if available)
      ('memory' in navigator && (navigator as any).memory?.jsHeapSizeLimit < 1000000000) ||
      // Check hardware concurrency
      navigator.hardwareConcurrency <= 2 ||
      // Check user agent for low-end indicators
      /Android.*[2-4]\.|iPhone.*[3-6]_/.test(navigator.userAgent)

    const connection = (navigator as any).connection
    const networkSpeed = connection ? 
      (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' ? 'slow' : 'fast') :
      'unknown'

    return { isLowEnd, networkSpeed }
  }, [])

  // Measure FPS
  const measureFPS = useCallback(() => {
    const now = performance.now()
    frameCount.current++

    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current))
      setMetrics(prev => ({ ...prev, fps }))
      frameCount.current = 0
      lastTime.current = now
    }

    requestAnimationFrame(measureFPS)
  }, [])

  // Measure memory usage
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      setMetrics(prev => ({ ...prev, memoryUsage }))
    }
  }, [])

  // Measure render time
  const measureRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
      
      setMetrics(prev => ({ ...prev, renderTime }))
    }
  }, [])

  // Auto-adjust performance settings
  const autoAdjustSettings = useCallback(() => {
    const { isLowEnd, networkSpeed } = detectDeviceCapabilities()
    
    setMetrics(prev => ({ ...prev, isLowEndDevice: isLowEnd, networkSpeed }))
    
    if (isLowEnd || metrics.fps < 30 || metrics.memoryUsage > 100) {
      setConfig({
        enableLazyLoading: true,
        reduceAnimations: true,
        optimizeImages: true,
        limitConcurrentRequests: true,
        useVirtualization: true
      })
    } else if (metrics.fps > 50 && metrics.memoryUsage < 50) {
      setConfig({
        enableLazyLoading: true,
        reduceAnimations: false,
        optimizeImages: false,
        limitConcurrentRequests: false,
        useVirtualization: false
      })
    }
  }, [metrics.fps, metrics.memoryUsage])

  // Initialize performance monitoring
  useEffect(() => {
    const { isLowEnd, networkSpeed } = detectDeviceCapabilities()
    setMetrics(prev => ({ ...prev, isLowEndDevice: isLowEnd, networkSpeed }))

    // Start FPS monitoring
    requestAnimationFrame(measureFPS)

    // Start memory monitoring
    memoryInterval.current = setInterval(measureMemory, 5000)

    // Auto-adjust settings periodically
    const adjustInterval = setInterval(autoAdjustSettings, 10000)

    return () => {
      if (memoryInterval.current) clearInterval(memoryInterval.current)
      clearInterval(adjustInterval)
    }
  }, [measureFPS, measureMemory, autoAdjustSettings])

  // Performance optimization utilities
  const optimizations = {
    // Debounce function for expensive operations
    debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => {
      let timeout: NodeJS.Timeout
      return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
      }
    },

    // Throttle function for frequent events
    throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => {
      let inThrottle: boolean
      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          func(...args)
          inThrottle = true
          setTimeout(() => inThrottle = false, limit)
        }
      }
    },

    // Lazy load images
    lazyLoadImage: (src: string, placeholder?: string) => {
      if (!config.enableLazyLoading) return src
      
      const img = new Image()
      img.src = src
      return placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4='
    },

    // Optimize images based on device capabilities
    optimizeImageUrl: (url: string, width?: number, height?: number) => {
      if (!config.optimizeImages) return url
      
      const quality = metrics.isLowEndDevice ? 60 : 80
      const format = 'webp' // Modern format for better compression
      
      // This would integrate with an image optimization service
      // For now, return the original URL
      return url
    },

    // Virtual scrolling for large lists
    shouldUseVirtualization: (itemCount: number) => {
      return config.useVirtualization && itemCount > 100
    },

    // Reduce animations on low-end devices
    getAnimationDuration: (defaultDuration: number) => {
      return config.reduceAnimations ? Math.min(defaultDuration * 0.5, 150) : defaultDuration
    },

    // Limit concurrent API requests
    createRequestQueue: () => {
      const maxConcurrent = config.limitConcurrentRequests ? 2 : 6
      let activeRequests = 0
      const queue: (() => Promise<any>)[] = []

      const processQueue = async () => {
        if (activeRequests >= maxConcurrent || queue.length === 0) return

        const request = queue.shift()
        if (!request) return

        activeRequests++
        try {
          await request()
        } finally {
          activeRequests--
          processQueue()
        }
      }

      return {
        add: (request: () => Promise<any>) => {
          queue.push(request)
          processQueue()
        }
      }
    }
  }

  return {
    metrics,
    config,
    measureRenderTime,
    optimizations,
    updateConfig: setConfig
  }
}

// Hook for component-level performance monitoring
export function useComponentPerformance(componentName: string) {
  const { measureRenderTime } = usePerformance()
  const renderStart = useRef<number>()

  useEffect(() => {
    renderStart.current = performance.now()
  })

  useEffect(() => {
    if (renderStart.current) {
      const renderTime = performance.now() - renderStart.current
      if (renderTime > 16) {
        console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms`)
      }
    }
  })

  return { measureRenderTime }
}

// Hook for memory-efficient data loading
export function useMemoryEfficientData<T>(
  dataLoader: () => Promise<T[]>,
  pageSize: number = 20
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const { config } = usePerformance()

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const newData = await dataLoader()
      const startIndex = page * pageSize
      const endIndex = startIndex + pageSize
      const pageData = newData.slice(startIndex, endIndex)

      if (pageData.length === 0) {
        setHasMore(false)
      } else {
        setData(prev => [...prev, ...pageData])
        setPage(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [dataLoader, pageSize, page, loading, hasMore])

  const reset = useCallback(() => {
    setData([])
    setPage(0)
    setHasMore(true)
  }, [])

  // Auto-adjust page size based on device capabilities
  const effectivePageSize = config.limitConcurrentRequests ? 
    Math.min(pageSize, 10) : pageSize

  return {
    data,
    loading,
    hasMore,
    loadMore,
    reset,
    pageSize: effectivePageSize
  }
}