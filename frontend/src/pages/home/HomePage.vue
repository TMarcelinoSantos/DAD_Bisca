<template>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-10">
        <span class="text-4xl text-aligh-center font-bold">GAMES</span>
    </div>
    <div class="flex flex-row justify-center items-stretch gap-5 mt-10">
        <Card class="w-full max-w-md">
            <CardHeader>
                <CardTitle class="text-3xl font-bold text-center">
                    Single Player
                </CardTitle>
                <CardDescription class="text-center">
                    Test yourself!!!
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium">Choose Type</label>
                    <div class="grid grid-cols-2 gap-2">
                        <Button v-for="level in gameStore.hands" :key="level.value" size="sm"
                            :variant="selectedHand === level.value ? 'default' : 'outline'"
                            class="flex flex-col py-3 h-16"
                            @click="selectedHand = level.value">
                            <span class="front-semibold">{{ level.label }}</span>
                        </Button>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium">High Scores (local)</label>
                    <!-- TODO: Add High Scores functionality -->
                </div>

                <div class="flex justify-center">
                    <Button @click="startGame" size="lg" variant="secondary" class="hover:bg-purple-500 hover:text-slate-200">
                        Start Game
                    </Button>
                </div>
            </CardContent>
        </Card>
        <Card class="w-full max-w-md">
            <CardHeader>
                <CardTitle class="text-3xl font-bold text-center">
                    MultiPlayer
                </CardTitle>
                <CardDescription class="text-center">
                    Play online with other players.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <p class="text-sm text-center text-amber-300">
                    Entering a multiplayer game (hosting or joining) costs
                    <span class="font-semibold">2 coins</span>.
                </p>
                <div class="space-y-2">
                    <label class="text-sm font-medium">Choose Type</label>
                    <div class="grid grid-cols-2 gap-2">
                        <Button
                            v-for="level in gameStore.hands"
                            :key="level.value"
                            size="sm"
                            :variant="selectedMultiplayerHand === level.value ? 'default' : 'outline'"
                            class="flex flex-col py-3 h-16"
                            @click="selectedMultiplayerHand = level.value"
                        >
                            <span class="front-semibold">{{ level.label }}</span>
                        </Button>
                    </div>
                </div>
                <p
                    v-if="!isLoggedIn"
                    class="text-sm text-red-400 text-center"
                >
                    Multiplayer is only available for logged in users. Please
                    log in to host or join a game.
                </p>
                <div class="space-y-4">
                    <div class="flex justify-center gap-3">
                        <Button
                            size="lg"
                            variant="secondary"
                            class="hover:bg-emerald-500 hover:text-slate-200"
                            :disabled="!isLoggedIn"
                            @click="hostMultiplayerGame"
                        >
                            Host Game
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            class="border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-slate-200"
                            :disabled="isLoadingRooms || !isLoggedIn"
                            @click="loadRooms"
                        >
                            {{ isLoadingRooms ? 'Loading...' : 'Refresh Rooms' }}
                        </Button>
                    </div>

                    <div class="space-y-2">
                        <label class="text-sm font-medium">Available Rooms</label>
                        <div
                            v-if="socketStore.joinableGames.length === 0"
                            class="text-sm text-gray-500 mt-1"
                        >
                            No rooms available. Host a new game.
                        </div>
                        <ul
                            v-else
                            class="mt-2 space-y-2 max-h-48 overflow-y-auto"
                        >
                            <li
                                v-for="game in socketStore.joinableGames"
                                :key="game.id"
                                class="flex items-center justify-between rounded border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-50"
                            >
                                <span>
                                    Room #{{ game.id }} ·
                                    {{ game.type === '3' ? 'Bisca de 3' : 'Bisca de 9' }} ·
                                    {{ (game.player1 && game.player1.username) || 'Waiting for players' }}
                                </span>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    class="hover:bg-emerald-500 hover:text-slate-200"
                                    :disabled="!isLoggedIn"
                                    @click="joinMultiplayerGame(game.id)"
                                >
                                    Join
                                </Button>
                            </li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
    <span class="text-4xl font-bold mb-10">MATCHES</span>
    <div class="flex flex-row justify-center items-stretch gap-5 mt-10">
        <Card class="w-full max-w-md">
            <CardHeader>
                <CardTitle class="text-3xl font-bold text-center">
                    Single Player
                </CardTitle>
                <CardDescription class="text-center">
                    Test yourself!!!
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium">Choose Type</label>
                    <div class="grid grid-cols-2 gap-2">
                        <Button v-for="level in gameStore.hands" :key="level.value" size="sm"
                            :variant="selectedHand === level.value ? 'default' : 'outline'"
                            class="flex flex-col py-3 h-16"
                            @click="selectedHand = level.value">
                            <span class="front-semibold">{{ level.label }}</span>
                        </Button>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium">High Scores (local)</label>
                    <!-- TODO: Add High Scores functionality -->
                </div>

                <div class="flex justify-center">
                    <Button @click="startMatch" size="lg" variant="secondary" class="hover:bg-purple-500 hover:text-slate-200">
                        Start Game
                    </Button>
                </div>
            </CardContent>
        </Card>
        <Card class="w-full max-w-md">
            <CardHeader>
                <CardTitle class="text-3xl font-bold text-center">
                    MultiPlayer
                </CardTitle>
                <CardDescription class="text-center">
                    Comming Soon!!
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">

            </CardContent>
        </Card>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'

import { useRouter } from 'vue-router'

import { useGameStore } from '@/stores/game'
import { useSocketStore } from '@/stores/socket'
import { useAuthStore } from '@/stores/auth'
import { useAPIStore } from '@/stores/api'
import { toast } from 'vue-sonner'

const gameStore = useGameStore()
const socketStore = useSocketStore()
const authStore = useAuthStore()
const apiStore = useAPIStore()

const router = useRouter()
const selectedHand = ref('')
const selectedMultiplayerHand = ref('9')
const isLoadingRooms = ref(false)
const isLoggedIn = computed(() => authStore.isLoggedIn)

const startGame = () => {
    gameStore.hand = selectedHand.value
    router.push({ name: 'singleplayer' })
}
const startMatch = () => {
    gameStore.hand = selectedHand.value
    router.push({ name: 'singlematches' })
}

const hostMultiplayerGame = async () => {
    if (!isLoggedIn.value) {
        router.push({ name: 'login' })
        return
    }

    const confirmed = window.confirm('Hosting a multiplayer game costs 2 coins. Continue?')
    if (!confirmed) return

    try {
        const response = await apiStore.stakeMultiplayerGame(2)

        // Update local user coins immediately from response
        if (response?.data?.coins_balance !== undefined && authStore.currentUser) {
            authStore.currentUser.coins_balance = response.data.coins_balance
        } else {
            await authStore.getUser()
        }
    } catch (err) {
        const msg = err?.response?.data?.message || 'Unable to pay multiplayer entry fee.'
        toast.error(msg)
        return
    }

    // Set game type (3 or 9) for multiplayer based on host choice
    gameStore.hand = selectedMultiplayerHand.value

    socketStore.createGame(selectedMultiplayerHand.value, (res) => {
        if (res?.ok) {
            loadRooms()
        } else {
            toast.error(res?.error || 'Failed to create multiplayer game')
        }
    })
}

const loadRooms = () => {
    isLoadingRooms.value = true
    socketStore.requestJoinableGames(() => {
        isLoadingRooms.value = false
    })
}

const joinMultiplayerGame = async (gameId) => {
    if (!isLoggedIn.value) {
        router.push({ name: 'login' })
        return
    }

    const confirmed = window.confirm('Joining this multiplayer game costs 2 coins. Continue?')
    if (!confirmed) return

    try {
        const response = await apiStore.stakeMultiplayerGame(2)

        // Update local user coins immediately from response
        if (response?.data?.coins_balance !== undefined && authStore.currentUser) {
            authStore.currentUser.coins_balance = response.data.coins_balance
        } else {
            await authStore.getUser()
        }
    } catch (err) {
        const msg = err?.response?.data?.message || 'Unable to pay multiplayer entry fee.'
        toast.error(msg)
        return
    }

    socketStore.joinGame(gameId, (res) => {
        if (res?.ok) {
            router.push({ name: 'multiplayergame' })
        } else {
            toast.error(res?.error || 'Failed to join multiplayer game')
        }
    })
}

onMounted(() => {
    loadRooms()
})

// When a hosted room becomes "playing" (second player joined), go to the game page
watch(
    () => socketStore.currentGame,
    (game) => {
        if (game && game.state === 'playing') {
            router.push({ name: 'multiplayergame' })
        }
    },
)

</script>