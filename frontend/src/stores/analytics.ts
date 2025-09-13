/**
 * Analytics Store
 * Manages analytics data, real-time updates via WebSocket, and data processing
 */

import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import axios from 'axios'
import { io, type Socket } from 'socket.io-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

interface AnalyticsData {
  [category: string]: {
    [metric: string]: {
      value: number
      timestamp: string
      formatted: string
    }
  }
}

interface MetricData {
  metric_name: string
  value: number
  timestamp: string
  category: string
  formatted: string
  source: string
}

interface RealtimeData {
  [metric: string]: {
    value: number
    timestamp: string
    change: number
    change_percent: number
  }
}

interface HistoricalDataOptions {
  timeframe?: '1h' | '24h' | '7d' | '30d'
  metric?: string
}

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const summaryData = ref<AnalyticsData>({})
  const realtimeData = ref<RealtimeData>({})
  const historicalData = ref<MetricData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const connected = ref(false)
  const lastUpdated = ref<string | null>(null)
  
  // WebSocket
  let socket: Socket | null = null
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  
  // Filters and settings
  const filters = reactive({
    timeframe: '24h' as '1h' | '24h' | '7d' | '30d',
    category: 'all',
    refreshInterval: 5000
  })

  // Computed
  const categories = computed(() => {
    return Object.keys(summaryData.value)
  })

  const keyMetrics = computed(() => {
    const key = ['revenue', 'active_users', 'orders', 'conversion_rate']
    const metrics: { [key: string]: any } = {}
    
    for (const category of Object.keys(summaryData.value)) {
      for (const metric of Object.keys(summaryData.value[category])) {
        if (key.includes(metric)) {
          metrics[metric] = {
            ...summaryData.value[category][metric],
            realtime: realtimeData.value[metric]
          }
        }
      }
    }
    
    return metrics
  })

  const connectionStatusColor = computed(() => {
    switch (connectionStatus.value) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  })

  // Actions
  const fetchSummaryData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/summary`)
      summaryData.value = response.data.data
      lastUpdated.value = new Date().toISOString()
      return { success: true }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch summary data'
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const fetchCategoryData = async (category: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/category/${category}`)
      return { success: true, data: response.data.data }
    } catch (err: any) {
      const message = err.response?.data?.error || `Failed to fetch ${category} data`
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const fetchHistoricalData = async (options: HistoricalDataOptions = {}) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (options.timeframe) params.append('timeframe', options.timeframe)
      if (options.metric) params.append('metric', options.metric)

      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/historical?${params}`)
      historicalData.value = response.data.data
      return { success: true, data: response.data.data }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch historical data'
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const fetchRealtimeData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/realtime`)
      realtimeData.value = response.data.data
      return { success: true, data: response.data.data }
    } catch (err: any) {
      console.warn('Failed to fetch realtime data:', err)
      return { success: false }
    }
  }

  // WebSocket Management
  const connectWebSocket = () => {
    if (socket?.connected) return

    connectionStatus.value = 'connecting'
    
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.on('connect', () => {
      connectionStatus.value = 'connected'
      connected.value = true
      console.log('WebSocket connected')
      
      // Subscribe to analytics room
      socket?.emit('subscribe_to_analytics')
    })

    socket.on('disconnect', () => {
      connectionStatus.value = 'disconnected'
      connected.value = false
      console.log('WebSocket disconnected')
    })

    socket.on('connect_error', (err) => {
      connectionStatus.value = 'error'
      connected.value = false
      console.error('WebSocket connection error:', err)
    })

    socket.on('analytics_update', (data: RealtimeData) => {
      realtimeData.value = { ...data }
      lastUpdated.value = new Date().toISOString()
      
      // Update summary data with realtime values
      updateSummaryWithRealtime(data)
    })

    socket.on('connection_status', (data) => {
      console.log('Connection status:', data)
    })

    socket.on('subscription_status', (data) => {
      console.log('Subscription status:', data)
    })
  }

  const disconnectWebSocket = () => {
    if (socket) {
      socket.disconnect()
      socket = null
      connectionStatus.value = 'disconnected'
      connected.value = false
    }
  }

  const updateSummaryWithRealtime = (data: RealtimeData) => {
    // Update summary data with realtime values
    for (const [metric, info] of Object.entries(data)) {
      // Find the metric in summary data and update it
      for (const category of Object.keys(summaryData.value)) {
        if (summaryData.value[category][metric]) {
          summaryData.value[category][metric] = {
            ...summaryData.value[category][metric],
            value: info.value,
            timestamp: info.timestamp
          }
        }
      }
    }
  }

  const subscribeToMetric = (metric: string) => {
    if (socket?.connected) {
      socket.emit('subscribe_to_metric', { metric })
    }
  }

  // Utility functions
  const formatMetricValue = (metric: string, value: number): string => {
    const formatters: { [key: string]: (val: number) => string } = {
      revenue: (val) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      orders: (val) => val.toLocaleString(),
      active_users: (val) => val.toLocaleString(),
      new_signups: (val) => val.toLocaleString(),
      page_views: (val) => val.toLocaleString(),
      conversion_rate: (val) => `${val.toFixed(1)}%`,
      bounce_rate: (val) => `${val.toFixed(1)}%`,
      user_retention: (val) => `${val.toFixed(1)}%`,
      churn_rate: (val) => `${val.toFixed(1)}%`,
      click_through_rate: (val) => `${val.toFixed(1)}%`,
      error_rate: (val) => `${val.toFixed(2)}%`,
      roi: (val) => `${val.toFixed(0)}%`,
      page_load_time: (val) => `${val.toFixed(2)}s`,
      session_duration: (val) => `${Math.floor(val / 60)}m ${Math.floor(val % 60)}s`,
      average_order_value: (val) => `$${val.toFixed(2)}`,
      cost_per_acquisition: (val) => `$${val.toFixed(2)}`,
      refunds: (val) => val.toString()
    }

    const formatter = formatters[metric] || ((val) => val.toString())
    return formatter(value)
  }

  const getMetricTrend = (metric: string): 'up' | 'down' | 'neutral' => {
    const realtimeInfo = realtimeData.value[metric]
    if (!realtimeInfo) return 'neutral'
    
    if (realtimeInfo.change > 0) return 'up'
    if (realtimeInfo.change < 0) return 'down'
    return 'neutral'
  }

  const getMetricColor = (metric: string): string => {
    const trend = getMetricTrend(metric)
    const positiveMetrics = ['revenue', 'orders', 'active_users', 'conversion_rate', 'new_signups', 'roi']
    const negativeMetrics = ['bounce_rate', 'churn_rate', 'error_rate', 'refunds', 'cost_per_acquisition']
    
    if (trend === 'neutral') return 'text-gray-600'
    
    if (positiveMetrics.includes(metric)) {
      return trend === 'up' ? 'text-green-600' : 'text-red-600'
    } else if (negativeMetrics.includes(metric)) {
      return trend === 'up' ? 'text-red-600' : 'text-green-600'
    }
    
    return 'text-gray-600'
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize
  const initialize = async () => {
    await fetchSummaryData()
    await fetchRealtimeData()
    connectWebSocket()
  }

  const cleanup = () => {
    disconnectWebSocket()
  }

  return {
    // State
    summaryData,
    realtimeData,
    historicalData,
    loading,
    error,
    connected,
    lastUpdated,
    connectionStatus,
    filters,

    // Computed
    categories,
    keyMetrics,
    connectionStatusColor,

    // Actions
    fetchSummaryData,
    fetchCategoryData,
    fetchHistoricalData,
    fetchRealtimeData,
    connectWebSocket,
    disconnectWebSocket,
    subscribeToMetric,
    formatMetricValue,
    getMetricTrend,
    getMetricColor,
    clearError,
    initialize,
    cleanup
  }
})
