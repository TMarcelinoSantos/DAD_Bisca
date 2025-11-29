import { createApp } from 'vue'
import { io } from 'socket.io-client'
import { createPinia } from 'pinia'

import App from './App.vue'
import AboutPage from '@/pages/about/AboutPage.vue'
import GameBoard from './components/game/GameBoard.vue'
import router from './router'

const API_BASE_URL = 'http://localhost:8000/api'
//const app = createApp(AboutPage)
const app = createApp(App)
//const app = createApp(GameBoard)

const socket = io('http://localhost:3000')
app.provide('socket', socket)
app.provide('apiBaseURL', API_BASE_URL)

app.use(createPinia())
app.use(router)

app.mount('#app')
