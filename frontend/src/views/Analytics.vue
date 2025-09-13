<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Detailed Analytics
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comprehensive view of your data insights and trends
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <!-- Time Range Filter -->
        <select
          v-model="selectedTimeRange"
          @change="handleTimeRangeChange"
          class="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 3 months</option>
        </select>
        
        <!-- Export Button -->
        <button
          @click="exportData"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
          Export
        </button>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        v-for="metric in keyMetrics"
        :key="metric.title"
        :title="metric.title"
        :value="metric.value"
        :change="metric.change"
        :trend="metric.trend"
        :icon="metric.icon"
        :color="metric.color"
        :is-realtime="true"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Trend Chart -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Revenue Trend
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Revenue performance over time
            </p>
          </div>
          <div class="flex space-x-2">
            <button
              v-for="type in ['line', 'bar']"
              :key="type"
              @click="revenueChartType = type"
              :class="[
                'px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200',
                revenueChartType === type
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              ]"
            >
              {{ type.charAt(0).toUpperCase() + type.slice(1) }}
            </button>
          </div>
        </div>
        <BaseChart
          :type="revenueChartType"
          :data="revenueData"
          :options="chartOptions"
          :height="300"
        />
      </div>

      <!-- User Analytics Chart -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              User Analytics
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              User engagement metrics
            </p>
          </div>
          <div class="flex space-x-2">
            <button
              v-for="type in ['line', 'area']"
              :key="type"
              @click="userChartType = type"
              :class="[
                'px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200',
                userChartType === type
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              ]"
            >
              {{ type.charAt(0).toUpperCase() + type.slice(1) }}
            </button>
          </div>
        </div>
        <BaseChart
          :type="userChartType"
          :data="userAnalyticsData"
          :options="chartOptions"
          :height="300"
        />
      </div>
    </div>

    <!-- Performance Metrics and Geographic Data -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Performance Metrics (2 columns on xl) -->
      <div class="xl:col-span-2">
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Performance Metrics
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                System performance indicators
              </p>
            </div>
            <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time</span>
            </div>
          </div>
          <BaseChart
            type="bar"
            :data="performanceData"
            :options="performanceChartOptions"
            :height="300"
          />
        </div>
      </div>

      <!-- Geographic Distribution -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Geographic Distribution
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Users by location
            </p>
          </div>
        </div>
        <BaseChart
          type="doughnut"
          :data="geographicData"
          :options="doughnutChartOptions"
          :height="300"
        />
        
        <!-- Geographic Legend -->
        <div class="mt-4 space-y-2">
          <div
            v-for="(region, index) in geographicLegend"
            :key="region.name"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center">
              <div
                :style="{ backgroundColor: region.color }"
                class="w-3 h-3 rounded-full mr-2"
              ></div>
              <span class="text-gray-600 dark:text-gray-400">{{ region.name }}</span>
            </div>
            <span class="font-medium text-gray-900 dark:text-white">{{ region.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Analytics Table -->
    <div class="card p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Detailed Analytics
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Comprehensive data breakdown
          </p>
        </div>
        
        <!-- Search and Filter -->
        <div class="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <select
            v-model="selectedCategory"
            class="block w-full sm:w-32 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="">All Categories</option>
            <option value="revenue">Revenue</option>
            <option value="users">Users</option>
            <option value="performance">Performance</option>
          </select>
        </div>
      </div>

      <!-- Responsive Table -->
      <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  v-for="header in tableHeaders"
                  :key="header.key"
                  @click="sortBy(header.key)"
                  :class="[
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200',
                    header.sortable && 'select-none'
                  ]"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ header.label }}</span>
                    <ChevronUpIcon
                      v-if="header.sortable && sortField === header.key && sortOrder === 'asc'"
                      class="w-4 h-4"
                    />
                    <ChevronDownIcon
                      v-else-if="header.sortable && sortField === header.key && sortOrder === 'desc'"
                      class="w-4 h-4"
                    />
                    <ChevronUpDownIcon
                      v-else-if="header.sortable"
                      class="w-4 h-4 text-gray-400"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              <tr
                v-for="(item, index) in paginatedTableData"
                :key="index"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.metric }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ item.value }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    item.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    item.trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  ]">
                    {{ item.change }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ item.category }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ item.lastUpdated }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Showing <span class="font-medium">{{ startIndex + 1 }}</span> to <span class="font-medium">{{ endIndex }}</span> of <span class="font-medium">{{ filteredTableData.length }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon class="h-5 w-5" />
              </button>
              
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/vue/24/outline'

import BaseChart from '@/components/charts/BaseChart.vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { useUIStore } from '@/stores/ui'

const analyticsStore = useAnalyticsStore()
const uiStore = useUIStore()

// Reactive state
const selectedTimeRange = ref('7d')
const revenueChartType = ref<'line' | 'bar'>('line')
const userChartType = ref<'line' | 'area'>('area')
const searchQuery = ref('')
const selectedCategory = ref('')
const sortField = ref('metric')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const itemsPerPage = 10

// Key metrics for the top cards
const keyMetrics = computed(() => [
  {
    title: 'Total Revenue',
    value: '$45,231',
    change: 12.3,
    trend: 'up' as const,
    icon: CurrencyDollarIcon,
    color: 'text-green-600'
  },
  {
    title: 'Active Users',
    value: '12,543',
    change: 8.5,
    trend: 'up' as const,
    icon: UserGroupIcon,
    color: 'text-blue-600'
  },
  {
    title: 'Conversion Rate',
    value: '3.4%',
    change: -2.1,
    trend: 'down' as const,
    icon: ChartBarIcon,
    color: 'text-purple-600'
  },
  {
    title: 'Global Reach',
    value: '45 Countries',
    change: 5,
    trend: 'up' as const,
    icon: GlobeAltIcon,
    color: 'text-indigo-600'
  }
])

// Chart data
const revenueData = computed(() => analyticsStore.revenueData)
const userAnalyticsData = computed(() => analyticsStore.userAnalyticsData)
const performanceData = computed(() => analyticsStore.performanceData)
const geographicData = computed(() => analyticsStore.geographicData)

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
}

const performanceChartOptions = {
  ...chartOptions,
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
}

// Geographic legend data
const geographicLegend = computed(() => [
  { name: 'North America', percentage: 42, color: '#3B82F6' },
  { name: 'Europe', percentage: 28, color: '#10B981' },
  { name: 'Asia Pacific', percentage: 18, color: '#F59E0B' },
  { name: 'Latin America', percentage: 8, color: '#EF4444' },
  { name: 'Others', percentage: 4, color: '#6B7280' }
])

// Table data and functionality
const tableHeaders = [
  { key: 'metric', label: 'Metric', sortable: true },
  { key: 'value', label: 'Value', sortable: true },
  { key: 'change', label: 'Change', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'lastUpdated', label: 'Last Updated', sortable: true }
]

const rawTableData = ref([
  { metric: 'Page Views', value: '145,230', change: '+12.3%', trend: 'up', category: 'users', lastUpdated: '2 mins ago' },
  { metric: 'Unique Visitors', value: '42,315', change: '+8.7%', trend: 'up', category: 'users', lastUpdated: '5 mins ago' },
  { metric: 'Bounce Rate', value: '23.4%', change: '-2.1%', trend: 'down', category: 'performance', lastUpdated: '1 min ago' },
  { metric: 'Average Session', value: '4:32', change: '+15.2%', trend: 'up', category: 'performance', lastUpdated: '3 mins ago' },
  { metric: 'Revenue', value: '$45,231', change: '+23.4%', trend: 'up', category: 'revenue', lastUpdated: '1 min ago' },
  { metric: 'Conversion Rate', value: '3.4%', change: '-1.2%', trend: 'down', category: 'revenue', lastUpdated: '4 mins ago' }
])

// Computed properties for table functionality
const filteredTableData = computed(() => {
  let data = rawTableData.value

  // Filter by search query
  if (searchQuery.value) {
    data = data.filter(item =>
      item.metric.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by category
  if (selectedCategory.value) {
    data = data.filter(item => item.category === selectedCategory.value)
  }

  // Sort data
  data.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortOrder.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })

  return data
})

const totalPages = computed(() => Math.ceil(filteredTableData.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredTableData.value.length))
const paginatedTableData = computed(() => 
  filteredTableData.value.slice(startIndex.value, endIndex.value)
)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const handleTimeRangeChange = () => {
  analyticsStore.updateTimeRange(selectedTimeRange.value)
}

const exportData = () => {
  uiStore.showInfo('Exporting analytics data...')
  // Implement export functionality
}

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
}

// Watch for filter changes and reset pagination
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
})

onMounted(() => {
  analyticsStore.fetchAnalyticsData()
})
</script>
