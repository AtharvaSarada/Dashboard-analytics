<template>
  <div class="relative">
    <!-- Chart Container -->
    <div class="relative" :style="{ height: `${height}px` }">
      <canvas
        ref="chartCanvas"
        :width="width"
        :height="height"
        @click="handleChartClick"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
        class="cursor-pointer"
      ></canvas>
      
      <!-- Loading Overlay -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center"
      >
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span class="text-sm text-gray-600 dark:text-gray-400">Loading chart...</span>
        </div>
      </div>
    </div>

    <!-- Chart Controls -->
    <div class="absolute top-2 right-2 flex space-x-1">
      <!-- Zoom Controls -->
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700 p-1">
        <button
          @click="zoomIn"
          :disabled="zoomLevel >= maxZoom"
          class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <PlusIcon class="w-4 h-4" />
        </button>
        <button
          @click="zoomOut"
          :disabled="zoomLevel <= minZoom"
          class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <MinusIcon class="w-4 h-4" />
        </button>
        <button
          @click="resetZoom"
          class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title="Reset Zoom"
        >
          <ArrowPathIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Export Controls -->
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700 p-1">
        <button
          @click="downloadChart"
          class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title="Download Chart"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
        </button>
        <button
          @click="toggleFullscreen"
          class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title="Toggle Fullscreen"
        >
          <ArrowsPointingOutIcon v-if="!isFullscreen" class="w-4 h-4" />
          <ArrowsPointingInIcon v-else class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Data Point Tooltip -->
    <div
      v-if="tooltip.visible"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      class="absolute z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg py-2 px-3 shadow-lg pointer-events-none"
    >
      <div class="font-medium">{{ tooltip.title }}</div>
      <div v-for="item in tooltip.data" :key="item.label" class="flex items-center space-x-2 mt-1">
        <div
          :style="{ backgroundColor: item.color }"
          class="w-2 h-2 rounded-full"
        ></div>
        <span>{{ item.label }}: {{ item.value }}</span>
      </div>
    </div>

    <!-- Selection Box (for zoom selection) -->
    <div
      v-if="selection.active"
      :style="{
        left: `${selection.startX}px`,
        top: `${selection.startY}px`,
        width: `${selection.width}px`,
        height: `${selection.height}px`
      }"
      class="absolute border-2 border-primary-500 bg-primary-100 dark:bg-primary-900 bg-opacity-20 pointer-events-none"
    ></div>

    <!-- Chart Legend (if enabled) -->
    <div v-if="showLegend && legend.length > 0" class="mt-4 flex flex-wrap gap-4 justify-center">
      <div
        v-for="item in legend"
        :key="item.label"
        @click="toggleDataset(item.datasetIndex)"
        class="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity duration-200"
        :class="{ 'opacity-50': item.hidden }"
      >
        <div
          :style="{ backgroundColor: item.color }"
          class="w-3 h-3 rounded-full"
        ></div>
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import {
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/vue/24/outline'

import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  registerables
} from 'chart.js'
import 'chartjs-adapter-date-fns'

// Register Chart.js components
Chart.register(...registerables)

interface Props {
  type: string
  data: ChartData
  options?: ChartOptions
  width?: number
  height?: number
  loading?: boolean
  showLegend?: boolean
  enableZoom?: boolean
  enableSelection?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 400,
  loading: false,
  showLegend: true,
  enableZoom: true,
  enableSelection: false
})

const emit = defineEmits<{
  'chart-click': [event: any, elements: any[]]
  'data-point-hover': [event: any, elements: any[]]
  'zoom-change': [zoomLevel: number]
  'selection': [selection: { startX: number, startY: number, endX: number, endY: number }]
}>()

// Component refs and state
const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const zoomLevel = ref(1)
const minZoom = 0.5
const maxZoom = 5
const isFullscreen = ref(false)

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  data: [] as { label: string; value: string; color: string }[]
})

const selection = ref({
  active: false,
  startX: 0,
  startY: 0,
  width: 0,
  height: 0
})

const legend = ref<{ label: string; color: string; datasetIndex: number; hidden: boolean }[]>([])

// Chart initialization
const initChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Enhanced chart options with interactions
  const chartOptions: ChartOptions = {
    ...props.options,
    responsive: false,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    onHover: (event: any, elements: any[]) => {
      handleMouseMove(event)
      emit('data-point-hover', event, elements)
    },
    onClick: (event: any, elements: any[]) => {
      emit('chart-click', event, elements)
    },
    plugins: {
      ...props.options?.plugins,
      tooltip: {
        enabled: false // We'll use custom tooltip
      },
      legend: {
        display: false // We'll use custom legend
      }
    },
    scales: {
      ...props.options?.scales,
      x: {
        ...props.options?.scales?.x,
        min: props.options?.scales?.x?.min,
        max: props.options?.scales?.x?.max
      },
      y: {
        ...props.options?.scales?.y,
        min: props.options?.scales?.y?.min,
        max: props.options?.scales?.y?.max
      }
    }
  }

  const config: ChartConfiguration = {
    type: props.type as any,
    data: props.data,
    options: chartOptions
  }

  chartInstance = new Chart(ctx, config)
  
  // Generate legend data
  generateLegend()
}

// Generate custom legend
const generateLegend = () => {
  if (!chartInstance) return

  legend.value = chartInstance.data.datasets.map((dataset, index) => ({
    label: dataset.label || `Dataset ${index + 1}`,
    color: Array.isArray(dataset.backgroundColor) 
      ? dataset.backgroundColor[0] as string
      : dataset.backgroundColor as string || '#000',
    datasetIndex: index,
    hidden: !chartInstance?.isDatasetVisible(index)
  }))
}

// Event handlers
const handleChartClick = (event: MouseEvent) => {
  if (!chartInstance) return

  const rect = chartCanvas.value?.getBoundingClientRect()
  if (!rect) return

  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const elements = chartInstance.getElementsAtEventForMode(
    event as any,
    'nearest',
    { intersect: true },
    true
  )

  emit('chart-click', { x, y, event }, elements)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!chartInstance || !chartCanvas.value) return

  const rect = chartCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const elements = chartInstance.getElementsAtEventForMode(
    event as any,
    'nearest',
    { intersect: false },
    true
  )

  if (elements.length > 0) {
    const element = elements[0]
    const datasetIndex = element.datasetIndex
    const dataIndex = element.index

    const dataset = chartInstance.data.datasets[datasetIndex]
    const value = dataset.data[dataIndex]

    tooltip.value = {
      visible: true,
      x: x + 10,
      y: y - 10,
      title: chartInstance.data.labels?.[dataIndex] as string || '',
      data: [{
        label: dataset.label || 'Value',
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        color: Array.isArray(dataset.backgroundColor) 
          ? dataset.backgroundColor[dataIndex] as string
          : dataset.backgroundColor as string || '#000'
      }]
    }
  } else {
    tooltip.value.visible = false
  }
}

const handleMouseLeave = () => {
  tooltip.value.visible = false
}

// Zoom controls
const zoomIn = () => {
  if (zoomLevel.value < maxZoom) {
    zoomLevel.value += 0.25
    applyZoom()
  }
}

const zoomOut = () => {
  if (zoomLevel.value > minZoom) {
    zoomLevel.value -= 0.25
    applyZoom()
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
  applyZoom()
  emit('zoom-change', zoomLevel.value)
}

const applyZoom = () => {
  if (!chartInstance) return

  // Apply zoom by updating scale limits
  const originalOptions = props.options
  if (chartInstance.options.scales?.x && originalOptions?.scales?.x) {
    // Apply zoom logic here based on chart type and zoom level
  }

  chartInstance.update('none')
  emit('zoom-change', zoomLevel.value)
}

// Export functionality
const downloadChart = () => {
  if (!chartCanvas.value) return

  const url = chartCanvas.value.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = 'chart.png'
  link.href = url
  link.click()
}

// Fullscreen toggle
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  // Implement fullscreen logic
}

// Legend interactions
const toggleDataset = (datasetIndex: number) => {
  if (!chartInstance) return

  chartInstance.setDatasetVisibility(datasetIndex, !chartInstance.isDatasetVisible(datasetIndex))
  chartInstance.update()
  generateLegend()
}

// Watch for data changes
watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.data = props.data
    chartInstance.update()
    generateLegend()
  }
}, { deep: true })

watch(() => props.options, () => {
  initChart()
}, { deep: true })

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>
