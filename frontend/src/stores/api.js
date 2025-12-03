import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, inject } from 'vue'

export const useAPIStore = defineStore('api', () => {
  const API_BASE_URL = inject('apiBaseURL')

  const token = ref()

  const postGame = (game) => {
    return axios.post(`${API_BASE_URL}/games`, game)
  }

  const postSingleGame = (game) => {
    return axios.post(`${API_BASE_URL}/games_single`, game)
  }

  const postSingleMatch = (match) => {
    return axios.post(`${API_BASE_URL}/single_match`, match)
  }

  const getGames = () => {
    return axios.get(`${API_BASE_URL}/games`)
  }
  const getSingleGames = () => {
    return axios.get(`${API_BASE_URL}/games_single`)
  }
  const getSingleMatch = () => {
    return axios.get(`${API_BASE_URL}/single_match`)
  }

  const updateSingleMatch = (matchId, data) => {
    return axios.put(`${API_BASE_URL}/single_match/${matchId}`, data)
  }

  // AUTH
  const postLogin = async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials)
    token.value = response.data.token
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  const postLogout = async () => {
    await axios.post(`${API_BASE_URL}/logout`)
    token.value = undefined
    delete axios.defaults.headers.common['Authorization']
  }

  // Users
  const getAuthUser = () => {
    return axios.get(`${API_BASE_URL}/users/me`)
  }

  return {
    postGame,
    postSingleGame,
    postSingleMatch,
    getGames,
    getSingleGames,
    getSingleMatch,
    postLogin,
    postLogout,
    getAuthUser,
    updateSingleMatch
  }
})
