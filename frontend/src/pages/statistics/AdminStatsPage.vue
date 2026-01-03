<template>
  <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
    <div class="w-full max-w-6xl">
      <!-- Header -->
      <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-yellow-700 tracking-widest uppercase mb-2">
            👑 Admin Statistics
          </h1>
          <p class="text-yellow-600 font-semibold text-lg">Detailed User Analytics</p>
        </div>
      </div>

      <!-- User Selection -->
      <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6">
        <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
          Select User
        </h2>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, nickname, or email..."
            class="w-full px-4 py-3 border-2 border-yellow-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-700"
            @focus="showDropdown = true"
          />
          
          <!-- Dropdown -->
          <div
            v-if="showDropdown && filteredUsers.length > 0"
            class="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectUser(user)"
              class="px-4 py-3 hover:bg-yellow-100 dark:hover:bg-gray-700 cursor-pointer border-b border-yellow-200 last:border-b-0"
            >
              <p class="font-semibold text-yellow-700">{{ user.nickname || user.name }}</p>
              <p class="text-xs text-gray-600">{{ user.email }}</p>
              <div class="flex gap-2 mt-1">
                <span class="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                  {{ user.type === 'A' ? 'Admin' : 'Player' }}
                </span>
                <span v-if="user.blocked" class="text-xs px-2 py-0.5 rounded bg-red-200 text-red-700">
                  Blocked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingStats" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-6 text-center">
        <p class="text-yellow-700 font-semibold">Loading user statistics...</p>
      </div>

      <!-- User Stats -->
      <div v-if="!loadingStats && userStats" class="space-y-6">
        <!-- User Info Card -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
            User Information
          </h2>
          <div class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600">Name</p>
                <p class="font-bold text-yellow-700">{{ userStats.user.name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Nickname</p>
                <p class="font-bold text-yellow-700">{{ userStats.user.nickname }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Email</p>
                <p class="font-bold text-yellow-700">{{ userStats.user.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Type</p>
                <span class="text-sm px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold">
                  {{ userStats.user.type === 'A' ? 'Admin' : 'Player' }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Coins Balance</p>
                <p class="font-bold text-yellow-700">{{ userStats.user.coins_balance }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Status</p>
                <span
                  class="text-sm px-2 py-1 rounded font-semibold"
                  :class="userStats.user.blocked ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'"
                >
                  {{ userStats.user.blocked ? 'Blocked' : 'Active' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Games & Matches Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Games -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              🎮 Games
            </h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Wins</span>
                <span class="font-bold text-green-600">{{ userStats.games.wins }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Losses</span>
                <span class="font-bold text-red-600">{{ userStats.games.losses }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Draws</span>
                <span class="font-bold text-blue-600">{{ userStats.games.draws }}</span>
              </div>
              <div class="flex justify-between border-t border-yellow-300 pt-2">
                <span class="text-gray-600">Total</span>
                <span class="font-bold text-yellow-700">{{ userStats.games.total }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Win Rate</span>
                <span class="font-bold text-yellow-700">{{ userStats.games.win_rate }}%</span>
              </div>
            </div>
          </div>

          <!-- Matches -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              🏆 Matches
            </h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Wins</span>
                <span class="font-bold text-green-600">{{ userStats.matches.wins }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Losses</span>
                <span class="font-bold text-red-600">{{ userStats.matches.losses }}</span>
              </div>
              <div class="flex justify-between border-t border-yellow-300 pt-2">
                <span class="text-gray-600">Total</span>
                <span class="font-bold text-yellow-700">{{ userStats.matches.total }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Win Rate</span>
                <span class="font-bold text-yellow-700">{{ userStats.matches.win_rate }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Achievements & Coins -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Achievements -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              🏅 Achievements
            </h2>
            <div class="space-y-4">
              <div class="text-center">
                <p class="text-4xl font-bold text-orange-600">{{ userStats.achievements.capotes }}</p>
                <p class="text-sm text-gray-600">🔥 Capotes (>91 pts)</p>
              </div>
              <div class="text-center">
                <p class="text-4xl font-bold text-purple-600">{{ userStats.achievements.bandeiras }}</p>
                <p class="text-sm text-gray-600">👑 Bandeiras (120 pts)</p>
              </div>
            </div>
          </div>

          <!-- Coins & Purchases -->
          <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              💰 Coins & Purchases
            </h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Current Balance</span>
                <span class="font-bold text-yellow-700">{{ userStats.coins.current_balance }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Earned</span>
                <span class="font-bold text-green-600">{{ userStats.coins.total_earned }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Spent</span>
                <span class="font-bold text-red-600">{{ userStats.coins.total_spent }}</span>
              </div>
              <div class="flex justify-between border-t border-yellow-300 pt-2">
                <span class="text-gray-600">Net Change</span>
                <span class="font-bold" :class="userStats.coins.net_change >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ userStats.coins.net_change }}
                </span>
              </div>
              <div class="flex justify-between border-t border-yellow-300 pt-2">
                <span class="text-gray-600">Total Purchases</span>
                <span class="font-bold text-yellow-700">{{ userStats.purchases.total_count }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Euros Spent</span>
                <span class="font-bold text-yellow-700">€{{ userStats.purchases.total_euros }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Series Charts -->
        <div class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
            📊 Activity Over Time (Last 90 Days)
          </h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Games Chart -->
            <div class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-4">
              <h3 class="text-lg font-bold text-yellow-700 mb-3">Games Played</h3>
              <div v-if="userStats.time_series.games.length > 0" class="space-y-1">
                <div
                  v-for="day in userStats.time_series.games"
                  :key="`game-${day.date}`"
                  class="flex items-center gap-2"
                >
                  <span class="text-xs text-gray-600 w-24">{{ formatDate(day.date) }}</span>
                  <div class="flex-1 h-6 bg-gray-200 rounded relative overflow-hidden">
                    <div
                      class="h-full bg-green-500 transition-all"
                      :style="{ width: `${(day.count / Math.max(...userStats.time_series.games.map(d => d.count))) * 100}%` }"
                      :title="`${day.count} games`"
                    ></div>
                  </div>
                  <span class="text-sm font-bold text-yellow-700 w-8">{{ day.count }}</span>
                </div>
              </div>
              <p v-else class="text-center text-gray-500 py-4">No activity</p>
            </div>

            <!-- Matches Chart -->
            <div class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-4">
              <h3 class="text-lg font-bold text-yellow-700 mb-3">Matches Played</h3>
              <div v-if="userStats.time_series.matches.length > 0" class="space-y-1">
                <div
                  v-for="day in userStats.time_series.matches"
                  :key="`match-${day.date}`"
                  class="flex items-center gap-2"
                >
                  <span class="text-xs text-gray-600 w-24">{{ formatDate(day.date) }}</span>
                  <div class="flex-1 h-6 bg-gray-200 rounded relative overflow-hidden">
                    <div
                      class="h-full bg-blue-500 transition-all"
                      :style="{ width: `${(day.count / Math.max(...userStats.time_series.matches.map(d => d.count))) * 100}%` }"
                      :title="`${day.count} matches`"
                    ></div>
                  </div>
                  <span class="text-sm font-bold text-yellow-700 w-8">{{ day.count }}</span>
                </div>
              </div>
              <p v-else class="text-center text-gray-500 py-4">No activity</p>
            </div>

            <!-- Purchases Chart -->
            <div class="bg-white dark:bg-gray-800 border-2 border-yellow-600 rounded-xl p-4 lg:col-span-2">
              <h3 class="text-lg font-bold text-yellow-700 mb-3">Coin Purchases</h3>
              <div v-if="userStats.time_series.purchases.length > 0" class="space-y-1">
                <div
                  v-for="day in userStats.time_series.purchases"
                  :key="`purchase-${day.date}`"
                  class="flex items-center gap-2"
                >
                  <span class="text-xs text-gray-600 w-24">{{ formatDate(day.date) }}</span>
                  <div class="flex-1 h-6 bg-gray-200 rounded relative overflow-hidden">
                    <div
                      class="h-full bg-yellow-500 transition-all"
                      :style="{ width: `${(day.total_euros / Math.max(...userStats.time_series.purchases.map(d => d.total_euros))) * 100}%` }"
                      :title="`€${day.total_euros} (${day.count} purchases)`"
                    ></div>
                  </div>
                  <span class="text-sm font-bold text-yellow-700 w-20">€{{ day.total_euros }}</span>
                  <span class="text-xs text-gray-600 w-16">({{ day.count }}x)</span>
                </div>
              </div>
              <p v-else class="text-center text-gray-500 py-4">No purchases</p>
            </div>
          </div>
        </div>

        <!-- Stats by Type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Games by Type -->
          <div v-if="userStats.by_type.games.length > 0" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              Games by Type
            </h2>
            <div class="space-y-3">
              <div
                v-for="game in userStats.by_type.games"
                :key="`game-type-${game.type}`"
                class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-lg p-3"
              >
                <p class="font-bold text-yellow-700 mb-2">{{ game.type }}</p>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Wins / Total</span>
                  <span class="font-semibold">{{ game.wins }} / {{ game.total }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Win Rate</span>
                  <span class="font-semibold text-yellow-700">{{ game.win_rate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Matches by Type -->
          <div v-if="userStats.by_type.matches.length > 0" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <h2 class="text-xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
              Matches by Type
            </h2>
            <div class="space-y-3">
              <div
                v-for="match in userStats.by_type.matches"
                :key="`match-type-${match.type}`"
                class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-lg p-3"
              >
                <p class="font-bold text-yellow-700 mb-2">{{ match.type }}</p>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Wins / Total</span>
                  <span class="font-semibold">{{ match.wins }} / {{ match.total }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Win Rate</span>
                  <span class="font-semibold text-yellow-700">{{ match.win_rate }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAPIStore } from '@/stores/api'
import { toast } from 'vue-sonner'

const router = useRouter()
const apiStore = useAPIStore()

const users = ref([])
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedUser = ref(null)
const userStats = ref(null)
const loadingStats = ref(false)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) ||
    (user.nickname && user.nickname.toLowerCase().includes(query)) ||
    user.email.toLowerCase().includes(query)
  )
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const selectUser = async (user) => {
  selectedUser.value = user
  searchQuery.value = user.nickname || user.name
  showDropdown.value = false

  await fetchUserStats(user.id)
}

const fetchUsersList = async () => {
  try {
    const response = await apiStore.getAdminUsersList()
    users.value = response.data
  } catch (error) {
    toast.error('Failed to load users list')
    console.error(error)
  }
}

const fetchUserStats = async (userId) => {
  try {
    loadingStats.value = true
    const response = await apiStore.getAdminUserStatistics(userId)
    userStats.value = response.data
  } catch (error) {
    toast.error('Failed to load user statistics')
    console.error(error)
  } finally {
    loadingStats.value = false
  }
}

// Close dropdown when clicking outside
watch(searchQuery, () => {
  if (!searchQuery.value) {
    showDropdown.value = false
  } else {
    showDropdown.value = true
  }
})

onMounted(() => {
  fetchUsersList()
})
</script>