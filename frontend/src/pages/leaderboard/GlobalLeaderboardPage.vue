<template>
  <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
    <div class="w-full max-w-6xl">
      <!-- Header -->
      <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-yellow-700 tracking-widest uppercase mb-2">
            Global Leaderboards
          </h1>
          <p class="text-yellow-600 font-semibold text-lg">Top Players Rankings</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-6 text-center">
        <p class="text-yellow-700 font-semibold">Loading leaderboards...</p>
      </div>

      <!-- Error State -->
      <div v-if="!loading && !leaderboards" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-6 text-center mb-6">
        <p class="text-red-600 font-semibold">Failed to load leaderboards</p>
      </div>

      <!-- Leaderboards Grid -->
      <div v-if="!loading && leaderboards" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Game Wins -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4 flex items-center gap-2">
            🎮 Game Wins
          </h2>
          <div class="space-y-2">
            <div
              v-for="(player, index) in leaderboards.game_wins"
              :key="`game-wins-${player.id}`"
              class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition"
            >
              <div class="flex items-center gap-3 flex-1">
                <span class="text-xl font-bold text-yellow-700 w-8 text-center">
                  {{ getMedalEmoji(index) }}
                </span>
                <div class="flex-1">
                  <p class="font-bold text-yellow-700">{{ player.nickname || player.name }}</p>
                  <p class="text-xs text-gray-500">Since {{ formatDate(player.first_at) }}</p>
                </div>
              </div>
              <span class="text-2xl font-bold text-green-600">{{ player.total }}</span>
            </div>
            <div v-if="leaderboards.game_wins.length === 0" class="text-center py-6">
              <p class="text-yellow-600 font-semibold">No wins yet</p>
            </div>
          </div>
        </div>

        <!-- Match Wins -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4 flex items-center gap-2">
            🏆 Match Wins
          </h2>
          <div class="space-y-2">
            <div
              v-for="(player, index) in leaderboards.match_wins"
              :key="`match-wins-${player.id}`"
              class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition"
            >
              <div class="flex items-center gap-3 flex-1">
                <span class="text-xl font-bold text-yellow-700 w-8 text-center">
                  {{ getMedalEmoji(index) }}
                </span>
                <div class="flex-1">
                  <p class="font-bold text-yellow-700">{{ player.nickname || player.name }}</p>
                  <p class="text-xs text-gray-500">Since {{ formatDate(player.first_at) }}</p>
                </div>
              </div>
              <span class="text-2xl font-bold text-green-600">{{ player.total }}</span>
            </div>
            <div v-if="leaderboards.match_wins.length === 0" class="text-center py-6">
              <p class="text-yellow-600 font-semibold">No wins yet</p>
            </div>
          </div>
        </div>

        <!-- Capotes -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-orange-700 tracking-widest uppercase mb-4 flex items-center gap-2">
            🔥 Capotes (>91 pts)
          </h2>
          <div class="space-y-2">
            <div
              v-for="(player, index) in leaderboards.capotes"
              :key="`capotes-${player.id}`"
              class="bg-white dark:bg-gray-800 border border-orange-500 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition"
            >
              <div class="flex items-center gap-3 flex-1">
                <span class="text-xl font-bold text-orange-700 w-8 text-center">
                  {{ getMedalEmoji(index) }}
                </span>
                <div class="flex-1">
                  <p class="font-bold text-orange-700">{{ player.nickname || player.name }}</p>
                  <p class="text-xs text-gray-500">Since {{ formatDate(player.first_at) }}</p>
                </div>
              </div>
              <span class="text-2xl font-bold text-orange-600">{{ player.total }}</span>
            </div>
            <div v-if="leaderboards.capotes.length === 0" class="text-center py-6">
              <p class="text-yellow-600 font-semibold">No capotes yet</p>
            </div>
          </div>
        </div>

        <!-- Bandeiras -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-purple-700 tracking-widest uppercase mb-4 flex items-center gap-2">
            👑 Bandeiras (120 pts)
          </h2>
          <div class="space-y-2">
            <div
              v-for="(player, index) in leaderboards.bandeiras"
              :key="`bandeiras-${player.id}`"
              class="bg-white dark:bg-gray-800 border border-purple-500 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition"
            >
              <div class="flex items-center gap-3 flex-1">
                <span class="text-xl font-bold text-purple-700 w-8 text-center">
                  {{ getMedalEmoji(index) }}
                </span>
                <div class="flex-1">
                  <p class="font-bold text-purple-700">{{ player.nickname || player.name }}</p>
                  <p class="text-xs text-gray-500">Since {{ formatDate(player.first_at) }}</p>
                </div>
              </div>
              <span class="text-2xl font-bold text-purple-600">{{ player.total }}</span>
            </div>
            <div v-if="leaderboards.bandeiras.length === 0" class="text-center py-6">
              <p class="text-yellow-600 font-semibold">No bandeiras yet</p>
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

const leaderboards = ref(null)
const loading = ref(true)

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getMedalEmoji = (index) => {
  const medals = ['🥇', '🥈', '🥉']
  return medals[index] || `#${index + 1}`
}

const fetchLeaderboards = async () => {
  try {
    loading.value = true
    const response = await apiStore.getGlobalLeaderboards(50)
    leaderboards.value = response.data
  } catch (error) {
    toast.error('Failed to load leaderboards')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'home' })
}

onMounted(() => {
  fetchLeaderboards()
})
</script>