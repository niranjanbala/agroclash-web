'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * itemHeight
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

  const visibleItems = items.slice(startIndex, endIndex + 1)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Hook for infinite scrolling with virtual list
export function useVirtualInfiniteScroll<T>(
  loadMore: () => Promise<T[]>,
  itemHeight: number,
  containerHeight: number
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const newItems = await loadMore()
      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems(prev => [...prev, ...newItems])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [loadMore, loading, hasMore])

  // Load initial items
  useEffect(() => {
    if (items.length === 0) {
      loadMoreItems()
    }
  }, [items.length, loadMoreItems])

  const handleScroll = useCallback((scrollTop: number) => {
    const totalHeight = items.length * itemHeight
    const scrollPercentage = (scrollTop + containerHeight) / totalHeight

    // Load more when 80% scrolled
    if (scrollPercentage > 0.8 && hasMore && !loading) {
      loadMoreItems()
    }
  }, [items.length, itemHeight, containerHeight, hasMore, loading, loadMoreItems])

  return {
    items,
    loading,
    hasMore,
    error,
    loadMoreItems,
    handleScroll
  }
}

// Optimized list item component with memoization
export const VirtualListItem = React.memo<{
  children: React.ReactNode
  className?: string
}>(({ children, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  )
})

VirtualListItem.displayName = 'VirtualListItem'

// Grid version for card layouts
interface VirtualGridProps<T> {
  items: T[]
  itemWidth: number
  itemHeight: number
  containerWidth: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  gap?: number
  overscan?: number
  className?: string
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 16,
  overscan = 5,
  className = ''
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap))
  const rowsCount = Math.ceil(items.length / columnsCount)
  const rowHeight = itemHeight + gap

  const totalHeight = rowsCount * rowHeight
  const visibleRowsCount = Math.ceil(containerHeight / rowHeight)
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endRow = Math.min(rowsCount - 1, startRow + visibleRowsCount + overscan * 2)

  const visibleItems: Array<{ item: T; index: number; row: number; col: number }> = []

  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < columnsCount; col++) {
      const index = row * columnsCount + col
      if (index < items.length) {
        visibleItems.push({
          item: items[index],
          index,
          row,
          col
        })
      }
    }
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * rowHeight,
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Performance-optimized image component
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  lazy?: boolean
}

export const OptimizedImage = React.memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  lazy = true
}) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!lazy) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current) {
            const img = imgRef.current
            img.src = src
            observer.unobserve(img)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src, lazy])

  const handleLoad = () => setLoaded(true)
  const handleError = () => setError(true)

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <img
        ref={imgRef}
        src={lazy ? placeholder : src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
      />
      
      {!loaded && !error && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {error && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={{ width, height }}
        >
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'