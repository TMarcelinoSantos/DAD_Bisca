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
  <div class="min-h-screen bg-transparent py-10 px-4">
    <div class="max-w-5xl mx-auto space-y-6 bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] p-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-yellow-900">App Management</h1>
          <p class="text-sm text-yellow-800/80">Registered users overview</p>
        </div>
      </header>

      <div v-if="error" class="p-4 rounded-lg border border-red-500/60 bg-red-100 text-red-700">
        {{ error }}
      </div>

      <div v-else-if="isLoading" class="text-center text-yellow-900 font-semibold">
        Loading users…
      </div>

      <div v-else>
        <div v-if="users.length === 0" class="text-center text-yellow-900 font-semibold">
          No users found.
        </div>
        <div v-else class="grid gap-6 lg:grid-cols-2">
          <section class="border border-yellow-800/40 bg-white/70 shadow-inner">
            <div class="flex items-center justify-between border-b border-yellow-800/20 bg-yellow-800 text-yellow-50 px-4 py-3">
              <h2 class="text-lg font-semibold">Players</h2>
              <span class="text-sm font-medium">{{ playerUsers.length }} users</span>
            </div>
            <div v-if="playerUsers.length === 0" class="p-6 text-center text-yellow-900 font-semibold">
              No player users found.
            </div>
            <div v-else>
              <div class="overflow-x-auto">
                <Table class="[&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide">
                  <TableHeader class="bg-yellow-800 text-yellow-50">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nickname</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody class="divide-y divide-yellow-900/10 text-yellow-900">
                    <TableRow
                      v-for="user in paginatedPlayerUsers"
                      :key="user.id"
                      class="hover:bg-yellow-100/60 cursor-pointer"
                      @click="openProfile(user.id)"
                    >
                      <TableCell class="font-mono">#{{ user.id }}</TableCell>
                      <TableCell class="font-semibold">{{ user.nickname || '—' }}</TableCell>
                      <TableCell>{{ user.name || '—' }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div class="flex flex-col gap-3 border-t border-yellow-800/20 bg-white/60 px-4 py-3 text-sm text-yellow-900 md:flex-row md:items-center md:justify-between">
                <span>
                  Showing {{ playerPageRangeStart }}–{{ playerPageRangeEnd }} of {{ playerUsers.length }}
                </span>
                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    class="border-yellow-800 text-yellow-900 hover:bg-yellow-800 hover:text-yellow-50"
                    :disabled="currentPagePlayers === 1"
                    @click="goToPreviousPlayersPage"
                  >
                    Previous
                  </Button>
                  <span class="text-sm font-medium">
                    Page {{ currentPagePlayers }} of {{ totalPagesPlayers }}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    class="border-yellow-800 text-yellow-900 hover:bg-yellow-800 hover:text-yellow-50"
                    :disabled="currentPagePlayers === totalPagesPlayers"
                    @click="goToNextPlayersPage"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section class="border border-yellow-800/40 bg-white/70 shadow-inner">
            <div class="flex items-center justify-between border-b border-yellow-800/20 bg-yellow-800 text-yellow-50 px-4 py-3">
              <h2 class="text-lg font-semibold">Administrators</h2>
              <span class="text-sm font-medium">{{ adminUsers.length }} users</span>
            </div>
            <div v-if="adminUsers.length === 0" class="p-6 text-center text-yellow-900 font-semibold">
              No admin users found.
            </div>
            <div v-else>
              <div class="overflow-x-auto">
                <Table class="[&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide">
                  <TableHeader class="bg-yellow-800 text-yellow-50">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nickname</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody class="divide-y divide-yellow-900/10 text-yellow-900">
                    <TableRow
                      v-for="user in paginatedAdminUsers"
                      :key="user.id"
                      class="hover:bg-yellow-100/60 cursor-pointer"
                      @click="openProfile(user.id)"
                    >
                      <TableCell class="font-mono">#{{ user.id }}</TableCell>
                      <TableCell class="font-semibold">{{ user.nickname || '—' }}</TableCell>
                      <TableCell>{{ user.name || '—' }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div class="flex flex-col gap-3 border-t border-yellow-800/20 bg-white/60 px-4 py-3 text-sm text-yellow-900 md:flex-row md:items-center md:justify-between">
                <span>
                  Showing {{ adminPageRangeStart }}–{{ adminPageRangeEnd }} of {{ adminUsers.length }}
                </span>
                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    class="border-yellow-800 text-yellow-900 hover:bg-yellow-800 hover:text-yellow-50"
                    :disabled="currentPageAdmins === 1"
                    @click="goToPreviousAdminsPage"
                  >
                    Previous
                  </Button>
                  <span class="text-sm font-medium">
                    Page {{ currentPageAdmins }} of {{ totalPagesAdmins }}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    class="border-yellow-800 text-yellow-900 hover:bg-yellow-800 hover:text-yellow-50"
                    :disabled="currentPageAdmins === totalPagesAdmins"
                    @click="goToNextAdminsPage"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import Balatro from "@/components/ui/Balatro.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAPIStore } from '@/stores/api'

const apiStore = useAPIStore()
const users = ref([])
const isLoading = ref(false)
const error = ref('')
const currentPagePlayers = ref(1)
const currentPageAdmins = ref(1)
const itemsPerPage = ref(10)
const router = useRouter()

const fetchUsers = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await apiStore.getUsers()
    users.value = response.data?.data ?? response.data ?? []
  } catch (err) {
    error.value = err?.response?.data?.message ?? 'Failed to load users.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUsers)

const playerUsers = computed(() =>
  users.value.filter(user => (user.type ?? '').toUpperCase() === 'P')
)
const adminUsers = computed(() =>
  users.value.filter(user => (user.type ?? '').toUpperCase() === 'A')
)

watch(playerUsers, () => {
  currentPagePlayers.value = 1
})
watch(adminUsers, () => {
  currentPageAdmins.value = 1
})

const totalPagesPlayers = computed(() =>
  Math.ceil(playerUsers.value.length / itemsPerPage.value) || 1
)
const totalPagesAdmins = computed(() =>
  Math.ceil(adminUsers.value.length / itemsPerPage.value) || 1
)

const paginatedPlayerUsers = computed(() => {
  if (playerUsers.value.length === 0) return []
  const start = (currentPagePlayers.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return playerUsers.value.slice(start, end)
})

const paginatedAdminUsers = computed(() => {
  if (adminUsers.value.length === 0) return []
  const start = (currentPageAdmins.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return adminUsers.value.slice(start, end)
})

const playerPageRangeStart = computed(() => {
  if (playerUsers.value.length === 0) return 0
  return (currentPagePlayers.value - 1) * itemsPerPage.value + 1
})
const playerPageRangeEnd = computed(() => {
  if (playerUsers.value.length === 0) return 0
  return Math.min(playerPageRangeStart.value + itemsPerPage.value - 1, playerUsers.value.length)
})

const adminPageRangeStart = computed(() => {
  if (adminUsers.value.length === 0) return 0
  return (currentPageAdmins.value - 1) * itemsPerPage.value + 1
})
const adminPageRangeEnd = computed(() => {
  if (adminUsers.value.length === 0) return 0
  return Math.min(adminPageRangeStart.value + itemsPerPage.value - 1, adminUsers.value.length)
})

const goToNextPlayersPage = () => {
  if (currentPagePlayers.value < totalPagesPlayers.value) {
    currentPagePlayers.value++
  }
}

const goToPreviousPlayersPage = () => {
  if (currentPagePlayers.value > 1) {
    currentPagePlayers.value--
  }
}

const goToNextAdminsPage = () => {
  if (currentPageAdmins.value < totalPagesAdmins.value) {
    currentPageAdmins.value++
  }
}

const goToPreviousAdminsPage = () => {
  if (currentPageAdmins.value > 1) {
    currentPageAdmins.value--
  }
}

const openProfile = (userId: number) => {
  router.push({ name: 'adminProfile', query: { userId } })
}
</script>