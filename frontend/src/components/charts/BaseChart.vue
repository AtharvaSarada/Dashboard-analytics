<template>
  <div class="relative">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75 rounded-lg">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-if="error" class="flex items-center justify-center h-64 text-red-500">
      <div class="text-center">
        <p class="text-sm">{{ error }}</p>
        <button @click="retry" class="mt-2 text-xs underline">Retry</button>
      </div>
    </div>
    
    <canvas 
      v-else
      ref="chartCanvas" 
      :width="width" 
      :height="height"
      class="max-w-full"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  data: any
  options?: any
  width?: number
  height?: number
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 200,
  loading: false,
  error: null,
  options: () => ({})
})

const emit = defineEmits<{
  retry: []
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: ChartJS | null = null

const createChart = async () => {
  if (!chartCanvas.value || !props.data) return
  
  await nextTick()
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Default options based on chart type
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12
      }
    },
    scales: props.type !== 'pie' && props.type !== 'doughnut' ? {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    } : {}
  }

  // Merge options
  const chartOptions = {
    ...defaultOptions,
    ...props.options
  }

  // Create chart data based on type
  let chartData = { ...props.data }
  
  if (props.type === 'area') {
    chartData.datasets = chartData.datasets?.map((dataset: any) => ({
      ...dataset,
      fill: true,
      backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)',
      borderColor: dataset.borderColor || 'rgba(59, 130, 246, 1)',
      tension: 0.4
    }))
  }

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Create new chart
  chartInstance = new ChartJS(ctx, {
    type: props.type === 'area' ? 'line' : props.type,
    data: chartData,
    options: chartOptions
  })
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

const retry = () => {
  emit('retry')
}

// Watch for data changes
watch(() => props.data, () => {
  if (chartInstance && props.data) {
    chartInstance.data = props.data
    chartInstance.update('active')
  }
}, { deep: true })

// Watch for options changes
watch(() => props.options, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  destroyChart()
})
</script>
