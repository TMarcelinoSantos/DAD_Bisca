<template>
  <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
    <div class="w-full max-w-6xl">
      <!-- Loading State -->
      <div v-if="loading" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-6 text-center">
        <p class="text-yellow-700 font-semibold">Loading your stats...</p>
      </div>

      <!-- Error State -->
      <div v-if="!loading && !stats" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-6 text-center mb-6">
        <p class="text-red-600 font-semibold">Failed to load stats</p>
      </div>

      <!-- Stats Content -->
      <div v-if="!loading && stats" class="space-y-6">
        <!-- Header with User Info -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <div class="text-center">
            <h1 class="text-4xl sm:text-5xl font-bold text-yellow-700 tracking-widest uppercase mb-2">
              {{ stats.user.name }}
            </h1>
            <p class="text-yellow-600 font-semibold text-lg">Personal Leaderboard & Stats</p>
          </div>
        </div>

        <!-- Overall Stats Section -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-6">
            Overall Stats
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Games Stats -->
            <div class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-4">
              <div class="text-center">
                <p class="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">GAMES</p>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Wins</span>
                    <span class="text-2xl font-bold text-green-600">{{ stats.overall.game_wins }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Losses</span>
                    <span class="text-2xl font-bold text-red-600">{{ stats.overall.game_losses }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Draws</span>
                    <span class="text-2xl font-bold text-blue-600">{{ stats.overall.game_draws }}</span>
                  </div>
                  <div class="border-t border-yellow-300 pt-2 mt-2">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-xs text-gray-600">Total</span>
                      <span class="text-sm font-semibold text-yellow-700">{{ stats.overall.total_games }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-gray-600">Win Rate</span>
                      <span class="text-lg font-bold text-yellow-700">{{ stats.overall.game_win_rate }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Matches Stats -->
            <div class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-4">
              <div class="text-center">
                <p class="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">MATCHES</p>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Wins</span>
                    <span class="text-2xl font-bold text-green-600">{{ stats.overall.match_wins }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Losses</span>
                    <span class="text-2xl font-bold text-red-600">{{ stats.overall.match_losses }}</span>
                  </div>
                  <div class="border-t border-yellow-300 pt-2 mt-2">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-xs text-gray-600">Total</span>
                      <span class="text-sm font-semibold text-yellow-700">{{ stats.overall.total_matches }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-gray-600">Win Rate</span>
                      <span class="text-lg font-bold text-yellow-700">{{ stats.overall.match_win_rate }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Achievements -->
            <div class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-4">
              <div class="text-center">
                <p class="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">ACHIEVEMENTS</p>
                <div class="space-y-3">
                  <div>
                    <p class="text-4xl font-bold text-orange-600">{{ stats.overall.total_capotes }}</p>
                    <p class="text-xs text-gray-600">🔥 Capotes (>91 pts)</p>
                  </div>
                  <div>
                    <p class="text-4xl font-bold text-purple-600">{{ stats.overall.total_bandeiras }}</p>
                    <p class="text-xs text-gray-600">👑 Bandeiras (120 pts)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Types Section -->
        <div v-if="stats.by_game_type.games.length > 0" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-6">
            Stats by Game Type
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="game in stats.by_game_type.games"
              :key="`game-type-${game.type}`"
              class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-4"
            >
              <h3 class="text-lg font-bold text-yellow-700 mb-3 uppercase">{{ game.type }}</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Wins</span>
                  <span class="font-bold text-green-600">{{ game.wins }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Total</span>
                  <span class="font-bold text-yellow-700">{{ game.total }}</span>
                </div>
                <div class="flex justify-between border-t border-yellow-300 pt-2">
                  <span class="text-sm text-gray-600">Win Rate</span>
                  <span class="font-bold text-yellow-700">{{ game.win_rate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Capotes & Bandeiras by Type -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div v-if="stats.by_game_type.capotes.length > 0" class="bg-white dark:bg-gray-800 border-2 border-orange-500 rounded-xl p-4">
              <h3 class="text-lg font-bold text-orange-700 mb-3">🔥 Capotes by Type</h3>
              <div class="space-y-2">
                <div
                  v-for="capote in stats.by_game_type.capotes"
                  :key="`capote-type-${capote.type}`"
                  class="flex justify-between items-center"
                >
                  <span class="text-sm text-gray-600">{{ capote.type }}</span>
                  <span class="font-bold text-orange-600">{{ capote.total }}</span>
                </div>
              </div>
            </div>

            <div v-if="stats.by_game_type.bandeiras.length > 0" class="bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-xl p-4">
              <h3 class="text-lg font-bold text-purple-700 mb-3">👑 Bandeiras by Type</h3>
              <div class="space-y-2">
                <div
                  v-for="bandeira in stats.by_game_type.bandeiras"
                  :key="`bandeira-type-${bandeira.type}`"
                  class="flex justify-between items-center"
                >
                  <span class="text-sm text-gray-600">{{ bandeira.type }}</span>
                  <span class="font-bold text-purple-600">{{ bandeira.total }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Match Types Section -->
        <div v-if="stats.by_match_type.matches.length > 0" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-6">
            Stats by Match Type
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="match in stats.by_match_type.matches"
              :key="`match-type-${match.type}`"
              class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-4"
            >
              <h3 class="text-lg font-bold text-yellow-700 mb-3 uppercase">{{ match.type }}</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Wins</span>
                  <span class="font-bold text-green-600">{{ match.wins }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Total</span>
                  <span class="font-bold text-yellow-700">{{ match.total }}</span>
                </div>
                <div class="flex justify-between border-t border-yellow-300 pt-2">
                  <span class="text-sm text-gray-600">Win Rate</span>
                  <span class="font-bold text-yellow-700">{{ match.win_rate }}%</span>
                </div>
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

const stats = ref(null)
const loading = ref(true)

const fetchStats = async () => {
  try {
    loading.value = true
    const response = await apiStore.getPersonalStats()
    stats.value = response.data
  } catch (error) {
    toast.error('Failed to load stats')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'home' })
}

onMounted(() => {
  fetchStats()
})
</script>