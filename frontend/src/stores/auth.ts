/**
 * Authentication Store
 * Manages user authentication, login, registration, and user profile
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface User {
  id: number
  username: string
  email: string
  role: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Configure axios interceptors
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, credentials)
      
      const { token: authToken, user: userData } = response.data
      
      token.value = authToken
      user.value = userData
      
      // Store token in localStorage
      localStorage.setItem('auth_token', authToken)
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      return { success: true, message: 'Login successful' }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed'
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, data)
      
      const { token: authToken, user: userData } = response.data
      
      token.value = authToken
      user.value = userData
      
      // Store token in localStorage
      localStorage.setItem('auth_token', authToken)
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      return { success: true, message: 'Registration successful' }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed'
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    error.value = null
    
    // Remove token from localStorage
    localStorage.removeItem('auth_token')
    
    // Remove axios header
    delete axios.defaults.headers.common['Authorization']
  }

  const fetchProfile = async () => {
    if (!token.value) return

    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/auth/profile`)
      user.value = response.data.user
      return { success: true }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch profile'
      error.value = message
      
      // If token is invalid, logout
      if (err.response?.status === 401) {
        logout()
      }
      
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize user if token exists
  const initialize = async () => {
    if (token.value) {
      await fetchProfile()
    }
    initialized.value = true
  }
  
  const initializeAuth = async () => {
    return await initialize()
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    initialized,
    
    // Computed
    isAuthenticated,
    isAdmin,
    
    // Actions
    login,
    register,
    logout,
    fetchProfile,
    clearError,
    initialize,
    initializeAuth
  }
})
