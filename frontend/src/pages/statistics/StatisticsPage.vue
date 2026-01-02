<template>
  <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
    <div class="w-full max-w-7xl">
      <!-- Header -->
      <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-yellow-700 tracking-widest uppercase mb-2">
            Platform Statistics
          </h1>
          <p class="text-yellow-600 font-semibold text-lg">Anonymized Global Activity Data</p>
        </div>
      </div>

      <!-- Admin Stats Button -->
      <div v-if="isAdmin" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6">
        <div class="text-center">
          <button
            @click="goToAdminStats"
            class="px-6 py-3 text-lg font-semibold bg-yellow-700 text-white rounded-xl hover:bg-yellow-800 transition"
          >
            👑 View Admin Statistics
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-6 text-center">
        <p class="text-yellow-700 font-semibold">Loading statistics...</p>
      </div>

      <!-- Error State -->
      <div v-if="!loading && !stats" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-6 text-center mb-6">
        <p class="text-red-600 font-semibold">Failed to load statistics</p>
      </div>

      <!-- Statistics Content -->
      <div v-if="!loading && stats" class="space-y-6">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Players -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <div class="text-center">
              <p class="text-sm font-semibold text-yellow-600 mb-2">👥 TOTAL PLAYERS</p>
              <p class="text-4xl font-bold text-yellow-700">{{ stats.players.total }}</p>
            </div>
          </div>

          <!-- Total Games -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-green-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <div class="text-center">
              <p class="text-sm font-semibold text-green-600 mb-2">🎮 TOTAL GAMES</p>
              <p class="text-4xl font-bold text-green-700">{{ stats.games.total }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ stats.games.completed }} completed</p>
            </div>
          </div>

          <!-- Total Matches -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-blue-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <div class="text-center">
              <p class="text-sm font-semibold text-blue-600 mb-2">🏆 TOTAL MATCHES</p>
              <p class="text-4xl font-bold text-blue-700">{{ stats.matches.total }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ stats.matches.completed }} completed</p>
            </div>
          </div>

          <!-- Total Achievements -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-purple-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <div class="text-center">
              <p class="text-sm font-semibold text-purple-600 mb-2">⭐ ACHIEVEMENTS</p>
              <p class="text-2xl font-bold text-orange-600">🔥 {{ stats.achievements.total_capotes }}</p>
              <p class="text-2xl font-bold text-purple-600">👑 {{ stats.achievements.total_bandeiras }}</p>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Games Activity Chart -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              📊 Games Activity (Last 30 Days)
            </h2>
            <div class="h-64 flex items-end justify-between gap-1">
              <div
                v-for="(day, index) in stats.activity.games_per_day"
                :key="`game-${index}`"
                class="flex-1 bg-green-500 hover:bg-green-600 transition rounded-t relative group"
                :style="{ height: `${getBarHeight(day.count, maxGamesPerDay)}%` }"
                :title="`${day.date}: ${day.count} games`"
              >
                <div class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {{ formatChartDate(day.date) }}: {{ day.count }}
                </div>
              </div>
            </div>
            <p class="text-xs text-center text-gray-600 mt-2">Daily game activity</p>
          </div>

          <!-- Matches Activity Chart -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              📊 Matches Activity (Last 30 Days)
            </h2>
            <div class="h-64 flex items-end justify-between gap-1">
              <div
                v-for="(day, index) in stats.activity.matches_per_day"
                :key="`match-${index}`"
                class="flex-1 bg-blue-500 hover:bg-blue-600 transition rounded-t relative group"
                :style="{ height: `${getBarHeight(day.count, maxMatchesPerDay)}%` }"
                :title="`${day.date}: ${day.count} matches`"
              >
                <div class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {{ formatChartDate(day.date) }}: {{ day.count }}
                </div>
              </div>
            </div>
            <p class="text-xs text-center text-gray-600 mt-2">Daily match activity</p>
          </div>
        </div>

        <!-- Detailed Stats -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Games Breakdown -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              🎮 Games Breakdown
            </h2>
            <div class="space-y-3">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-semibold text-gray-700">Status</span>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-green-600">✓ Completed</span>
                    <span class="font-bold text-green-600">{{ stats.games.completed }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-yellow-600">⏳ Ongoing</span>
                    <span class="font-bold text-yellow-600">{{ stats.games.ongoing }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">⏸ Pending</span>
                    <span class="font-bold text-gray-600">{{ stats.games.pending }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-red-600">✗ Cancelled</span>
                    <span class="font-bold text-red-600">{{ stats.games.cancelled }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p class="font-semibold text-gray-700 mb-2">Average Duration</p>
                <p class="text-2xl font-bold text-yellow-700">{{ stats.games.avg_duration }}s</p>
              </div>

              <div v-if="stats.popularity.game_types.length > 0" class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p class="font-semibold text-gray-700 mb-2">Popular Types</p>
                <div class="space-y-2">
                  <div
                    v-for="type in stats.popularity.game_types"
                    :key="`game-type-${type.type}`"
                    class="flex justify-between items-center"
                  >
                    <span class="text-sm text-gray-600">{{ type.type }}</span>
                    <span class="font-bold text-yellow-700">{{ type.total }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Matches Breakdown -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              🏆 Matches Breakdown
            </h2>
            <div class="space-y-3">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-semibold text-gray-700">Status</span>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-green-600">✓ Completed</span>
                    <span class="font-bold text-green-600">{{ stats.matches.completed }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-yellow-600">⏳ Ongoing</span>
                    <span class="font-bold text-yellow-600">{{ stats.matches.ongoing }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">⏸ Pending</span>
                    <span class="font-bold text-gray-600">{{ stats.matches.pending }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-red-600">✗ Cancelled</span>
                    <span class="font-bold text-red-600">{{ stats.matches.cancelled }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p class="font-semibold text-gray-700 mb-2">Average Duration</p>
                <p class="text-2xl font-bold text-yellow-700">{{ stats.matches.avg_duration }}s</p>
              </div>

              <div v-if="stats.popularity.match_types.length > 0" class="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p class="font-semibold text-gray-700 mb-2">Popular Types</p>
                <div class="space-y-2">
                  <div
                    v-for="type in stats.popularity.match_types"
                    :key="`match-type-${type.type}`"
                    class="flex justify-between items-center"
                  >
                    <span class="text-sm text-gray-600">{{ type.type }}</span>
                    <span class="font-bold text-yellow-700">{{ type.total }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Achievements Breakdown -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
            ⭐ Achievements Summary
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-orange-600 mb-2">🔥 {{ stats.achievements.total_capotes }}</p>
              <p class="text-sm text-gray-600">Capotes (>91 points)</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-purple-600 mb-2">👑 {{ stats.achievements.total_bandeiras }}</p>
              <p class="text-sm text-gray-600">Bandeiras (120 points)</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-blue-600 mb-2">🤝 {{ stats.achievements.total_draws }}</p>
              <p class="text-sm text-gray-600">Draws</p>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAPIStore } from '@/stores/api'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const router = useRouter()
const apiStore = useAPIStore()
const authStore = useAuthStore()

const stats = ref(null)
const loading = ref(true)

const isAdmin = computed(() => authStore.currentUser?.type === 'A')

const maxGamesPerDay = computed(() => {
  if (!stats.value || !stats.value.activity.games_per_day.length) return 1
  return Math.max(...stats.value.activity.games_per_day.map(d => d.count))
})

const maxMatchesPerDay = computed(() => {
  if (!stats.value || !stats.value.activity.matches_per_day.length) return 1
  return Math.max(...stats.value.activity.matches_per_day.map(d => d.count))
})

const getBarHeight = (value, max) => {
  if (max === 0) return 0
  return Math.max((value / max) * 100, 2) // Minimum 2% to show bar
}

const formatChartDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const fetchStatistics = async () => {
  try {
    loading.value = true
    const response = await apiStore.getStatistics()
    stats.value = response.data
  } catch (error) {
    toast.error('Failed to load statistics')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goToAdminStats = () => {
  router.push({ name: 'adminStatistics' })
}

const goBack = () => {
  router.push({ name: 'home' })
}

onMounted(() => {
  fetchStatistics()
})
</script>
