'use client'

import React, { Suspense, lazy, ComponentType } from 'react'
import { usePerformance } from '@/hooks/usePerformance'

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  minDelay?: number
  className?: string
}

// Generic lazy loading wrapper
export function LazyWrapper({ 
  children, 
  fallback = <LoadingSpinner />, 
  minDelay = 0,
  className = '' 
}: LazyWrapperProps) {
  const { config } = usePerformance()

  // Skip lazy loading if disabled
  if (!config.enableLazyLoading) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  )
}

// HOC for lazy loading components
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(async () => {
    // Add minimum delay to prevent flash
    const [component] = await Promise.all([
      Promise.resolve({ default: Component }),
      new Promise(resolve => setTimeout(resolve, 100))
    ])
    return component
  })

  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Intersection Observer based lazy loading
interface IntersectionLazyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
  once?: boolean
}

export function IntersectionLazy({
  children,
  fallback = <LoadingPlaceholder />,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  once = true
}: IntersectionLazyProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) {
              setHasLoaded(true)
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      { threshold, rootMargin }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return (
    <div ref={elementRef} className={className}>
      {(isVisible || hasLoaded) ? children : fallback}
    </div>
  )
}

// Code splitting utilities
export const LazyDashboard = lazy(() => import('../dashboard/FarmDashboard'))
export const LazyPlotManager = lazy(() => import('../plots/PlotManager'))
export const LazyCropTracker = lazy(() => import('../crops/CropTracker'))
export const LazyMarketplace = lazy(() => import('../marketplace/MarketplaceDashboard'))
export const LazyWeatherDashboard = lazy(() => import('../weather/WeatherDashboard'))
export const LazyGamification = lazy(() => import('../gamification/GamificationDashboard'))
export const LazyClanDashboard = lazy(() => import('../clans/ClanDashboard'))
export const LazyNotificationCenter = lazy(() => import('../notifications/NotificationCenter'))

// Loading components
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-green-600 ${sizeClasses[size]}`} />
    </div>
  )
}

export function LoadingPlaceholder({ height = 200, className = '' }: { height?: number, className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} style={{ height }}>
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export function LoadingSkeleton({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

// Progressive loading for images
interface ProgressiveImageProps {
  src: string
  placeholder: string
  alt: string
  className?: string
  width?: number
  height?: number
}

export function ProgressiveImage({
  src,
  placeholder,
  alt,
  className = '',
  width,
  height
}: ProgressiveImageProps) {
  const [imageSrc, setImageSrc] = React.useState(placeholder)
  const [imageRef, setImageRef] = React.useState<HTMLImageElement>()

  React.useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      setImageSrc(src)
    }
    setImageRef(img)
  }, [src])

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${imageSrc === src ? 'opacity-100' : 'opacity-75'} ${className}`}
    />
  )
}

// Bundle splitting helper
export function createLazyRoute(importFn: () => Promise<{ default: ComponentType<any> }>) {
  return lazy(importFn)
}

// Performance-aware component loader
export function useConditionalLazyLoading(shouldLazyLoad: boolean) {
  const { config } = usePerformance()
  
  return shouldLazyLoad && config.enableLazyLoading
}

// Preload utility for critical components
export function preloadComponent(importFn: () => Promise<{ default: ComponentType<any> }>) {
  // Preload after a short delay to not block initial render
  setTimeout(() => {
    importFn().catch(console.error)
  }, 100)
}

// Route-based code splitting
export const routes = {
  Dashboard: createLazyRoute(() => import('../dashboard/FarmDashboard')),
  Plots: createLazyRoute(() => import('../plots/PlotManager')),
  Crops: createLazyRoute(() => import('../crops/CropTracker')),
  Weather: createLazyRoute(() => import('../weather/WeatherDashboard')),
  Marketplace: createLazyRoute(() => import('../marketplace/MarketplaceDashboard')),
  Gamification: createLazyRoute(() => import('../gamification/GamificationDashboard')),
  Clans: createLazyRoute(() => import('../clans/ClanDashboard')),
  Notifications: createLazyRoute(() => import('../notifications/NotificationCenter'))
}

// Preload critical routes
if (typeof window !== 'undefined') {
  // Preload dashboard after initial load
  setTimeout(() => {
    preloadComponent(() => import('../dashboard/FarmDashboard'))
  }, 2000)
}