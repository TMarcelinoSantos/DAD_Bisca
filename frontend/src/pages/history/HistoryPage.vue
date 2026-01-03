<template>
  <div class="fixed inset-0 -z-10 pointer-events-none">
      <Balatro
        :is-rotate="false"
        :mouse-interaction="false"
        :pixel-filter="700"
        :color1 = "'#5CA173'"
        :color2 = "'#0D5E1C'"
      />
  </div>
  <div class="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24">
    <div class="w-full max-w-5xl">
      <!-- Admin User Selection -->
      <div v-if="authStore.currentUser?.type === 'A'" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] mb-6">
        <h2 class="text-2xl font-bold text-yellow-700 tracking-widest uppercase mb-4">
          👑 Admin: Select User
        </h2>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, nickname, or email..."
            class="w-full px-4 py-3 border-2 border-yellow-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-700"
            @focus="handleFocus"
            @blur="handleBlur"
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
                <span class="text-xs px-2 py-0.5 rounded-full" :class="user.type === 'A' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                  {{ user.type === 'A' ? 'Admin' : 'Player' }}
                </span>
                <span v-if="user.blocked" class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Blocked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No User Selected Message (Admin Only) -->
      <div v-if="authStore.currentUser?.type === 'A' && !selectedUser" class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <p class="text-2xl text-yellow-700 font-bold mb-2">👤 Select a User</p>
        <p class="text-yellow-600">Please select a user from the dropdown above to view their history.</p>
      </div>

      <div v-else class="flex flex-col lg:flex-row lg:flex-wrap gap-6">
        <!-- Selected User Info -->
        <div v-if="authStore.currentUser?.type === 'A' && selectedUser" class="w-full bg-yellow-100 border-2 border-yellow-600 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="text-sm text-yellow-700">
              Viewing history for: <strong class="text-lg">{{ selectedUser.nickname || selectedUser.name }}</strong>
            </p>
            <p class="text-xs text-gray-600">{{ selectedUser.email }}</p>
          </div>
          <button
            @click="clearUserSelection"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
          >
            Clear Selection
          </button>
        </div>

        <!-- Matches Section -->
        <div class="flex-1 min-w-[320px] bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-6">
            Matches
          </h2>
          <div v-if="history.matches?.data?.length === 0" class="text-center py-8">
            <p class="text-yellow-600 font-semibold">No matches found</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="match in history.matches.data"
              :key="`match-${match.id}`"
              @click="viewMatchDetails(match.id)"
              class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-xl p-4 hover:shadow-md hover:cursor-pointer transition"
            >
              <div class="flex justify-between items-start gap-3 mb-2">
                <div class="space-y-1 flex-1">
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

              <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p class="text-gray-600 dark:text-gray-400">Type: <span class="font-semibold text-yellow-700">{{ match.type }}</span></p>
                  <p class="text-gray-600 dark:text-gray-400">Started: <span class="font-semibold">{{ formatDate(match.began_at) }}</span></p>
                </div>
                <div>
                  <p class="text-gray-600 dark:text-gray-400">Marks: <span class="font-semibold text-yellow-700">{{ match.player1_marks }} - {{ match.player2_marks }}</span></p>
                  <p class="text-gray-600 dark:text-gray-400">Duration: <span class="font-semibold">{{ match.total_time }}s</span></p>
                </div>
              </div>

              <!-- Match Achievements -->
              <div v-if="getMatchCapotes(match.id).length > 0 || getMatchBandeiras(match.id).length > 0" class="border-t border-yellow-200 pt-2 space-y-1">
                <div v-for="capote in getMatchCapotes(match.id)" :key="`capote-${capote}`" class="text-xs">
                  <span class="font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                    🔥 Capotes: {{ capote }}
                  </span>
                </div>
                <div v-for="bandeira in getMatchBandeiras(match.id)" :key="`bandeira-${bandeira}`" class="text-xs">
                  <span class="font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                    👑 Bandeiras: {{ bandeira }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Matches Pagination -->
          <div v-if="history.matches?.last_page > 1" class="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <button
              @click="goToMatchesPage(1)"
              :disabled="matchesPage === 1"
              class="px-3 py-2 rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              First
            </button>
            <button
              @click="goToMatchesPage(matchesPage - 1)"
              :disabled="matchesPage === 1"
              class="px-3 py-2 rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              Previous
            </button>
            <span class="text-yellow-700 font-semibold text-sm">
              Page {{ matchesPage }} of {{ history.matches.last_page }}
            </span>
            <button
              @click="goToMatchesPage(matchesPage + 1)"
              :disabled="matchesPage === history.matches.last_page"
              class="px-3 py-2 rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              Next
            </button>
            <button
              @click="goToMatchesPage(history.matches.last_page)"
              :disabled="matchesPage === history.matches.last_page"
              class="px-3 py-2 rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              Last
            </button>
          </div>
        </div>

        <!-- Games Section -->
        <div class="flex-1 min-w-[320px] bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <h2 class="text-2xl sm:text-3xl font-bold text-yellow-700 tracking-widest uppercase mb-6">
            Games
          </h2>
          <div v-if="history.games?.data?.length === 0" class="text-center py-8">
            <p class="text-yellow-600 font-semibold">No games found</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="game in history.games.data"
              :key="`game-${game.id}`"
              class="bg-white dark:bg-gray-800 border border-yellow-600 rounded-xl p-4 hover:shadow-md transition"
            >
              <div class="flex justify-between items-start gap-3 mb-2">
                <div class="space-y-1 flex-1">
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
                  <p class="text-gray-600 dark:text-gray-400">Type: <span class="font-semibold text-yellow-700">{{ game.type }}</span></p>
                  <p class="text-gray-600 dark:text-gray-400">Started: <span class="font-semibold">{{ formatDate(game.began_at) }}</span></p>
                </div>
                <div>
                  <p class="text-gray-600 dark:text-gray-400">Points: <span class="font-semibold text-yellow-700">{{ game.player1_points }} - {{ game.player2_points }}</span></p>
                  <p class="text-gray-600 dark:text-gray-400">Duration: <span class="font-semibold">{{ game.total_time }}s</span></p>
                </div>
              </div>

              <!-- Game Achievements -->
              <div v-if="game.is_draw || getGameCapote(game) || getGameBandeira(game)" class="border-t border-yellow-200 pt-2 space-y-1">
                <div v-if="game.is_draw" class="text-sm">
                  <p class="text-blue-600 dark:text-blue-400 font-semibold">Draw</p>
                </div>
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

          <!-- Games Pagination -->
          <div v-if="history.games?.last_page > 1" class="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <button
              @click="goToGamesPage(1)"
              :disabled="gamesPage === 1"
              class="px-3 py-2 rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              First
            </button>
            <button
              @click="goToGamesPage(gamesPage - 1)"
              :disabled="gamesPage === 1"
              class="px-3 py-2 rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              Previous
            </button>
            <span class="text-yellow-700 font-semibold text-sm">
              Page {{ gamesPage }} of {{ history.games.last_page }}
            </span>
            <button
              @click="goToGamesPage(gamesPage + 1)"
              :disabled="gamesPage === history.games.last_page"
              class="px-3 py-2 rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              Next
            </button>
            <button
              @click="goToGamesPage(history.games.last_page)"
              :disabled="gamesPage === history.games.last_page"
              class="px-3 py-2 rounded border border-yellow-700 text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAPIStore } from '@/stores/api'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import Balatro from '@/components/ui/Balatro.vue'

const router = useRouter()
const apiStore = useAPIStore()
const authStore = useAuthStore()

const history = ref({
  matches: { data: [], last_page: 1 },
  games: { data: [], last_page: 1 }
})
const matchesPage = ref(1)
const gamesPage = ref(1)
const loading = ref(true)
const perPage = 10

// Admin user selection
const users = ref([])
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedUser = ref(null)

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
  if (game.player1_points >= 91) return game.player1?.name || 'Unknown'
  if (game.player2_points >= 91) return game.player2?.name || 'Unknown'
  return null
}

const getGameBandeira = (game) => {
  if (game.player1_points === 120) return game.player1?.name || 'Unknown'
  if (game.player2_points === 120) return game.player2?.name || 'Unknown'
  return null
}

const getMatchCapotes = (matchId) => {
  const capotes = new Set()
  // This would need the games data for this match
  // For now, we'll show in the details page instead
  return Array.from(capotes)
}

const getMatchBandeiras = (matchId) => {
  const bandeiras = new Set()
  // This would need the games data for this match
  // For now, we'll show in the details page instead
  return Array.from(bandeiras)
}

const fetchHistory = async (matchesPageNum = 1, gamesPageNum = 1) => {
  try {
    loading.value = true
    let response
    
    // If admin has selected a user, fetch their history
    if (selectedUser.value && authStore.currentUser?.type === 'A') {
      response = await apiStore.getUserHistory(selectedUser.value.id, {
        matches_page: matchesPageNum,
        games_page: gamesPageNum,
        per_page: perPage
      })
    } else {
      // Otherwise fetch current user's history
      response = await apiStore.getHistory({
        matches_page: matchesPageNum,
        games_page: gamesPageNum,
        per_page: perPage
      })
    }
    
    history.value = response.data
    matchesPage.value = matchesPageNum
    gamesPage.value = gamesPageNum
  } catch (error) {
    toast.error('Failed to load history')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchUsersList = async () => {
  try {
    const response = await apiStore.getUsers()
    console.log('API Response:', response)
    console.log('Response data:', response.data)
    
    // Try different possible structures
    if (response.data.users) {
      users.value = response.data.users
    } else if (Array.isArray(response.data)) {
      users.value = response.data
    } else if (response.data.data) {
      users.value = response.data.data
    } else {
      users.value = []
    }
    
    console.log('Users loaded:', users.value.length)
  } catch (error) {
    console.error('Failed to load users list', error)
    toast.error('Failed to load users list')
  }
}

const selectUser = (user) => {
  selectedUser.value = user
  showDropdown.value = false
  searchQuery.value = user.nickname || user.name
  // Reset pages and fetch the selected user's history
  matchesPage.value = 1
  gamesPage.value = 1
  fetchHistory()
}

const handleFocus = () => {
  console.log('Focus - users count:', users.value.length)
  showDropdown.value = true
}

const handleBlur = () => {
  // Delay closing to allow clicking on dropdown items
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const clearUserSelection = () => {
  selectedUser.value = null
  searchQuery.value = ''
  // Reset history data
  history.value = {
    matches: { data: [], last_page: 1 },
    games: { data: [], last_page: 1 }
  }
  matchesPage.value = 1
  gamesPage.value = 1
}

const goToMatchesPage = (pageNum) => {
  fetchHistory(pageNum, gamesPage.value)
}

const goToGamesPage = (pageNum) => {
  fetchHistory(matchesPage.value, pageNum)
}
const viewMatchDetails = (matchId) => {
  router.push({ name: 'matchDetails', params: { matchId } })
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    toast.error('Please login to view your history')
    router.push({ name: 'login' })
    return
  }
  
  // Load users list for admin, but don't load history yet
  if (authStore.currentUser?.type === 'A') {
    fetchUsersList()
  } else {
    // Non-admin users see their own history immediately
    fetchHistory()
  }
})

// Show dropdown when typing
watch(searchQuery, () => {
  showDropdown.value = true
})
</script>