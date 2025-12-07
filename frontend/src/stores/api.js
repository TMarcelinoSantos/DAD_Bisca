import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, inject } from 'vue'

export const useAPIStore = defineStore('api', () => {
  const API_BASE_URL = inject('apiBaseURL')

  const token = ref()

  const postGame = (game) => {
    return axios.post(`${API_BASE_URL}/games`, game)
  }

  const getGames = () => {
    return axios.get(`${API_BASE_URL}/games`)
  }

  //SINGLEGAME
  const postSingleGame = (game) => {
    return axios.post(`${API_BASE_URL}/games_single`, game)
  }

  const getSingleGames = () => {
    return axios.get(`${API_BASE_URL}/games_single`)
  }

  const updateSingleGame = (gameId, data) => {
    return axios.put(`${API_BASE_URL}/games_single/${gameId}`, data)
  }

  //MATCH
  const postSingleMatch = (match) => {
    return axios.post(`${API_BASE_URL}/single_match`, match)
  }

  const getSingleMatch = () => {
    return axios.get(`${API_BASE_URL}/single_match`)
  }

  const updateSingleMatch = (matchId, data) => {
    return axios.put(`${API_BASE_URL}/single_match/${matchId}`, data)
  }

  //ROUND
  const postRound= (round) => {
    return axios.post(`${API_BASE_URL}/rounds`, round)
  }

  const getRound = () => {
    return axios.get(`${API_BASE_URL}/rounds`)
  }

  const updateRound = (roundId, data) => {
    return axios.put(`${API_BASE_URL}/rounds/${roundId}`, data)
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
    getGames,
    postSingleGame,
    getSingleGames,
    updateSingleGame,
    postSingleMatch,
    getSingleMatch,
    updateSingleMatch,
    postLogin,
    postLogout,
    getAuthUser,
    postRound,
    getRound,
    updateRound
  }
})
