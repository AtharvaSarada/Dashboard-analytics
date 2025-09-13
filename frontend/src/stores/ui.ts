/**
 * UI Store
 * Manages application theme, layout preferences, and UI state
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

type Theme = 'light' | 'dark' | 'auto'
type SidebarState = 'expanded' | 'collapsed' | 'hidden'

interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

interface Notification extends NotificationOptions {
  id: string
  timestamp: number
}

export const useUIStore = defineStore('ui', () => {
  // State
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'auto')
  const sidebarState = ref<SidebarState>('expanded')
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Layout preferences
  const compactMode = ref(false)
  const showMiniSidebar = ref(false)
  const animationsEnabled = ref(true)
  const soundEnabled = ref(false)
  
  // Modal and overlay states
  const modalOpen = ref(false)
  const overlayVisible = ref(false)
  const currentModal = ref<string | null>(null)

  // Computed
  const isDark = computed(() => {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    // Auto mode - detect system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const currentThemeClass = computed(() => {
    return isDark.value ? 'dark' : 'light'
  })

  const sidebarCollapsed = computed(() => {
    return sidebarState.value === 'collapsed' || sidebarState.value === 'hidden'
  })

  const hasNotifications = computed(() => {
    return notifications.value.length > 0
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.persistent)
  })

  // Actions
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(theme.value)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const applyTheme = () => {
    const html = document.documentElement
    
    if (isDark.value) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
  }

  const setSidebarState = (state: SidebarState) => {
    sidebarState.value = state
  }

  const toggleSidebar = () => {
    if (sidebarState.value === 'expanded') {
      sidebarState.value = 'collapsed'
    } else {
      sidebarState.value = 'expanded'
    }
  }

  const addNotification = (options: NotificationOptions) => {
    const notification: Notification = {
      ...options,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      duration: options.duration || (options.type === 'error' ? 8000 : 4000)
    }

    notifications.value.unshift(notification)

    // Auto-remove non-persistent notifications
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
    }

    return notification.id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  const showSuccess = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration })
  }

  const showError = (title: string, message?: string, persistent = false) => {
    return addNotification({ type: 'error', title, message, persistent })
  }

  const showWarning = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration })
  }

  const showInfo = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration })
  }

  const openModal = (modalId: string) => {
    currentModal.value = modalId
    modalOpen.value = true
    overlayVisible.value = true
    document.body.classList.add('modal-open')
  }

  const closeModal = () => {
    currentModal.value = null
    modalOpen.value = false
    overlayVisible.value = false
    document.body.classList.remove('modal-open')
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const setCompactMode = (enabled: boolean) => {
    compactMode.value = enabled
    localStorage.setItem('compactMode', enabled.toString())
  }

  const setAnimations = (enabled: boolean) => {
    animationsEnabled.value = enabled
    localStorage.setItem('animationsEnabled', enabled.toString())
    
    // Apply or remove animations class
    if (enabled) {
      document.documentElement.classList.remove('no-animations')
    } else {
      document.documentElement.classList.add('no-animations')
    }
  }

  const setSound = (enabled: boolean) => {
    soundEnabled.value = enabled
    localStorage.setItem('soundEnabled', enabled.toString())
  }

  const resetPreferences = () => {
    setTheme('auto')
    setSidebarState('expanded')
    setCompactMode(false)
    setAnimations(true)
    setSound(false)
    clearAllNotifications()
  }

  // Initialize preferences from localStorage
  const initializePreferences = () => {
    // Load compact mode
    const savedCompactMode = localStorage.getItem('compactMode')
    if (savedCompactMode !== null) {
      compactMode.value = savedCompactMode === 'true'
    }

    // Load animations preference
    const savedAnimations = localStorage.getItem('animationsEnabled')
    if (savedAnimations !== null) {
      animationsEnabled.value = savedAnimations === 'true'
    }

    // Load sound preference
    const savedSound = localStorage.getItem('soundEnabled')
    if (savedSound !== null) {
      soundEnabled.value = savedSound === 'true'
    }

    // Apply initial theme
    applyTheme()
    
    // Apply animations setting
    setAnimations(animationsEnabled.value)
  }

  // Watchers
  watch(isDark, () => {
    applyTheme()
  })

  // Listen for system theme changes when in auto mode
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'auto') {
        applyTheme()
      }
    })
  }

  return {
    // State
    theme,
    sidebarState,
    notifications,
    loading,
    error,
    compactMode,
    showMiniSidebar,
    animationsEnabled,
    soundEnabled,
    modalOpen,
    overlayVisible,
    currentModal,

    // Computed
    isDark,
    currentThemeClass,
    sidebarCollapsed,
    hasNotifications,
    unreadNotifications,

    // Actions
    setTheme,
    toggleTheme,
    applyTheme,
    setSidebarState,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    openModal,
    closeModal,
    setLoading,
    setError,
    clearError,
    setCompactMode,
    setAnimations,
    setSound,
    resetPreferences,
    initializePreferences
  }
})
