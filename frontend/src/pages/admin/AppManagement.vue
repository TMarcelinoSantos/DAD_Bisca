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
        <div v-else class="rounded-xl border border-yellow-800/40 bg-white/70 shadow-inner">
          <div class="overflow-x-auto">
            <Table class="[&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide">
              <TableHeader class="bg-yellow-800 text-yellow-50">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nickname</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody class="divide-y divide-yellow-900/10 text-yellow-900">
                <TableRow v-for="user in paginatedUsers" :key="user.id" class="hover:bg-yellow-100/60">
                  <TableCell class="font-mono">#{{ user.id }}</TableCell>
                  <TableCell class="font-semibold">{{ user.nickname || '—' }}</TableCell>
                  <TableCell>{{ user.name || '—' }}</TableCell>
                  <TableCell>{{ user.email }}</TableCell>
                  <TableCell class="uppercase">{{ user.type || '—' }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div class="flex flex-col gap-3 border-t border-yellow-800/20 bg-white/60 px-4 py-3 text-sm text-yellow-900 md:flex-row md:items-center md:justify-between">
            <span>
              Showing {{ pageRangeStart }}–{{ pageRangeEnd }} of {{ users.length }}
            </span>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                class="border-yellow-800 text-yellow-900 hover:bg-yellow-800 hover:text-yellow-50"
                :disabled="currentPage === 1"
                @click="goToPreviousPage"
              >
                Previous
              </Button>
              <span class="text-sm font-medium">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <Button
                variant="outline"
                size="sm"
                class="border-yellow-800 text-yellow-900 hover:bg-yellow-800 hover:text-yellow-50"
                :disabled="currentPage === totalPages"
                @click="goToNextPage"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import Balatro from "@/component/Balatro/Balatro.vue";
import {
  Table,
  TableBody,
  TableCaption,
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
const currentPage = ref(1)
const itemsPerPage = ref(10)

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

const totalPages = computed(() => {
  return Math.ceil(users.value.length / itemsPerPage.value)
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return users.value.slice(start, end)
})

const pageRangeStart = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const pageRangeEnd = computed(() => {
  return Math.min(pageRangeStart.value + itemsPerPage.value - 1, users.value.length)
})

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}
</script>