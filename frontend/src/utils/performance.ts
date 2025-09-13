// Performance optimization utilities and configurations

/**
 * Debounce function for search inputs and API calls
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Throttle function for scroll and resize events
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * Simple LRU Cache implementation for API responses
 */
export class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>()
  
  constructor(
    private maxSize: number = 100,
    private ttl: number = 5 * 60 * 1000 // 5 minutes
  ) {}

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, item)
    return item.value
  }

  set(key: string, value: T): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, { value, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Global cache instances
export const apiCache = new LRUCache(50, 2 * 60 * 1000) // 2 minutes for API calls
export const chartDataCache = new LRUCache(20, 30 * 1000) // 30 seconds for chart data

/**
 * Memoization decorator for expensive computations
 */
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getCacheKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getCacheKey ? getCacheKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Virtual scrolling helper for large datasets
 */
export class VirtualList {
  private visibleItems: any[] = []
  private scrollTop = 0
  
  constructor(
    private items: any[],
    private itemHeight: number,
    private containerHeight: number
  ) {}

  getVisibleItems(scrollTop: number): { items: any[]; startIndex: number; endIndex: number } {
    this.scrollTop = scrollTop
    
    const startIndex = Math.floor(scrollTop / this.itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + 1,
      this.items.length
    )
    
    return {
      items: this.items.slice(startIndex, endIndex),
      startIndex,
      endIndex
    }
  }

  getTotalHeight(): number {
    return this.items.length * this.itemHeight
  }

  getOffsetY(index: number): number {
    return index * this.itemHeight
  }
}

/**
 * Image lazy loading utility
 */
export const setupLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.classList.remove('lazy')
            imageObserver.unobserve(img)
          }
        }
      })
    })

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img)
    })

    return imageObserver
  }
}

/**
 * Performance monitoring and reporting
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  
  startTiming(label: string): () => number {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(label, duration)
      return duration
    }
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    
    const values = this.metrics.get(label)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  getStats(label: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label)
    if (!values || values.length === 0) return null
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    return { avg, min, max, count: values.length }
  }

  getAllStats(): Record<string, ReturnType<PerformanceMonitor['getStats']>> {
    const stats: Record<string, ReturnType<PerformanceMonitor['getStats']>> = {}
    
    for (const [label] of this.metrics) {
      stats[label] = this.getStats(label)
    }
    
    return stats
  }

  clear(): void {
    this.metrics.clear()
  }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor()

/**
 * Bundle size optimization helpers
 */
export const importComponent = (componentPath: string) => {
  return () => import(componentPath)
}

/**
 * Optimize chart rendering for large datasets
 */
export const optimizeChartData = (data: any[], maxPoints: number = 100) => {
  if (data.length <= maxPoints) return data
  
  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, index) => index % step === 0)
}

/**
 * Batch API calls to reduce requests
 */
export class APIBatcher {
  private batches = new Map<string, { requests: any[]; timeout: NodeJS.Timeout }>()
  
  constructor(private batchSize: number = 10, private batchDelay: number = 100) {}

  add<T>(
    batchKey: string,
    request: any,
    processor: (requests: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, {
          requests: [],
          timeout: setTimeout(() => this.processBatch(batchKey, processor), this.batchDelay)
        })
      }
      
      const batch = this.batches.get(batchKey)!
      batch.requests.push({ request, resolve, reject })
      
      // Process immediately if batch is full
      if (batch.requests.length >= this.batchSize) {
        clearTimeout(batch.timeout)
        this.processBatch(batchKey, processor)
      }
    })
  }

  private async processBatch<T>(
    batchKey: string,
    processor: (requests: any[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batches.get(batchKey)
    if (!batch) return
    
    this.batches.delete(batchKey)
    
    try {
      const requests = batch.requests.map(({ request }) => request)
      const results = await processor(requests)
      
      batch.requests.forEach(({ resolve }, index) => {
        resolve(results[index])
      })
    } catch (error) {
      batch.requests.forEach(({ reject }) => {
        reject(error)
      })
    }
  }
}

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = (): {
  used: number
  total: number
  percentage: number
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    }
  }
  return null
}

/**
 * Web Worker utility for heavy computations
 */
export const createWorker = (workerFunction: Function): Worker => {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript'
  })
  
  return new Worker(URL.createObjectURL(blob))
}

/**
 * Service Worker registration for caching
 */
export const registerServiceWorker = async (swUrl: string): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swUrl)
      console.log('Service Worker registered:', registration)
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }
  return false
}

/**
 * Resource preloading
 */
export const preloadResource = (href: string, as: string = 'fetch'): void => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

/**
 * Critical CSS inlining check
 */
export const isCriticalCSS = (): boolean => {
  return document.querySelector('style[data-critical]') !== null
}

/**
 * Font loading optimization
 */
export const preloadFonts = (fontUrls: string[]): void => {
  fontUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// Performance configuration for different environments
export const performanceConfig = {
  development: {
    enableLogging: true,
    cacheEnabled: false,
    batchingEnabled: false,
    virtualScrolling: false
  },
  production: {
    enableLogging: false,
    cacheEnabled: true,
    batchingEnabled: true,
    virtualScrolling: true
  }
}

/**
 * Environment-based performance settings
 */
export const getPerformanceConfig = () => {
  const isDev = import.meta.env.DEV
  return isDev ? performanceConfig.development : performanceConfig.production
}
