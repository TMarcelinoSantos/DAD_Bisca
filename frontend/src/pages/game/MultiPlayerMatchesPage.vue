<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { useGameStore } from '@/stores/game'
import { useSocketStore } from '@/stores/socket'
import { useAuthStore } from '@/stores/auth'
import { useAPIStore } from '@/stores/api'
import GameBoard from '@/components/game/GameBoard.vue'

const router = useRouter()
const gameStore = useGameStore()
const socketStore = useSocketStore()
const authStore = useAuthStore()
const apiStore = useAPIStore()

const isLoading = ref(true)
const isGameOver = ref(false)
const isMatchOver = ref(false)
const gameWinner = ref(null)
const matchWinner = ref(null)
const hasSavedGame = ref(false)

// Persist one finished multiplayer game (round of the match)
const saveMultiplayerGame = async () => {
  if (hasSavedGame.value) return

  const game = socketStore.currentGame
  const currentUser = authStore.currentUser

  if (!game || !currentUser) return
  if (!game.player1 || !game.player2 || !game.result) return

  const { result } = game

  const player1Id = game.player1.id
  const player2Id = game.player2.id

  let winnerUserId = null
  let loserUserId = null
  let isDraw = 0

  if (result.winner === 'player') {
    winnerUserId = player1Id
    loserUserId = player2Id
  } else if (result.winner === 'opponent') {
    winnerUserId = player2Id
    loserUserId = player1Id
  } else {
    isDraw = 1
  }

  const payload = {
    type: game.type,
    player1_user_id: player1Id,
    player2_user_id: player2Id,
    is_draw: !!isDraw,
    winner_user_id: winnerUserId,
    loser_user_id: loserUserId,
    match_id: null, // multiplayer match persistence can be added later
    status: 'Ended',
    began_at: game.beganAt ?? null,
    ended_at: game.endedAt ?? null,
    total_time: game.totalTimeSeconds ?? null,
    player1_points: result.playerPoints ?? 0,
    player2_points: result.opponentPoints ?? 0,
    // For now, don't send structured custom data to avoid
    // Array to string conversion issues on the backend.
    custom: null,
  }

  try {
    await apiStore.postGame(payload)
    hasSavedGame.value = true
    // Refresh user coins so any payouts are visible
    await authStore.getUser()
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to save multiplayer game.'
    toast.error(msg)
  }
}

const handleGameFinished = async () => {
  if (isMatchOver.value) return

  const playerPoints = gameStore.playerTotalPoints
  const opponentPoints = gameStore.opponentTotalPoints

  if (playerPoints < opponentPoints) {
    toast.error(`Game Completed - You lost ${playerPoints} to ${opponentPoints}`)
    gameWinner.value = 'opponent'
  } else if (playerPoints > opponentPoints) {
    toast.success(`Game Completed - You won ${playerPoints} to ${opponentPoints}`)
    gameWinner.value = 'player'
  } else {
    toast(`Game Completed - It's a tie ${playerPoints} to ${opponentPoints}`)
    gameWinner.value = 'tie'
  }

  await saveMultiplayerGame()

  // Accumulate match marks using the shared match logic
  gameStore.addMatchPoints()
  isGameOver.value = true

  if (gameStore.playerMarks >= 4) {
    matchWinner.value = 'player'
    isMatchOver.value = true
  } else if (gameStore.opponentMarks >= 4) {
    matchWinner.value = 'opponent'
    isMatchOver.value = true
  }
}

const handleResign = () => {
  const gameId = socketStore.currentGame?.id
  if (!gameId) return

  socketStore.resignGame(gameId, (res) => {
    if (!res?.ok) {
      toast.error(res?.error || 'Failed to resign game')
    }
  })
}

// Start next game in the same match (host only)
const continueMatch = () => {
  const game = socketStore.currentGame
  const currentUser = authStore.currentUser
  if (!game || !currentUser) return

  isGameOver.value = false
  gameWinner.value = null
  hasSavedGame.value = false

  const isHost = game.player1 && game.player1.id === currentUser.id
  if (!isHost) {
    // Only player1 (host) re-deals and syncs the board
    return
  }

  // Locally re-deal a new multiplayer board (keeps match marks)
  gameStore.resetMultiplayerBoard()

  // Push new board to server so both players see next game
  socketStore.syncGameState(game.id)
}

const goDashboard = () => {
  router.push({ name: 'home' })
}

// Watch server state for end of each game (round)
watch(
  () => socketStore.currentGame?.state,
  async (state, prev) => {
    if (state === 'finished' && prev !== 'finished') {
      await handleGameFinished()
    }
  },
)

// Initial guard/load
onMounted(() => {
  if (!socketStore.currentGame) {
    router.push({ name: 'home' })
    return
  }
  isLoading.value = false
})
</script>

<template>
    <GameBoard
      v-if="!isLoading"
      :opponentCards="gameStore.opponentHand"
      :playerCards="gameStore.playerHand"
      :deck="gameStore.deck"
      :trumpCard="gameStore.trumpCard"
      :multiPlayer="true"
      :roomId="String(socketStore.currentGame?.id ?? '')"
    />

    <div v-if="!isLoading" class="mt-4 flex flex-col items-center gap-2">
      <div class="text-sm">
        <span class="font-semibold">Match Marks:</span>
        <span class="ml-2">You {{ gameStore.playerMarks }} - {{ gameStore.opponentMarks }} Opponent</span>
      </div>
    </div>

    <!-- Per-game (round) result -->
    <transition name="fade">
      <div
        v-if="isGameOver && !isMatchOver"
        class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-sm p-6 relative text-gray-900 dark:text-gray-100">
          <div class="flex flex-col items-center gap-2">
            <div class="text-lg font-semibold">Game terminado</div>

            <div class="flex gap-4">
              <div class="text-gray-700 dark:text-gray-300 font-semibold">
                Jogador: <span class="text-gray-900 dark:text-gray-100">{{ gameStore.playerTotalPoints }}</span>
              </div>
              <div class="text-gray-700 dark:text-gray-300 font-semibold">
                Oponente: <span class="text-gray-900 dark:text-gray-100">{{ gameStore.opponentTotalPoints }}</span>
              </div>
            </div>

            <div class="text-sm mt-2 text-gray-600 dark:text-gray-300">
              Match marks — Você: <strong>{{ gameStore.playerMarks }}</strong> ·
              Oponente: <strong>{{ gameStore.opponentMarks }}</strong>
            </div>

            <div class="flex gap-4 mt-4">
              <button
                @click="continueMatch"
                class="py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
              >
                Continuar a Match
              </button>
              <button
                @click="goDashboard"
                class="py-2 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Match result -->
    <transition name="fade">
      <div
        v-if="isMatchOver"
        class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-sm p-6 relative text-gray-900 dark:text-gray-100">
          <h2 class="text-xl font-bold text-center mb-3">Resultado da Match</h2>

          <div class="text-center text-lg mb-2">
            <span v-if="matchWinner === 'player'" class="text-green-600 font-bold">
              Ganhou a match!
            </span>
            <span v-else-if="matchWinner === 'opponent'" class="text-red-600 font-bold">
              Perdeu a match!
            </span>
          </div>

          <div class="text-center mb-3 text-gray-700 dark:text-gray-300">
            <div>Jogador: <strong>{{ gameStore.playerMarks }}</strong> marks</div>
            <div>Oponente: <strong>{{ gameStore.opponentMarks }}</strong> marks</div>
          </div>

          <div class="flex gap-4 mt-4 justify-center">
            <button
              @click="goDashboard"
              class="py-2 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </transition>
</template>