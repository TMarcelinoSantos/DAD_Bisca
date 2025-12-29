import { defineStore } from 'pinia'
import { inject, ref } from 'vue'
import { useAuthStore } from './auth'

export const useSocketStore = defineStore('socket', () => {
    const socket = inject('socket')
    const authStore = useAuthStore()

    const joined = ref(false)

    const emitJoin = (user) => {
        if (joined.value) return
        console.log(`[Socket] Joining Server`)
        socket.emit('join', user)
        joined.value = true
    }

    const emitLeave = () => {
        socket.emit('leave')
        console.log(`[Socket] Leaving Server`)
        joined.value = false
    }

    const handleConnection = () => {
      socket.on('connect', () => {
          console.log(`[Socket] Connected -- ${socket.id}`)
          if (authStore.isLoggedIn && !joined.value) {
                emitJoin(authStore.currentUser)
            }
        })

        socket.on('disconnect', () => {
            joined.value = false
            console.log(`[Socket] Disconnected -- ${socket.id}`)
        })
    }

    return {
      emitJoin,
      emitLeave,
      handleConnection,
    }
})