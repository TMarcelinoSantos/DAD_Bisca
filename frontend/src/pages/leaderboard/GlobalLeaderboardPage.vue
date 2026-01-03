<template>
  <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-transparent">
    <div class="fixed inset-0 -z-10 pointer-events-none">
            <Balatro
              :is-rotate="false"
              :mouse-interaction="false"
              :pixel-filter="700"
              :color1 = "'#5CA173'"
              :color2 = "'#0D5E1C'"
            />
          </div>
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
          <div class="space-y-2 max-h-56 overflow-y-auto">
            <div
              v-for="(player, index) in leaderboards.game_wins.data"
              :key="`game-wins-${player.id}`"
              class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-lg p-2 flex items-center justify-between hover:shadow-md transition text-sm"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-lg font-bold text-yellow-700 w-6 text-center flex-shrink-0">
                  {{ getMedalEmoji(index) }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-yellow-700 truncate">{{ player.nickname || player.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(player.first_at) }}</p>
                </div>
              </div>
              <span class="text-xl font-bold text-green-600 ml-2 flex-shrink-0">{{ player.total }}</span>
            </div>
            <div v-if="leaderboards.game_wins.data.length === 0" class="text-center py-6">
              <p class="text-yellow-600 font-semibold">No wins yet</p>
            </div>
          </div>
          <!-- Game Wins Pagination -->
          <div v-if="leaderboards.game_wins.last_page > 1" class="mt-3 flex items-center justify-center gap-1 flex-wrap">
            <button
              @click="goToGameWinsPage(1)"
              :disabled="gameWinsPage === 1"
              class="px-2 py-1 text-xs rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              «
            </button>
            <button
              @click="goToGameWinsPage(gameWinsPage - 1)"
              :disabled="gameWinsPage === 1"
              class="px-2 py-1 text-xs rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              ‹
            </button>
            <span class="text-yellow-700 font-semibold text-xs">{{ gameWinsPage }}/{{ leaderboards.game_wins.last_page }}</span>
            <button
              @click="goToGameWinsPage(gameWinsPage + 1)"
              :disabled="gameWinsPage === leaderboards.game_wins.last_page"
              class="px-2 py-1 text-xs rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              ›
            </button>
            <button
              @click="goToGameWinsPage(leaderboards.game_wins.last_page)"
              :disabled="gameWinsPage === leaderboards.game_wins.last_page"
              class="px-2 py-1 text-xs rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              »
            </button>
          </div>
        </div>

        <!-- Match Wins -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4 flex items-center gap-2">
            🏆 Match Wins
          </h2>
          <div class="space-y-2 max-h-56 overflow-y-auto">
            <div
              v-for="(player, index) in leaderboards.match_wins.data"
              :key="`match-wins-${player.id}`"
              class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-lg p-2 flex items-center justify-between hover:shadow-md transition text-sm"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-lg font-bold text-yellow-700 w-6 text-center flex-shrink-0">
                  {{ getMedalEmoji(index) }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-yellow-700 truncate">{{ player.nickname || player.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(player.first_at) }}</p>
                </div>
              </div>
              <span class="text-xl font-bold text-green-600 ml-2 flex-shrink-0">{{ player.total }}</span>
            </div>
            <div v-if="leaderboards.match_wins.data.length === 0" class="text-center py-6">
              <p class="text-yellow-600 font-semibold">No wins yet</p>
            </div>
          </div>
          <!-- Match Wins Pagination -->
          <div v-if="leaderboards.match_wins.last_page > 1" class="mt-3 flex items-center justify-center gap-1 flex-wrap">
            <button
              @click="goToMatchWinsPage(1)"
              :disabled="matchWinsPage === 1"
              class="px-2 py-1 text-xs rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              «
            </button>
            <button
              @click="goToMatchWinsPage(matchWinsPage - 1)"
              :disabled="matchWinsPage === 1"
              class="px-2 py-1 text-xs rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              ‹
            </button>
            <span class="text-yellow-700 font-semibold text-xs">{{ matchWinsPage }}/{{ leaderboards.match_wins.last_page }}</span>
            <button
              @click="goToMatchWinsPage(matchWinsPage + 1)"
              :disabled="matchWinsPage === leaderboards.match_wins.last_page"
              class="px-2 py-1 text-xs rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              ›
            </button>
            <button
              @click="goToMatchWinsPage(leaderboards.match_wins.last_page)"
              :disabled="matchWinsPage === leaderboards.match_wins.last_page"
              class="px-2 py-1 text-xs rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              »
            </button>
          </div>
        </div>

        <!-- Capotes -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-orange-700 tracking-widest uppercase mb-4 flex items-center gap-2">
            🔥 Capotes (>91 pts)
          </h2>
          <div class="space-y-2 max-h-56 overflow-y-auto">
            <div
              v-for="(player, index) in leaderboards.capotes.data"
              :key="`capotes-${player.id}`"
              class="bg-white dark:bg-gray-800 border border-orange-500 rounded-lg p-2 flex items-center justify-between hover:shadow-md transition text-sm"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-lg font-bold text-orange-700 w-6 text-center flex-shrink-0">
                  {{ getMedalEmoji(index) }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-orange-700 truncate">{{ player.nickname || player.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(player.first_at) }}</p>
                </div>
              </div>
              <span class="text-xl font-bold text-orange-600 ml-2 flex-shrink-0">{{ player.total }}</span>
            </div>
            <div v-if="leaderboards.capotes.data.length === 0" class="text-center py-6">
              <p class="text-yellow-600 font-semibold">No capotes yet</p>
            </div>
          </div>
          <!-- Capotes Pagination -->
          <div v-if="leaderboards.capotes.last_page > 1" class="mt-3 flex items-center justify-center gap-1 flex-wrap">
            <button
              @click="goToCapotesPage(1)"
              :disabled="capotesPage === 1"
              class="px-2 py-1 text-xs rounded border border-orange-600 text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50"
            >
              «
            </button>
            <button
              @click="goToCapotesPage(capotesPage - 1)"
              :disabled="capotesPage === 1"
              class="px-2 py-1 text-xs rounded border border-orange-600 text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50"
            >
              ‹
            </button>
            <span class="text-orange-700 font-semibold text-xs">{{ capotesPage }}/{{ leaderboards.capotes.last_page }}</span>
            <button
              @click="goToCapotesPage(capotesPage + 1)"
              :disabled="capotesPage === leaderboards.capotes.last_page"
              class="px-2 py-1 text-xs rounded border border-orange-600 text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50"
            >
              ›
            </button>
            <button
              @click="goToCapotesPage(leaderboards.capotes.last_page)"
              :disabled="capotesPage === leaderboards.capotes.last_page"
              class="px-2 py-1 text-xs rounded border border-orange-600 text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50"
            >
              »
            </button>
          </div>
        </div>

        <!-- Bandeiras -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-purple-700 tracking-widest uppercase mb-4 flex items-center gap-2">
            👑 Bandeiras (120 pts)
          </h2>
          <div class="space-y-2 max-h-56 overflow-y-auto">
            <div
              v-for="(player, index) in leaderboards.bandeiras.data"
              :key="`bandeiras-${player.id}`"
              class="bg-white dark:bg-gray-800 border border-purple-500 rounded-lg p-2 flex items-center justify-between hover:shadow-md transition text-sm"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-lg font-bold text-purple-700 w-6 text-center flex-shrink-0">
                  {{ getMedalEmoji(index) }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-purple-700 truncate">{{ player.nickname || player.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(player.first_at) }}</p>
                </div>
              </div>
              <span class="text-xl font-bold text-purple-600 ml-2 flex-shrink-0">{{ player.total }}</span>
            </div>
            <div v-if="leaderboards.bandeiras.data.length === 0" class="text-center py-6">
              <p class="text-yellow-600 font-semibold">No bandeiras yet</p>
            </div>
          </div>
          <!-- Bandeiras Pagination -->
          <div v-if="leaderboards.bandeiras.last_page > 1" class="mt-3 flex items-center justify-center gap-1 flex-wrap">
            <button
              @click="goToBandeirasPage(1)"
              :disabled="bandeirasPage === 1"
              class="px-2 py-1 text-xs rounded border border-purple-600 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50"
            >
              «
            </button>
            <button
              @click="goToBandeirasPage(bandeirasPage - 1)"
              :disabled="bandeirasPage === 1"
              class="px-2 py-1 text-xs rounded border border-purple-600 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50"
            >
              ‹
            </button>
            <span class="text-purple-700 font-semibold text-xs">{{ bandeirasPage }}/{{ leaderboards.bandeiras.last_page }}</span>
            <button
              @click="goToBandeirasPage(bandeirasPage + 1)"
              :disabled="bandeirasPage === leaderboards.bandeiras.last_page"
              class="px-2 py-1 text-xs rounded border border-purple-600 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50"
            >
              ›
            </button>
            <button
              @click="goToBandeirasPage(leaderboards.bandeiras.last_page)"
              :disabled="bandeirasPage === leaderboards.bandeiras.last_page"
              class="px-2 py-1 text-xs rounded border border-purple-600 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAPIStore } from '@/stores/api'
import { toast } from 'vue-sonner'
import Balatro from "@/components/ui/Balatro.vue"

const router = useRouter()
const apiStore = useAPIStore()

const leaderboards = ref(null)
const loading = ref(true)
const perPage = 5
const gameWinsPage = ref(1)
const matchWinsPage = ref(1)
const capotesPage = ref(1)
const bandeirasPage = ref(1)

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
    const response = await apiStore.getGlobalLeaderboards({
      limit: perPage,
      game_wins_page: gameWinsPage.value,
      match_wins_page: matchWinsPage.value,
      capotes_page: capotesPage.value,
      bandeiras_page: bandeirasPage.value
    })
    leaderboards.value = response.data
  } catch (error) {
    toast.error('Failed to load leaderboards')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goToGameWinsPage = (pageNum) => {
  gameWinsPage.value = pageNum
  fetchLeaderboards()
}

const goToMatchWinsPage = (pageNum) => {
  matchWinsPage.value = pageNum
  fetchLeaderboards()
}

const goToCapotesPage = (pageNum) => {
  capotesPage.value = pageNum
  fetchLeaderboards()
}

const goToBandeirasPage = (pageNum) => {
  bandeirasPage.value = pageNum
  fetchLeaderboards()
}
onMounted(() => {
  fetchLeaderboards()
})
</script>