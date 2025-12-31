import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAPIStore } from './api.js'

export const useAuthStore = defineStore('auth', () => {
  const apiStore = useAPIStore()

  const currentUser = ref(undefined)

  const isLoggedIn = computed(() => {
    return currentUser.value !== undefined
  })

  const isAdmin = computed(() => {
    return currentUser.value.type === 'A'
  })

  const login = async (credentials) => {
    await apiStore.postLogin(credentials)
    await getUser()
  }

  const logout = async () => {
    await apiStore.postLogout()
    currentUser.value = undefined
  }

  const register = async (formData) => {
    const response = await apiStore.postUser(formData)
    return response
  }

  const getUser = async () => {
    const response = await apiStore.getAuthUser()
    currentUser.value = response.data
  }

  return {
    currentUser,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    register,
    getUser,
  }
})
