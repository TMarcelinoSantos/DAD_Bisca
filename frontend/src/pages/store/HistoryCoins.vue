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
    <div class="min-h-screen py-10 px-4">
        <div class="max-w-5xl mx-auto space-y-6
        bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)]
        border-2 border-yellow-700 rounded-2xl
        shadow-[0_8px_30px_rgba(0,0,0,0.6)] p-6">

        <header>
            <h1 class="text-3xl font-bold text-yellow-900">Coin Transactions</h1>
            <p class="text-sm text-yellow-800/80">
            Your transaction history
            </p>
        </header>

        <div v-if="error" class="p-4 rounded-lg bg-red-100 text-red-700">
                {{ error }}
        </div>

        <div v-else-if="isLoading" class="text-center font-semibold">
            Loading transactions…
        </div>

        <div v-else>
            <div v-if="transactions.length === 0" class="text-center font-semibold">
            No transactions found.
            </div>

            <div v-else class="overflow-x-auto">
              <div class="flex items-center gap-4 mb-4">
                <label class="font-medium">Filter by Type:</label>
                <select v-model="typeFilter" class="border rounded p-1">
                  <option :value="null">All</option>
                  <option v-for="type in transactionTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>
            <Table>
                <TableHeader class="bg-yellow-800 text-yellow-50">
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Coins</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Match</TableHead>
                </TableRow>
                </TableHeader>

                <TableBody class="divide-y">
                    <TableRow
                        v-for="tx in paginatedTransactions"
                        :key="tx.id"
                        class="hover:bg-yellow-100/60"
                    >
                    <TableCell>{{ tx.datetime }}</TableCell>

                    <TableCell :class="tx.coins > 0 ? 'text-green-700' : 'text-red-700'">
                        {{ tx.coins > 0 ? '+' : '' }}{{ tx.coins }}
                    </TableCell>

                    <TableCell class="text-black font-semibold">
                        {{ tx.type?.name }}
                    </TableCell>

                    <TableCell class="text-xs">
                        {{ tx.game_id ?? '—' }}
                    </TableCell>
                    <TableCell class="text-xs">
                        {{ tx.match_id ?? '—' }}
                    </TableCell>
                </TableRow>
                </TableBody>
            </Table>
            </div>

            <!-- Pagination -->
            <div class="flex justify-between items-center mt-4 text-sm">
            <span>
                Showing {{ pageStart }}–{{ pageEnd }} of {{ transactions.length }}
            </span>

            <div class="flex gap-2">
                <Button size="sm" :disabled="currentPage === 1" @click="currentPage--">
                Previous
                </Button>
                <span>Page {{ currentPage }}</span>
                <Button size="sm" :disabled="currentPage === totalPages" @click="currentPage++">
                Next
                </Button>
            </div>
            </div>

        </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import Balatro from '@/components/ui/Balatro.vue'
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

const transactions = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')

const currentPage = ref(1)
const itemsPerPage = 10

const typeFilter = ref<string | null>(null)

const fetchTransactions = async () => {
  isLoading.value = true
  try {
    const res = await apiStore.getMyCoinTransactions()
    transactions.value = res.data.data ?? res.data
  } catch (e: any) {
    error.value = 'Failed to load transactions'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchTransactions)

const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / itemsPerPage)
)

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTransactions.value.slice(start, start + itemsPerPage)
})

const pageStart = computed(() =>
  (currentPage.value - 1) * itemsPerPage + 1
)

const pageEnd = computed(() =>
  Math.min(pageStart.value + itemsPerPage - 1, filteredTransactions.value.length)
)

const filteredTransactions = computed(() => {
  if (!typeFilter.value) return transactions.value
  return transactions.value.filter(tx => tx.type?.name === typeFilter.value)
})

const transactionTypes = computed(() => {
  const types = transactions.value.map(tx => tx.type?.name).filter(Boolean)
  return Array.from(new Set(types)) as string[]
})

watch(typeFilter, () => {
  currentPage.value = 1
})
</script>
