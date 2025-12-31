<template>
    <span class="text-4xl text-aligh-center font-bold mb-10">GAMES</span>
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
                <div class="space-y-4">
                    <div class="flex justify-center gap-3">
                        <Button
                            size="lg"
                            variant="secondary"
                            class="hover:bg-emerald-500 hover:text-slate-200"
                            @click="hostMultiplayerGame"
                        >
                            Host Game
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            class="border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-slate-200"
                            :disabled="isLoadingRooms"
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
                                    {{ (game.player1 && game.player1.username) || 'Waiting for players' }}
                                </span>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    class="hover:bg-emerald-500 hover:text-slate-200"
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
import { ref, onMounted, watch } from 'vue'
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
const gameStore = useGameStore()
const socketStore = useSocketStore()

const router = useRouter()
const selectedHand = ref('')
const isLoadingRooms = ref(false)

const startGame = () => {
    gameStore.hand = selectedHand.value
    router.push({ name: 'singleplayer' })
}
const startMatch = () => {
    gameStore.hand = selectedHand.value
    router.push({ name: 'singlematches' })
}

const hostMultiplayerGame = () => {
    socketStore.createGame((res) => {
        if (res?.ok) {
            loadRooms()
        }
    })
}

const loadRooms = () => {
    isLoadingRooms.value = true
    socketStore.requestJoinableGames(() => {
        isLoadingRooms.value = false
    })
}

const joinMultiplayerGame = (gameId) => {
    socketStore.joinGame(gameId, (res) => {
        if (res?.ok) {
            router.push({ name: 'multiplayergame' })
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