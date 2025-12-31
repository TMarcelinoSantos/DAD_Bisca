<template>
  <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
    <div class="w-full max-w-5xl">
      <div class="flex flex-col lg:flex-row lg:flex-wrap gap-6">
        <!-- Matches Section -->
        <div class="flex-1 min-w-[320px] bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-6">
            Matches
          </h2>
          <div v-if="history.matches.length === 0" class="text-center py-8">
            <p class="text-yellow-600 font-semibold">No matches found</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="match in history.matches"
              :key="`match-${match.id}`"
              class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-xl p-4 hover:shadow-md transition"
            >
              <div class="flex justify-between items-start gap-3 mb-2">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-yellow-700">{{ match.player1?.name || 'Unknown' }}</span>
                    <span
                      v-if="playerBadge(match, 'player1')"
                      class="text-xs font-semibold px-2 py-0.5 rounded-full"
                      :class="badgeClass(playerBadge(match, 'player1'))"
                    >
                      {{ badgeLabel(playerBadge(match, 'player1')) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-yellow-700">{{ match.player2?.name || 'Unknown' }}</span>
                    <span
                      v-if="playerBadge(match, 'player2')"
                      class="text-xs font-semibold px-2 py-0.5 rounded-full"
                      :class="badgeClass(playerBadge(match, 'player2'))"
                    >
                      {{ badgeLabel(playerBadge(match, 'player2')) }}
                    </span>
                  </div>
                </div>
                <span class="text-sm font-semibold px-3 py-1 rounded-full" :class="getStatusClass(match.status)">
                  {{ match.status }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-600 dark:text-gray-400">Type: <span class="font-semibold text-yellow-700">{{ match.type }}</span></p>
                  <p class="text-gray-600 dark:text-gray-400">Started: <span class="font-semibold">{{ formatDate(match.began_at) }}</span></p>
                </div>
                <div>
                  <p class="text-gray-600 dark:text-gray-400">Marks: <span class="font-semibold text-yellow-700">{{ match.player1_marks }} - {{ match.player2_marks }}</span></p>
                  <p class="text-gray-600 dark:text-gray-400">Duration: <span class="font-semibold">{{ match.total_time }}s</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Games Section -->
        <div class="flex-1 min-w-[320px] bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-6">
            Games
          </h2>
          <div v-if="history.games.length === 0" class="text-center py-8">
            <p class="text-yellow-600 font-semibold">No games found</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="game in history.games"
              :key="`game-${game.id}`"
              class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-xl p-4 hover:shadow-md transition"
            >
              <div class="flex justify-between items-start gap-3 mb-2">
                <div class="space-y-1">
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

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-600 dark:text-gray-400">Type: <span class="font-semibold text-yellow-700">{{ game.type }}</span></p>
                  <p class="text-gray-600 dark:text-gray-400">Started: <span class="font-semibold">{{ formatDate(game.began_at) }}</span></p>
                </div>
                <div>
                  <p class="text-gray-600 dark:text-gray-400">Points: <span class="font-semibold text-yellow-700">{{ game.player1_points }} - {{ game.player2_points }}</span></p>
                  <p class="text-gray-600 dark:text-gray-400">Duration: <span class="font-semibold">{{ game.total_time }}s</span></p>
                </div>
              </div>

              <div v-if="game.is_draw" class="mt-2 text-sm">
                <p class="text-blue-600 dark:text-blue-400 font-semibold">Draw</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Go Back Button -->
      <button
        class="w-full mt-6 py-4 text-lg font-semibold border border-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)]"
        @click="goBack"
      >
        Go back
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAPIStore } from '@/stores/api'
import { toast } from 'vue-sonner'

const router = useRouter()
const apiStore = useAPIStore()

const history = ref({
  matches: [],
  games: []
})
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

const fetchHistory = async () => {
  try {
    loading.value = true
    const response = await apiStore.getHistory()
    history.value = response.data
  } catch (error) {
    toast.error('Failed to load history')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'home' })
}

onMounted(() => {
  fetchHistory()
})
</script>