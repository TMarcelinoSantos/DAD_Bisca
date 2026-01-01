import { defineStore } from 'pinia'
import { inject, ref } from 'vue'
import { useAuthStore } from './auth'
import { useGameStore } from './game'

export const useSocketStore = defineStore('socket', () => {
    const socket = inject('socket')
    const authStore = useAuthStore()
    const gameStore = useGameStore()

    const joined = ref(false)

    const currentGame = ref(null)
    const joinableGames = ref([])

    const emitJoin = (user) => {
        if (joined.value) return
        console.log('[Socket] Joining Server')
        socket.emit('join', user)
        joined.value = true
    }

    const emitLeave = () => {
        socket.emit('leave')
        console.log('[Socket] Leaving Server')
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

    // ---- GAME EMITS ----

    const createGame = (cb) => {
        socket.emit('game:create', (res) => {
            if (res?.ok) {
                currentGame.value = res.game
                gameStore.setActiveMultiplayerGame(res.game)
                console.log('[Socket] game:create ok', res.game)
            } else {
                console.error('[Socket] game:create failed', res?.error)
            }
            cb && cb(res)
        })
    }

    const requestJoinableGames = (cb) => {
        socket.emit('game:list', (res) => {
            if (res?.ok) {
                joinableGames.value = res.games ?? []
                gameStore.setGames(res.games ?? [])
                console.log('[Socket] game:list ok | count', joinableGames.value.length)
            } else {
                console.error('[Socket] game:list failed', res?.error)
            }
            cb && cb(res)
        })
    }

    const joinGame = (gameID, cb) => {
        socket.emit('game:join', { gameID }, (res) => {
            if (res?.ok) {
                currentGame.value = res.game
                gameStore.setActiveMultiplayerGame(res.game)
                console.log('[Socket] game:join ok', res.game)
            } else {
                console.error('[Socket] game:join failed', res?.error)
            }
            cb && cb(res)
        })
    }

    const leaveGame = (gameID, cb) => {
        socket.emit('game:leave', { gameID }, (res) => {
            if (res?.ok) {
                if (currentGame.value?.id === gameID) {
                    currentGame.value = null
                    gameStore.resetMultiplayer()
                }
                console.log('[Socket] game:leave ok')
            } else {
                console.error('[Socket] game:leave failed', res?.error)
            }
            cb && cb(res)
        })
    }

    const syncGameState = (gameID) => {
        const id = Number(gameID)
        if (!Number.isFinite(id)) return

        const board = gameStore.getBoardSnapshot()
        socket.emit('game:sync', { gameID: id, board }, (res) => {
            if (!res?.ok) {
                console.error('[Socket] game:sync failed', res?.error)
            }
        })
    }

    const emitPlayCard = (gameID, card) => {
        const id = Number(gameID)
        if (!Number.isFinite(id)) return

        socket.emit(
            'game:move',
            {
                gameID: id,
                move: {
                    type: 'play-card',
                    card,
                },
            },
            (res) => {
                if (!res?.ok) {
                    console.error('[Socket] game:move failed', res?.error)
                }
            },
        )
    }

    const handleGameEvents = () => {
      socket.on('game:updated', (game) => {
          console.log('[Socket] game:updated', game)
          currentGame.value = game

          // Determine this client's seat based on authenticated user id
          const currentUser = authStore.currentUser
          let seat = 'player1'
          if (currentUser && game.player2 && game.player2.id === currentUser.id) {
              seat = 'player2'
          }

          // Consider the board "uninitialized" only when all piles are empty
          const board = game.board
          const boardUninitialized =
              !board ||
              (!board.deck?.length &&
                  !board.playerHand?.length &&
                  !board.opponentHand?.length &&
                  !board.playedCards?.length)

          if (game.state === 'playing' && boardUninitialized && seat === 'player1') {
              // Host (player1) initializes the board once at game start
              gameStore.setBoardMultiplayer()
              syncGameState(game.id)
              return
          }

          // After board exists on server, just sync from it
          gameStore.syncFromServerGame({ ...game, _seat: seat })
      })

      socket.on('game:closed', ({ id }) => {
          console.log('[Socket] game:closed', id)
          if (currentGame.value?.id === id) {
              currentGame.value = null
              gameStore.resetMultiplayer()
          }
      })
  }

    return {
        joined,
        currentGame,
        joinableGames,
        handleConnection,
        emitJoin,
        emitLeave,
        createGame,
        requestJoinableGames,
        joinGame,
        leaveGame,
        emitPlayCard,
        syncGameState,
        handleGameEvents,
    }
})