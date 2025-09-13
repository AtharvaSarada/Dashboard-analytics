<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Mobile Navigation -->
    <MobileNav :is-open="showMobileNav" @close="showMobileNav = false" />
    
    <!-- Desktop Sidebar -->
    <aside 
      :class="[
        'hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30',
        sidebarCollapsed ? 'w-16' : 'w-64',
        'flex-shrink-0'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div v-if="!sidebarCollapsed" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">A</span>
          </div>
          <span class="text-xl font-bold text-gray-900 dark:text-white">Analytics</span>
        </div>
        <div v-else class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">A</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-4 space-y-2">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
            $route.path === item.href
              ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3 flex-shrink-0" />
          <span v-if="!sidebarCollapsed">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- User Menu -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-4">
        <div v-if="!sidebarCollapsed" class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-medium">
              {{ user?.username?.charAt(0).toUpperCase() || 'U' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ user?.username || 'User' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ user?.role || 'Member' }}
            </p>
          </div>
        </div>
        <div v-else class="flex justify-center">
          <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-medium">
              {{ user?.username?.charAt(0).toUpperCase() || 'U' }}
            </span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <!-- Left side -->
        <div class="flex items-center space-x-4">
          <!-- Mobile menu button -->
          <button
            @click="showMobileNav = true"
            class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <Bars3Icon class="w-5 h-5" />
          </button>
          
          <!-- Desktop sidebar toggle -->
          <button
            @click="toggleSidebar"
            class="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <Bars3Icon class="w-5 h-5" />
          </button>
          
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ pageTitle }}
            </h1>
            <p v-if="pageDescription" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ pageDescription }}
            </p>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-4">
          <!-- Connection Status -->
          <div class="flex items-center space-x-2">
            <div 
              :class="[
                'w-2 h-2 rounded-full',
                connectionStatusColor
              ]"
            ></div>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ connected ? 'Live' : 'Offline' }}
            </span>
          </div>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <SunIcon v-if="isDark" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <BellIcon class="w-5 h-5" />
              <span v-if="hasNotifications" class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800"></span>
            </button>
          </div>

          <!-- User Menu -->
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <UserCircleIcon class="w-6 h-6" />
              <ChevronDownIcon class="w-4 h-4" />
            </button>

            <!-- User Dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
            >
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</a>
              <hr class="my-1 border-gray-200 dark:border-gray-600">
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
        <router-view />
      </main>
    </div>

    <!-- Notification Toast -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
          'transform transition-all duration-300 ease-in-out'
        ]"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon v-if="notification.type === 'success'" class="h-6 w-6 text-green-400" />
              <XCircleIcon v-else-if="notification.type === 'error'" class="h-6 w-6 text-red-400" />
              <ExclamationTriangleIcon v-else-if="notification.type === 'warning'" class="h-6 w-6 text-yellow-400" />
              <InformationCircleIcon v-else class="h-6 w-6 text-blue-400" />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ notification.title }}</p>
              <p v-if="notification.message" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ notification.message }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HomeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  DocumentChartBarIcon
} from '@heroicons/vue/24/outline'

// Import components
import MobileNav from './MobileNav.vue'

// Import stores
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useAnalyticsStore } from '@/stores/analytics'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const analyticsStore = useAnalyticsStore()

// Reactive references
const showUserMenu = ref(false)
const showMobileNav = ref(false)

// Computed properties
const user = computed(() => authStore.user)
const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed)
const isDark = computed(() => uiStore.isDark)
const notifications = computed(() => uiStore.notifications)
const hasNotifications = computed(() => uiStore.hasNotifications)
const connected = computed(() => analyticsStore.connected)
const connectionStatusColor = computed(() => analyticsStore.connectionStatusColor)

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
]

// Page metadata
const pageTitle = computed(() => {
  const route = router.currentRoute.value
  const navItem = navigation.find(item => item.href === route.path)
  return navItem?.name || 'Dashboard'
})

const pageDescription = computed(() => {
  const descriptions: { [key: string]: string } = {
    '/': 'Real-time analytics overview and key metrics',
    '/analytics': 'Detailed analytics data and insights',
    '/reports': 'Comprehensive reports and analysis',
    '/users': 'User management and analytics',
    '/settings': 'Application settings and preferences'
  }
  return descriptions[router.currentRoute.value.path]
})

// Methods
const toggleSidebar = () => {
  uiStore.toggleSidebar()
}

const toggleTheme = () => {
  uiStore.toggleTheme()
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
  uiStore.showSuccess('Signed out successfully')
}

const removeNotification = (id: string) => {
  uiStore.removeNotification(id)
}

// Close user menu when clicking outside (simplified)
// Note: For production, consider using @vueuse/core for onClickOutside

onMounted(() => {
  // Initialize UI preferences
  uiStore.initializePreferences()
  
  // Initialize analytics
  analyticsStore.initialize()
})
</script>
