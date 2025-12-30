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

  const deleteUser = (userId) => {
    return axios.delete(`${API_BASE_URL}/users/${userId}`)
  }

  const patchUserBlocked = (id, blocked) => {
    return axios.patch(`${API_BASE_URL}/users/${id}/block`, { blocked })
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
    deleteUser,
    verifyPassword,
    postRound,
    getRound,
    updateRound,
    uploadProfilePhoto,
  }
})
