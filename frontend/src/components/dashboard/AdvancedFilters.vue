<template>
  <div class="space-y-4">
    <!-- Filter Toggle Button -->
    <button
      @click="showFilters = !showFilters"
      class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
    >
      <AdjustmentsHorizontalIcon class="w-5 h-5" />
      <span>{{ showFilters ? 'Hide' : 'Show' }} Filters</span>
      <ChevronDownIcon :class="['w-4 h-4 transition-transform duration-200', showFilters && 'rotate-180']" />
    </button>

    <!-- Filter Panel -->
    <div
      v-show="showFilters"
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
    >
      <!-- Date Range Filter -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            v-model="filters.dateRange"
            @change="$emit('filter-change', filters)"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <!-- Custom Date Inputs (shown when custom is selected) -->
        <div v-if="filters.dateRange === 'custom'" class="sm:col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              v-model="filters.startDate"
              @change="$emit('filter-change', filters)"
              type="date"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              v-model="filters.endDate"
              @change="$emit('filter-change', filters)"
              type="date"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <!-- Metric Categories -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categories
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in availableCategories"
            :key="category.id"
            @click="toggleCategory(category.id)"
            :class="[
              'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200',
              filters.categories.includes(category.id)
                ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            <component :is="category.icon" class="w-4 h-4 mr-2" />
            {{ category.name }}
            <XMarkIcon
              v-if="filters.categories.includes(category.id)"
              class="w-3 h-3 ml-2"
            />
          </button>
        </div>
      </div>

      <!-- Value Range Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Revenue ($)
          </label>
          <input
            v-model.number="filters.minRevenue"
            @input="$emit('filter-change', filters)"
            type="number"
            min="0"
            step="100"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="0"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Revenue ($)
          </label>
          <input
            v-model.number="filters.maxRevenue"
            @input="$emit('filter-change', filters)"
            type="number"
            min="0"
            step="100"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="∞"
          />
        </div>
      </div>

      <!-- Geographic Filters -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Regions
        </label>
        <div class="space-y-2">
          <label
            v-for="region in availableRegions"
            :key="region.id"
            class="flex items-center space-x-3"
          >
            <input
              v-model="filters.regions"
              :value="region.id"
              @change="$emit('filter-change', filters)"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
            <div class="flex items-center space-x-2">
              <div :style="{ backgroundColor: region.color }" class="w-3 h-3 rounded-full"></div>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ region.name }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Sort Options -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            v-model="filters.sortBy"
            @change="$emit('filter-change', filters)"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="date">Date</option>
            <option value="revenue">Revenue</option>
            <option value="users">Users</option>
            <option value="performance">Performance</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort Order
          </label>
          <select
            v-model="filters.sortOrder"
            @change="$emit('filter-change', filters)"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ activeFilterCount }} filter{{ activeFilterCount === 1 ? '' : 's' }} active
        </div>
        <div class="flex space-x-3">
          <button
            @click="resetFilters"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            Clear All
          </button>
          <button
            @click="applyFilters"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

interface FilterOptions {
  dateRange: string
  startDate: string
  endDate: string
  categories: string[]
  minRevenue: number | null
  maxRevenue: number | null
  regions: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface Props {
  initialFilters?: Partial<FilterOptions>
}

const props = withDefaults(defineProps<Props>(), {
  initialFilters: () => ({})
})

const emit = defineEmits<{
  'filter-change': [filters: FilterOptions]
  'apply-filters': [filters: FilterOptions]
}>()

// Component state
const showFilters = ref(false)

// Filter state
const filters = reactive<FilterOptions>({
  dateRange: '7d',
  startDate: '',
  endDate: '',
  categories: [],
  minRevenue: null,
  maxRevenue: null,
  regions: [],
  sortBy: 'date',
  sortOrder: 'desc',
  ...props.initialFilters
})

// Available options
const availableCategories = [
  { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon },
  { id: 'users', name: 'Users', icon: UserGroupIcon },
  { id: 'performance', name: 'Performance', icon: ChartBarIcon },
  { id: 'time', name: 'Time-based', icon: ClockIcon }
]

const availableRegions = [
  { id: 'na', name: 'North America', color: '#3B82F6' },
  { id: 'eu', name: 'Europe', color: '#10B981' },
  { id: 'ap', name: 'Asia Pacific', color: '#F59E0B' },
  { id: 'la', name: 'Latin America', color: '#EF4444' },
  { id: 'other', name: 'Others', color: '#6B7280' }
]

// Computed properties
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.dateRange !== '7d') count++
  if (filters.categories.length > 0) count++
  if (filters.minRevenue !== null || filters.maxRevenue !== null) count++
  if (filters.regions.length > 0) count++
  if (filters.sortBy !== 'date' || filters.sortOrder !== 'desc') count++
  return count
})

// Methods
const toggleCategory = (categoryId: string) => {
  const index = filters.categories.indexOf(categoryId)
  if (index > -1) {
    filters.categories.splice(index, 1)
  } else {
    filters.categories.push(categoryId)
  }
  emit('filter-change', filters)
}

const resetFilters = () => {
  Object.assign(filters, {
    dateRange: '7d',
    startDate: '',
    endDate: '',
    categories: [],
    minRevenue: null,
    maxRevenue: null,
    regions: [],
    sortBy: 'date',
    sortOrder: 'desc'
  })
  emit('filter-change', filters)
}

const applyFilters = () => {
  emit('apply-filters', filters)
}

// Watch for filter changes
watch(filters, (newFilters) => {
  // Auto-apply some filters immediately
  emit('filter-change', newFilters)
}, { deep: true })
</script>
