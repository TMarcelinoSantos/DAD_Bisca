import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, inject } from 'vue'
import { toast } from 'vue-sonner'

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

  // HISTORY
  const getHistory = () => {
    return axios.get(`${API_BASE_URL}/users/me/history`)
  }

  const getMatchDetails = (matchId) => {
    return axios.get(`${API_BASE_URL}/users/me/history/${matchId}`)
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
  const postUser = (user) =>{
    return axios.post(`${API_BASE_URL}/users`, user)
  }

  const getUsers = () => {
    return axios.get(`${API_BASE_URL}/users`)
  }

  const getUser = (userId) => {
    return axios.get(`${API_BASE_URL}/users/${userId}`)
  }

  const getAuthUser = () => {
    return axios.get(`${API_BASE_URL}/users/me`)
  }

  const putUser = (user) => {
    return axios.put(`${API_BASE_URL}/users/${user.id}`, user)
  }

  const patchUserPhoto = (id, filename) => {
    return axios.patch(`${API_BASE_URL}/users/${id}/photo-url`, filename)
  }

  const patchUserBlocked = (id, blocked) => {
    return axios.patch(`${API_BASE_URL}/users/${id}/block`, { blocked })
  }

  const patchUserType = (id, type) => {
    return axios.patch(`${API_BASE_URL}/users/${id}/updateType`, { type })
  }

  const blockUser = (userId) => {
    return patchUserBlocked(userId, true)
  }

  const unblockUser = (userId) => {
    return patchUserBlocked(userId, false)
  }

  const deleteUser = (userId) => {
    return axios.delete(`${API_BASE_URL}/users/${userId}`)
  }

  const verifyPassword = async (userId, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/verify-password`, {
        password,
      });
      return response.data.verified;
    } catch (error) {
      //console.error('Failed to verify password', error);
      return false;
    }
  } 

  //Coins
  const purchaseCoins = (payload) =>{
    return axios.post(`${API_BASE_URL}/coin-purchases`, payload)
  }

  const getMyCoinTransactions =() =>{
    return axios.get(`${API_BASE_URL}/coins/transactions/me`)
  }

  const getUserCoinTransactions = (userId) => {
    return axios.get(`${API_BASE_URL}/coins/transactions/${userId}`)
  }

  //Card Themes
  const updateUserTheme = async (themeId, price) => {
    return await axios.post(`${API_BASE_URL}/user/theme/buy`, { theme: themeId, price})
  }

  const changeCardTheme = async (themeId) => {
    return await axios.post(`${API_BASE_URL}/user/theme`, { theme: themeId})
  }

  // Files
  const uploadProfilePhoto = async (file) => {
    const formData = new FormData()
    formData.append('photo', file)

    const uploadPromise = axios.post(`${API_BASE_URL}/files/userphoto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    toast.promise(uploadPromise, {
      loading: 'Uploading profile photo...',
      success: () => `Profile photo uploaded successfully`,
      error: (data) => `Error uploading photo - ${data?.response?.data?.message}`,
    })

    return uploadPromise
  }

  // STATS
  const getPersonalStats = () => {
    return axios.get(`${API_BASE_URL}/users/me/stats`)
  }

  // LEADERBOARDS
  const getGlobalLeaderboards = (limit = 10) => {
    return axios.get(`${API_BASE_URL}/leaderboards?limit=${limit}`)
  }

  // STATISTICS
  const getStatistics = () => {
    return axios.get(`${API_BASE_URL}/statistics`)
  }

  const getAdminUsersList = () => {
    return axios.get(`${API_BASE_URL}/admin/statistics/users`)
  }

  const getAdminUserStatistics = (userId) => {
    return axios.get(`${API_BASE_URL}/admin/statistics/users/${userId}`)
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
    getUser,
    postUser,
    getUsers,
    getAuthUser,
    putUser,
    patchUserPhoto,
    patchUserType,
    blockUser,
    unblockUser,
    deleteUser,
    verifyPassword,
    postRound,
    getRound,
    updateRound,
    purchaseCoins,
    getMyCoinTransactions,
    getUserCoinTransactions,
    updateUserTheme,
    changeCardTheme,
    uploadProfilePhoto,
    getHistory,
    getMatchDetails,
    getPersonalStats,
    getGlobalLeaderboards,
    getStatistics,
    getAdminUsersList,
    getAdminUserStatistics,
  }
})
