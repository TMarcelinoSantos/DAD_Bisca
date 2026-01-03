import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAPIStore } from './api.js'
import {useSocketStore} from './socket.js'

export const useAuthStore = defineStore('auth', () => {
  const apiStore = useAPIStore()
  const socketStore = useSocketStore()

  const currentUser = ref(undefined)

  const isLoggedIn = computed(() => {
    return currentUser.value !== undefined
  })

  const isAdmin = computed(() => {
    if(currentUser.value===undefined) return false
    return currentUser.value.type === 'A'
  })

  const login = async (credentials) => {
    await apiStore.postLogin(credentials)
    await getUser()
    socketStore.emitJoin(currentUser.value)
  }

  const logout = async () => {
    await apiStore.postLogout()
    socketStore.emitLeave()
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
