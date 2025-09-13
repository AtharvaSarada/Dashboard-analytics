<template>
  <div class="space-y-6">
    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        v-for="(metric, key) in keyMetrics"
        :key="key"
        :title="formatMetricTitle(key)"
        :value="metric.formatted || formatMetricValue(key, metric.value)"
        :change="metric.realtime?.change"
        :change-percent="metric.realtime?.change_percent"
        :trend="getMetricTrend(key)"
        :icon="getMetricIcon(key)"
        :color="getMetricColor(key)"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Trend -->
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
          <div class="h-64">
            <BaseChart
              type="area"
              :data="revenueChartData"
              :loading="loading"
              :error="error"
            />
          </div>
        </div>
      </div>

      <!-- User Analytics -->
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">User Analytics</h3>
          <div class="h-64">
            <BaseChart
              type="line"
              :data="userChartData"
              :loading="loading"
              :error="error"
            />
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Overview</h3>
          <div class="h-64">
            <BaseChart
              type="bar"
              :data="performanceChartData"
              :loading="loading"
              :error="error"
            />
          </div>
        </div>
      </div>

      <!-- Geographic Distribution -->
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Geographic Distribution</h3>
          <div class="h-64">
            <BaseChart
              type="doughnut"
              :data="geographicChartData"
              :loading="loading"
              :error="error"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div class="p-6">
        <div class="flow-root">
          <ul class="-mb-8">
            <li v-for="(activity, idx) in recentActivity" :key="idx">
              <div class="relative pb-8">
                <span v-if="idx !== recentActivity.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span :class="[
                      'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800',
                      activity.type === 'success' ? 'bg-green-500' : 
                      activity.type === 'warning' ? 'bg-yellow-500' : 
                      activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    ]">
                      <component :is="activity.icon" class="h-5 w-5 text-white" />
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div>
                      <p class="text-sm text-gray-900 dark:text-white">
                        {{ activity.title }}
                      </p>
                      <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {{ formatTimestamp(activity.timestamp) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ShoppingCartIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'
import BaseChart from '@/components/charts/BaseChart.vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { useUIStore } from '@/stores/ui'

const analyticsStore = useAnalyticsStore()
const uiStore = useUIStore()

// Computed properties
const keyMetrics = computed(() => analyticsStore.keyMetrics)
const loading = computed(() => analyticsStore.loading)
const error = computed(() => analyticsStore.error)
const summaryData = computed(() => analyticsStore.summaryData)

// Chart data
const revenueChartData = computed(() => {
  // Sample data - in real app, this would come from historical data
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 15000, 13500, 18000, 16500, 21000],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }
})

const userChartData = computed(() => {
  return {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Active Users',
        data: [320, 350, 380, 420],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)'
      },
      {
        label: 'New Users',
        data: [45, 52, 48, 65],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)'
      }
    ]
  }
})

const performanceChartData = computed(() => {
  return {
    labels: ['Page Load', 'API Response', 'Database', 'Cache Hit'],
    datasets: [
      {
        label: 'Performance (ms)',
        data: [1200, 450, 320, 95],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ]
      }
    ]
  }
})

const geographicChartData = computed(() => {
  return {
    labels: ['United States', 'Europe', 'Asia', 'Others'],
    datasets: [
      {
        data: [45, 30, 20, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ]
      }
    ]
  }
})

// Recent activity data
const recentActivity = computed(() => [
  {
    title: 'New user registered from New York',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'success',
    icon: UserGroupIcon
  },
  {
    title: 'Revenue target exceeded for this month',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'success',
    icon: ArrowTrendingUpIcon
  },
  {
    title: 'High response time detected on API endpoint',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'warning',
    icon: ExclamationTriangleIcon
  },
  {
    title: 'Daily backup completed successfully',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: 'info',
    icon: InformationCircleIcon
  }
])

// Helper functions
const formatMetricTitle = (key: string): string => {
  const titles: { [key: string]: string } = {
    revenue: 'Total Revenue',
    active_users: 'Active Users',
    orders: 'Total Orders',
    conversion_rate: 'Conversion Rate'
  }
  return titles[key] || key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatMetricValue = (key: string, value: number): string => {
  return analyticsStore.formatMetricValue(key, value)
}

const getMetricTrend = (key: string): 'up' | 'down' | 'neutral' => {
  return analyticsStore.getMetricTrend(key)
}

const getMetricColor = (key: string): string => {
  const colors: { [key: string]: string } = {
    revenue: 'text-green-600',
    active_users: 'text-blue-600',
    orders: 'text-purple-600',
    conversion_rate: 'text-orange-600'
  }
  return colors[key] || 'text-gray-600'
}

const getMetricIcon = (key: string) => {
  const icons: { [key: string]: any } = {
    revenue: CurrencyDollarIcon,
    active_users: UserGroupIcon,
    orders: ShoppingCartIcon,
    conversion_rate: ChartBarIcon
  }
  return icons[key] || ChartBarIcon
}

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date()
  const diffInMs = now.getTime() - timestamp.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}

onMounted(async () => {
  // Initialize analytics data
  await analyticsStore.fetchSummaryData()
  
  if (analyticsStore.error) {
    uiStore.showError('Failed to load dashboard data', analyticsStore.error)
  }
})
</script>
