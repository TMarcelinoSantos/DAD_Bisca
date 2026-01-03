<template>
  <div
    class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-transparent"
  >
    <div class="fixed inset-0 -z-10 pointer-events-none">
      <Balatro
        :is-rotate="false"
        :mouse-interaction="false"
        :pixel-filter="700"
        :color1="'#5CA173'"
        :color2="'#0D5E1C'"
      />
    </div>

    <div class="w-full max-w-6xl">
      <!-- Header card -->
      <div
        class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6"
      >
        <div class="text-center">
          <h1
            class="text-4xl sm:text-5xl font-bold text-yellow-700 tracking-widest uppercase mb-2"
          >
            Game Modes
          </h1>
          <p class="text-sm sm:text-base text-yellow-800/80">
            Choose between single and multiplayer games and matches.
          </p>
        </div>
      </div>

      <!-- GAMES section -->
      <div
        class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6"
      >
        <h2
          class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-4 text-center"
        >
          Games
        </h2>
        <div
          class="flex flex-col md:flex-row justify-center items-stretch gap-5 mt-4"
        >
          <!-- Single Player Game -->
          <Card class="w-full max-w-md">
            <CardHeader>
              <CardTitle class="text-3xl font-bold text-center">
                Single Player
              </CardTitle>
              <CardDescription class="text-center">
                Play a game against the computer.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-medium">Choose Type</label>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    v-for="level in gameStore.hands"
                    :key="level.value"
                    size="sm"
                    :variant="selectedGameHand === level.value ? 'default' : 'outline'"
                    class="flex flex-col py-3 h-16"
                    @click="selectedGameHand = level.value"
                  >
                    <span class="front-semibold">{{ level.label }}</span>
                  </Button>
                </div>
              </div>
              <div class="flex justify-center">
                <Button
                  @click="startGame"
                  size="lg"
                  variant="secondary"
                  class="hover:bg-purple-500 hover:text-slate-200"
                  :disabled="isAdmin"
                >
                  Start Game
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Multiplayer Game -->
          <Card class="w-full max-w-md">
            <CardHeader>
              <CardTitle class="text-3xl font-bold text-center">
                MultiPlayer
              </CardTitle>
              <CardDescription class="text-center">
                Play online with other players.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <p class="text-sm text-center text-amber-300">
                Entering a multiplayer game (hosting or joining) costs
                <span class="font-semibold">2 coins</span>.
              </p>
              <div class="space-y-2">
                <label class="text-sm font-medium">Choose Type</label>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    v-for="level in gameStore.hands"
                    :key="level.value"
                    size="sm"
                    :variant="selectedMultiplayerHand === level.value ? 'default' : 'outline'"
                    class="flex flex-col py-3 h-16"
                    @click="selectedMultiplayerHand = level.value"
                  >
                    <span class="front-semibold">{{ level.label }}</span>
                  </Button>
                </div>
              </div>
              <p
                v-if="!isLoggedIn"
                class="text-sm text-red-400 text-center"
              >
                Multiplayer is only available for logged in users. Please
                log in to host or join a game.
              </p>
              <div class="space-y-4">
                <div class="flex justify-center gap-3">
                  <Button
                    size="lg"
                    variant="secondary"
                    class="hover:bg-emerald-500 hover:text-slate-200"
                    :disabled="!isLoggedIn || isAdmin"
                    @click="hostMultiplayerGame"
                  >
                    Host Game
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    class="border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-slate-200"
                    :disabled="isLoadingRooms || !isLoggedIn"
                    @click="loadRooms"
                  >
                    {{ isLoadingRooms ? 'Loading...' : 'Refresh Rooms' }}
                  </Button>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium">Available Rooms</label>
                  <div
                    v-if="simpleJoinableGames.length === 0"
                    class="text-sm text-gray-500 mt-1"
                  >
                    No rooms available. Host a new game.
                  </div>
                  <ul
                    v-else
                    class="mt-2 space-y-2 max-h-48 overflow-y-auto"
                  >
                    <li
                      v-for="game in simpleJoinableGames"
                      :key="game.id"
                      class="flex items-center justify-between rounded border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-50"
                    >
                      <span>
                        Room #{{ game.id }} ·
                        {{ game.type === '3' ? 'Bisca de 3' : 'Bisca de 9' }} ·
                        {{ (game.player1 && game.player1.username) || 'Waiting for players' }}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        class="hover:bg-emerald-500 hover:text-slate-200"
                        :disabled="!isLoggedIn"
                        @click="joinMultiplayerGame(game.id)"
                      >
                        Join
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- MATCHES section -->
      <div
        class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
        <h2
          class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-4 text-center"
        >
          Matches
        </h2>
        <div
          class="flex flex-col md:flex-row justify-center items-stretch gap-5 mt-4"
        >
          <!-- Single Player Match -->
          <Card class="w-full max-w-md">
            <CardHeader>
              <CardTitle class="text-3xl font-bold text-center">
                Single Player
              </CardTitle>
              <CardDescription class="text-center">
                Play a match against the computer.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-medium">Choose Type</label>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    v-for="level in gameStore.hands"
                    :key="level.value"
                    size="sm"
                    :variant="selectedMatchHand === level.value ? 'default' : 'outline'"
                    class="flex flex-col py-3 h-16"
                    @click="selectedMatchHand = level.value"
                  >
                    <span class="front-semibold">{{ level.label }}</span>
                  </Button>
                </div>
              </div>

              <div class="flex justify-center">
                <Button
                  @click="startMatch"
                  size="lg"
                  variant="secondary"
                  class="hover:bg-purple-500 hover:text-slate-200"
                  :disabled="isAdmin"
                >
                  Start Match
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Multiplayer Match -->
          <Card class="w-full max-w-md">
            <CardHeader>
              <CardTitle class="text-3xl font-bold text-center">
                MultiPlayer
              </CardTitle>
              <CardDescription class="text-center">
                Play a full multiplayer match. First to 4 marks wins.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-medium">Choose Type</label>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    v-for="level in gameStore.hands"
                    :key="level.value"
                    size="sm"
                    :variant="selectedMultiplayerMatchHand === level.value ? 'default' : 'outline'"
                    class="flex flex-col py-3 h-16"
                    @click="selectedMultiplayerMatchHand = level.value"
                  >
                    <span class="front-semibold">{{ level.label }}</span>
                  </Button>
                </div>
              </div>

              <p
                v-if="!isLoggedIn"
                class="text-sm text-red-400 text-center"
              >
                Multiplayer matches are only available for logged in users. Please
                log in to host or join a match game.
              </p>

              <div class="space-y-4">
                <div class="flex justify-center gap-3">
                  <Button
                    size="lg"
                    variant="secondary"
                    class="hover:bg-emerald-500 hover:text-slate-200"
                    :disabled="!isLoggedIn"
                    @click="hostMultiplayerMatchGame"
                  >
                    Host Game
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    class="border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-slate-200"
                    :disabled="isLoadingMatchRooms || !isLoggedIn"
                    @click="loadMatchRooms"
                  >
                    {{ isLoadingMatchRooms ? 'Loading...' : 'Refresh Rooms' }}
                  </Button>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium">Available Rooms</label>
                  <div
                    v-if="matchJoinableGames.length === 0"
                    class="text-sm text-gray-500 mt-1"
                  >
                    No rooms available. Host a new game.
                  </div>
                  <ul
                    v-else
                    class="mt-2 space-y-2 max-h-48 overflow-y-auto"
                  >
                    <li
                      v-for="game in matchJoinableGames"
                      :key="game.id"
                      class="flex items-center justify-between rounded border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-50"
                    >
                      <span>
                        Room #{{ game.id }} ·
                        {{ game.type === '3' ? 'Bisca de 3' : 'Bisca de 9' }} ·
                        Stake: {{ game.stake ?? 2 }} coins ·
                        {{ (game.player1 && game.player1.username) || 'Waiting for players' }}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        class="hover:bg-emerald-500 hover:text-slate-200"
                        :disabled="!isLoggedIn"
                        @click="joinMultiplayerMatchGame(game.id)"
                      >
                        Join
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useSocketStore } from '@/stores/socket'
import { useAuthStore } from '@/stores/auth'
import { useAPIStore } from '@/stores/api'
import { toast } from 'vue-sonner'
import Balatro from '@/components/ui/Balatro.vue'

const gameStore = useGameStore()
const socketStore = useSocketStore()
const authStore = useAuthStore()
const apiStore = useAPIStore()

const router = useRouter()
const selectedGameHand = ref('')
const selectedMatchHand = ref('')
const selectedMultiplayerHand = ref('9')
const selectedMultiplayerMatchHand = ref('9')
const isLoadingRooms = ref(false)
const isLoadingMatchRooms = ref(false)
const isLoggedIn = computed(() => authStore.isLoggedIn)
const isAdmin = computed(() => authStore.currentUser?.type === 'A')

// Separate views of joinable games: regular multiplayer vs match rooms
const simpleJoinableGames = computed(() =>
  socketStore.joinableGames.filter((g) => !g.mode || g.mode === 'game'),
)

const matchJoinableGames = computed(() =>
  socketStore.joinableGames.filter((g) => g.mode === 'match'),
)

const startGame = () => {
  if (isAdmin.value) return
  gameStore.hand = selectedGameHand.value
  router.push({ name: 'singleplayer' })
}

const startMatch = () => {
  gameStore.hand = selectedMatchHand.value
  router.push({ name: 'singlematches' })
}

const hostMultiplayerMatchGame = async () => {
    if (!isLoggedIn.value) {
        router.push({ name: 'login' })
        return
    }

    // Ask the host which stake they want for this match (1–100)
    const input = window.prompt('Choose match stake (1–100 coins):', '2')
    if (input === null) return

    const stake = Number.parseInt(input, 10)
    if (!Number.isFinite(stake) || stake < 1 || stake > 100) {
        toast.error('Stake must be a number between 1 and 100.')
        return
    }

    try {
        const response = await apiStore.stakeMultiplayerGame(stake)

        if (response?.data?.coins_balance !== undefined && authStore.currentUser) {
            authStore.currentUser.coins_balance = response.data.coins_balance
        } else {
            await authStore.getUser()
        }
    } catch (err) {
        const msg =
            err?.response?.data?.message ||
            'Unable to pay multiplayer entry fee.'
        toast.error(msg)
        return
    }

    // Start a fresh multiplayer match: reset marks and board state
    gameStore.resetMatch()
    gameStore.hand = selectedMultiplayerMatchHand.value

    // Create a room flagged as a "match" but stay in the lobby
    // until a second player joins and the game becomes "playing".
    // Create a room flagged as a "match" with the chosen stake
    socketStore.createGame(selectedMultiplayerMatchHand.value, 'match', stake, (res) => {
        if (res?.ok) {
            // Persist stake on the game object so joiners can see it
            if (res.game) {
                res.game.stake = stake
            }
            // Immediately refresh rooms so this new match appears in the list
            loadMatchRooms()
        } else {
            toast.error(res?.error || 'Failed to create multiplayer game for match')
        }
    })
}

const loadMatchRooms = () => {
    isLoadingMatchRooms.value = true
    socketStore.requestJoinableGames(() => {
        isLoadingMatchRooms.value = false
    })
}

const joinMultiplayerMatchGame = async (gameId) => {
    if (!isLoggedIn.value) {
        router.push({ name: 'login' })
        return
    }

    // Find the selected match to read its stake (default 2 if missing)
    const game = socketStore.joinableGames.find((g) => g.id === gameId)
    const stake = game?.stake ?? 2

    const confirmed = window.confirm(
        `Joining this match costs ${stake} coins. Continue?`,
    )
    if (!confirmed) return

    try {
        const response = await apiStore.stakeMultiplayerGame(stake)

        if (response?.data?.coins_balance !== undefined && authStore.currentUser) {
            authStore.currentUser.coins_balance = response.data.coins_balance
        } else {
            await authStore.getUser()
        }
    } catch (err) {
        const msg =
            err?.response?.data?.message ||
            'Unable to pay multiplayer entry fee.'
        toast.error(msg)
        return
    }

    // Joining an existing match room should also start with fresh local marks
    gameStore.resetMatch()

    socketStore.joinGame(gameId, (res) => {
        if (res?.ok) {
            // Second player joins an existing match room and can enter immediately.
            router.push({ name: 'multiplayermatches' })
        } else {
            toast.error(res?.error || 'Failed to join multiplayer game for match')
        }
    })
}

const goToHistory = () => {
    router.push({ name: 'history' })
}

// 👇 THIS WAS PREVIOUSLY FLOATING AT TOP LEVEL – NOW WRAPPED:
const hostMultiplayerGame = async () => {
  if (!isLoggedIn.value) {
    router.push({ name: 'login' })
    return
  }

  const confirmed = window.confirm(
    'Hosting a multiplayer game costs 2 coins. Continue?',
  )
  if (!confirmed) return

  try {
    const response = await apiStore.stakeMultiplayerGame(2)

    if (response?.data?.coins_balance !== undefined && authStore.currentUser) {
      authStore.currentUser.coins_balance = response.data.coins_balance
    } else {
      await authStore.getUser()
    }
  } catch (err) {
    const msg =
      err?.response?.data?.message || 'Unable to pay multiplayer entry fee.'
    toast.error(msg)
    return
  }

  gameStore.hand = selectedMultiplayerHand.value

  socketStore.createGame(selectedMultiplayerHand.value, (res) => {
    if (res?.ok) {
      loadRooms()
    } else {
      toast.error(res?.error || 'Failed to create multiplayer game')
    }
  })
}

const loadRooms = () => {
    isLoadingRooms.value = true
    socketStore.requestJoinableGames(() => {
        isLoadingRooms.value = false
    })
}

const joinMultiplayerGame = async (gameId) => {
  if (!isLoggedIn.value) {
    router.push({ name: 'login' })
    return
  }

  const confirmed = window.confirm(
    'Joining this multiplayer game costs 2 coins. Continue?',
  )
  if (!confirmed) return

  try {
    const response = await apiStore.stakeMultiplayerGame(2)

    if (response?.data?.coins_balance !== undefined && authStore.currentUser) {
      authStore.currentUser.coins_balance = response.data.coins_balance
    } else {
      await authStore.getUser()
    }
  } catch (err) {
    const msg =
      err?.response?.data?.message || 'Unable to pay multiplayer entry fee.'
    toast.error(msg)
    return
  }

  socketStore.joinGame(gameId, (res) => {
    if (res?.ok) {
      router.push({ name: 'multiplayergame' })
    } else {
      toast.error(res?.error || 'Failed to join multiplayer game')
    }
  })
}

onMounted(() => {
  loadRooms()
})

watch(
  () => socketStore.currentGame,
  (game) => {
    if (!game || game.state !== 'playing') return

    if (game.mode === 'match') {
      router.push({ name: 'multiplayermatches' })
    } else {
      router.push({ name: 'multiplayergame' })
    }
  },
)
</script>