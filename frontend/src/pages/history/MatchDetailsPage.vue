<template>
  <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
    <div class="w-full max-w-4xl">
      <!-- Match Details Section -->
      <div v-if="!loading && match" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6">
        <h2 class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-6">
          Match Details
        </h2>

        <div class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-6 mb-6">
          <!-- Match Header -->
          <div class="flex justify-between items-start gap-4 mb-6 pb-4 border-b-2 border-yellow-300">
            <div class="space-y-3 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xl font-bold text-yellow-700">{{ match.player1?.name || 'Unknown' }}</span>
                <span
                  v-if="playerBadge(match, 'player1')"
                  class="text-sm font-semibold px-3 py-1 rounded-full"
                  :class="badgeClass(playerBadge(match, 'player1'))"
                >
                  {{ badgeLabel(playerBadge(match, 'player1')) }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-bold text-yellow-700">{{ match.player2?.name || 'Unknown' }}</span>
                <span
                  v-if="playerBadge(match, 'player2')"
                  class="text-sm font-semibold px-3 py-1 rounded-full"
                  :class="badgeClass(playerBadge(match, 'player2'))"
                >
                  {{ badgeLabel(playerBadge(match, 'player2')) }}
                </span>
              </div>
            </div>
            <span class="text-sm font-semibold px-4 py-2 rounded-full" :class="getStatusClass(match.status)">
              {{ match.status }}
            </span>
          </div>

          <!-- Match Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Type</p>
              <p class="font-semibold text-yellow-700 text-lg">{{ match.type }}</p>
            </div>
            <div>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Marks</p>
              <p class="font-semibold text-yellow-700 text-lg">{{ match.player1_marks }} - {{ match.player2_marks }}</p>
            </div>
            <div>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Duration</p>
              <p class="font-semibold text-lg">{{ match.total_time }}s</p>
            </div>
            <div>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Started</p>
              <p class="font-semibold text-sm">{{ formatDate(match.began_at) }}</p>
            </div>
            <div>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Ended</p>
              <p class="font-semibold text-sm">{{ formatDate(match.ended_at) }}</p>
            </div>
            <div v-if="match.stake">
              <p class="text-gray-600 dark:text-gray-400 text-sm">Stake</p>
              <p class="font-semibold text-yellow-700 text-lg">{{ match.stake }}</p>
            </div>
          </div>

          <!-- Capotes and Bandeiras Summary -->
          <div v-if="matchCapotes.length > 0 || matchBandeiras.length > 0" class="border-t-2 border-yellow-300 pt-4 mt-4">
            <div v-if="matchCapotes.length > 0" class="mb-3">
              <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold">Capotes (>91 points)</p>
              <div class="flex flex-wrap gap-2 mt-1">
                <span
                  v-for="(capote, index) in matchCapotes"
                  :key="`capote-${index}`"
                  class="text-sm font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700"
                >
                  {{ capote.playerName }}: {{ capote.count }}
                </span>
              </div>
            </div>
            <div v-if="matchBandeiras.length > 0">
              <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold">Bandeiras (120 points)</p>
              <div class="flex flex-wrap gap-2 mt-1">
                <span
                  v-for="(bandeira, index) in matchBandeiras"
                  :key="`bandeira-${index}`"
                  class="text-sm font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700"
                >
                  {{ bandeira.playerName }}: {{ bandeira.count }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Games Section -->
      <div v-if="!loading && match" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6">
        <h2 class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-6">
          Games in Match
        </h2>
        <div v-if="games.length === 0" class="text-center py-8">
          <p class="text-yellow-600 font-semibold">No games found for this match</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(game, index) in games"
            :key="`game-${game.id}`"
            class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-xl p-4 hover:shadow-md transition"
          >
            <div class="flex justify-between items-start gap-3 mb-2">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-yellow-700">Game {{ index + 1 }}</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                    {{ game.type }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-yellow-700">{{ game.player1?.name || 'Unknown' }}</span>
                  <span
                    v-if="playerBadge(game, 'player1', true)"
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="badgeClass(playerBadge(game, 'player1', true))"
                  >
                    {{ badgeLabel(playerBadge(game, 'player1', true)) }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-yellow-700">{{ game.player2?.name || 'Unknown' }}</span>
                  <span
                    v-if="playerBadge(game, 'player2', true)"
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="badgeClass(playerBadge(game, 'player2', true))"
                  >
                    {{ badgeLabel(playerBadge(game, 'player2', true)) }}
                  </span>
                </div>
              </div>
              <span class="text-sm font-semibold px-3 py-1 rounded-full" :class="getStatusClass(game.status)">
                {{ game.status }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p class="text-gray-600 dark:text-gray-400">Points</p>
                <p class="font-semibold text-yellow-700">{{ game.player1_points }} - {{ game.player2_points }}</p>
              </div>
              <div>
                <p class="text-gray-600 dark:text-gray-400">Duration</p>
                <p class="font-semibold">{{ game.total_time }}s</p>
              </div>
              <div>
                <p class="text-gray-600 dark:text-gray-400">Started</p>
                <p class="font-semibold text-xs">{{ formatDate(game.began_at) }}</p>
              </div>
              <div>
                <p class="text-gray-600 dark:text-gray-400">Ended</p>
                <p class="font-semibold text-xs">{{ formatDate(game.ended_at) }}</p>
              </div>
            </div>

            <!-- Game Achievements -->
            <div v-if="game.is_draw" class="mb-2 text-sm">
              <p class="text-blue-600 dark:text-blue-400 font-semibold">Draw</p>
            </div>
            <div v-if="getGameCapote(game) || getGameBandeira(game)" class="border-t border-yellow-200 pt-2 space-y-1">
              <div v-if="getGameCapote(game)" class="text-xs">
                <span class="font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                  🔥 Capote: {{ getGameCapote(game) }}
                </span>
              </div>
              <div v-if="getGameBandeira(game)" class="text-xs">
                <span class="font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  👑 Bandeira: {{ getGameBandeira(game) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-6 text-center">
        <p class="text-yellow-700 font-semibold">Loading match details...</p>
      </div>

      <!-- Error State -->
      <div v-if="!loading && !match" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-6 text-center mb-6">
        <p class="text-red-600 font-semibold">Failed to load match details</p>
      </div>

      <!-- Go Back Button -->
      <button
        class="w-full py-4 text-lg font-semibold border border-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)]"
        @click="goBack"
      >
        Go back to History
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAPIStore } from '@/stores/api'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const apiStore = useAPIStore()
const authStore = useAuthStore()

const match = ref(null)
const games = ref([])
const loading = ref(true)

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  const statusMap = {
    'completed': 'bg-green-100 text-green-700',
    'ongoing': 'bg-yellow-100 text-yellow-700',
    'cancelled': 'bg-red-100 text-red-700',
    'pending': 'bg-gray-100 text-gray-700'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-700'
}

const playerBadge = (item, playerKey, isGame = false) => {
  if (isGame && item.is_draw) return 'draw'
  const pid = item[`${playerKey}_user_id`]
  if (item.winner_user_id && pid === item.winner_user_id) return 'winner'
  if (item.loser_user_id && pid === item.loser_user_id) return 'loser'
  return ''
}

const badgeClass = (badge) => {
  const map = {
    winner: 'bg-green-100 text-green-700',
    loser: 'bg-red-100 text-red-700',
    draw: 'bg-blue-100 text-blue-700',
  }
  return map[badge] || ''
}

const badgeLabel = (badge) => {
  const map = {
    winner: 'Winner',
    loser: 'Loser',
    draw: 'Draw',
  }
  return map[badge] || ''
}

const getGameCapote = (game) => {
  if (game.player1_points >= 91) return match.value?.player1?.name || 'Unknown'
  if (game.player2_points >= 91) return match.value?.player2?.name || 'Unknown'
  return null
}

const getGameBandeira = (game) => {
  if (game.player1_points === 120) return match.value?.player1?.name || 'Unknown'
  if (game.player2_points === 120) return match.value?.player2?.name || 'Unknown'
  return null
}

const matchCapotes = computed(() => {
  const capotes = {}
  games.value.forEach((game) => {
    if (game.player1_points >= 91) {
      const playerName = match.value?.player1?.name || 'Unknown'
      capotes[playerName] = (capotes[playerName] || 0) + 1
    }
    if (game.player2_points >= 91) {
      const playerName = match.value?.player2?.name || 'Unknown'
      capotes[playerName] = (capotes[playerName] || 0) + 1
    }
  })
  return Object.entries(capotes).map(([playerName, count]) => ({ playerName, count }))
})

const matchBandeiras = computed(() => {
  const bandeiras = {}
  games.value.forEach((game) => {
    if (game.player1_points === 120) {
      const playerName = match.value?.player1?.name || 'Unknown'
      bandeiras[playerName] = (bandeiras[playerName] || 0) + 1
    }
    if (game.player2_points === 120) {
      const playerName = match.value?.player2?.name || 'Unknown'
      bandeiras[playerName] = (bandeiras[playerName] || 0) + 1
    }
  })
  return Object.entries(bandeiras).map(([playerName, count]) => ({ playerName, count }))
})

const fetchMatchDetails = async () => {
  try {
    loading.value = true
    const matchId = route.params.matchId
    const response = await apiStore.getMatchDetails(matchId)
    match.value = response.data.match
    games.value = response.data.games
    
    // Check if user is viewing another user's match
    const currentUserId = authStore.currentUser?.id
    const player1Id = match.value.player1_user_id
    const player2Id = match.value.player2_user_id
    
    // If the current user is not a participant in this match
    if (currentUserId !== player1Id && currentUserId !== player2Id) {
      // Check if user is an admin
      if (authStore.currentUser?.type !== 'A') {
        toast.error('You must be an admin to view other users\' matches')
        router.push({ name: 'login' })
        return
      }
    }
  } catch (error) {
    toast.error('Failed to load match details')
    console.error(error)
    router.push({ name: 'history' })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'history' })
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    toast.error('Please login to view match details')
    router.push({ name: 'login' })
    return
  }
  fetchMatchDetails()
})
</script>