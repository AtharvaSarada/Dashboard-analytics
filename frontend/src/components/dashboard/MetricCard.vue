<template>
  <div class="card p-6">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <div class="flex items-center">
          <component :is="icon" :class="[
            'w-6 h-6 mr-3',
            color
          ]" />
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ title }}
          </p>
        </div>
        
        <div class="mt-2">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ value }}
          </h3>
          
          <div v-if="change !== undefined" class="flex items-center mt-2">
            <span :class="[
              'flex items-center text-sm font-medium',
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            ]">
              <ArrowUpIcon v-if="trend === 'up'" class="w-4 h-4 mr-1" />
              <ArrowDownIcon v-if="trend === 'down'" class="w-4 h-4 mr-1" />
              <span v-if="changePercent !== undefined">
                {{ Math.abs(changePercent).toFixed(1) }}%
              </span>
              <span v-else>
                {{ Math.abs(change) }}
              </span>
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
              vs last period
            </span>
          </div>
        </div>
      </div>
      
      <!-- Mini trend chart area (placeholder) -->
      <div class="hidden sm:block w-16 h-12 ml-4">
        <div :class="[
          'w-full h-full rounded',
          trend === 'up' ? 'bg-green-50 dark:bg-green-900/20' : 
          trend === 'down' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'
        ]">
          <!-- This could be replaced with a mini Chart.js chart -->
          <div class="w-full h-full flex items-center justify-center opacity-30">
            <component :is="icon" class="w-6 h-6 text-current" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Real-time indicator -->
    <div v-if="isRealtime" class="mt-4 flex items-center text-xs text-green-600 dark:text-green-400">
      <div class="w-2 h-2 rounded-full bg-current animate-pulse mr-2"></div>
      Live data
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon } from '@heroicons/vue/24/outline'

interface Props {
  title: string
  value: string | number
  change?: number
  changePercent?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: any
  color?: string
  isRealtime?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'neutral',
  icon: ChartBarIcon,
  color: 'text-gray-600',
  isRealtime: false
})

// Computed to check if we should show real-time indicator
const isRealtime = computed(() => {
  return props.isRealtime || (props.change !== undefined && Math.abs(props.change) > 0)
})
</script>
