<template>
  <!-- Mobile menu overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 lg:hidden"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
      @click="$emit('close')"
    ></div>

    <!-- Slide-out panel -->
    <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
      <!-- Close button -->
      <div class="absolute top-0 right-0 -mr-12 pt-2">
        <button
          @click="$emit('close')"
          class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        >
          <XMarkIcon class="h-6 w-6 text-white" />
        </button>
      </div>

      <!-- Logo -->
      <div class="flex-shrink-0 flex items-center px-4 py-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">A</span>
          </div>
          <span class="text-xl font-bold text-gray-900 dark:text-white">Analytics</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          @click="$emit('close')"
          :class="[
            'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-200',
            $route.path === item.href
              ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
          ]"
        >
          <component :is="item.icon" class="mr-4 h-6 w-6" />
          {{ item.name }}
        </router-link>
      </nav>

      <!-- User section -->
      <div class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-medium">
              {{ user?.username?.charAt(0).toUpperCase() || 'U' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-gray-900 dark:text-white truncate">
              {{ user?.username || 'User' }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
              {{ user?.role || 'Member' }}
            </p>
          </div>
        </div>

        <!-- User actions -->
        <div class="space-y-1">
          <button class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
            Profile
          </button>
          <button class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
            Settings
          </button>
          <button
            @click="handleLogout"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
          >
            Sign out
          </button>
        </div>

        <!-- Theme toggle -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="toggleTheme"
            class="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
          >
            <SunIcon v-if="isDark" class="mr-3 h-5 w-5" />
            <MoonIcon v-else class="mr-3 h-5 w-5" />
            {{ isDark ? 'Light mode' : 'Dark mode' }}
          </button>
        </div>

        <!-- Connection status -->
        <div class="mt-4 flex items-center justify-center space-x-2 text-sm">
          <div :class="[
            'w-2 h-2 rounded-full',
            connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          ]"></div>
          <span class="text-gray-500 dark:text-gray-400">
            {{ connected ? 'Connected' : 'Offline' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  XMarkIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  DocumentChartBarIcon
} from '@heroicons/vue/24/outline'

import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useAnalyticsStore } from '@/stores/analytics'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const analyticsStore = useAnalyticsStore()

// Computed properties
const user = computed(() => authStore.user)
const isDark = computed(() => uiStore.isDark)
const connected = computed(() => analyticsStore.connected)

// Navigation items (same as in DashboardLayout)
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
]

// Methods
const toggleTheme = () => {
  uiStore.toggleTheme()
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
  uiStore.showSuccess('Signed out successfully')
}
</script>
