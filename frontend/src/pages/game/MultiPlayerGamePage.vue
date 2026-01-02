<script setup>
    import { useGameStore } from '@/stores/game'
    import GameBoard from '@/components/game/GameBoard.vue'
    import { useSocketStore } from '@/stores/socket'
    import { useAuthStore } from '@/stores/auth'
    import { onMounted, ref, watch } from 'vue'
    import { toast } from 'vue-sonner'
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const gameStore = useGameStore()
    const socketStore = useSocketStore()
    const authStore = useAuthStore()
    const isGameOver = ref(false)
    const isLoading = ref(true)

    const showGameOverPopup = () => {
        if (isGameOver.value) return

        const playerPoints = gameStore.playerTotalPoints
        const opponentPoints = gameStore.opponentTotalPoints

        if (playerPoints < opponentPoints)
            toast.error(
                `Game Completed - You lost ${playerPoints} to ${opponentPoints}`,
            )
        else if (playerPoints > opponentPoints)
            toast.success(
                `Game Completed - You won ${playerPoints} to ${opponentPoints}`,
            )
        else
            toast(
                `Game Completed - It's a tie ${playerPoints} to ${opponentPoints}`,
            )

        isGameOver.value = true
    }

    // Server-driven end (multiplayer always relies on server state)
    watch(
        () => socketStore.currentGame?.state,
        (state) => {
            if (state !== 'finished') return
            showGameOverPopup()
        },
    )

    const goDashboard = () => {
        router.push({ name: 'home' })
    }

    const handleResign = () => {
        const gameId = socketStore.currentGame?.id
        if (!gameId || isGameOver.value) return
        socketStore.resignGame(gameId)
    }

    onMounted(async () => {
        const game = socketStore.currentGame

        if (!game) {
            toast.error('No active multiplayer game')
            router.push({ name: 'home' })
            return
        }

        const serverBoardEmpty = !game.board || !game.board.deck || game.board.deck.length === 0

        if (game.state === 'playing' && serverBoardEmpty) {
            gameStore.setBoardMultiplayer()
            socketStore.syncGameState(game.id)
        }

        isLoading.value = false
    })
</script>
<template>
    <div v-if="isLoading" class="flex items-center justify-center h-full py-10 text-white">
        Loading multiplayer game...
    </div>
    <GameBoard
        v-else
        :opponentCards="gameStore.opponentHand"
        :playerCards="gameStore.playerHand"
        :deck="gameStore.deck"
        :trumpCard="gameStore.trumpCard"
        :multiPlayer="true"
        :roomId="String(socketStore.currentGame?.id ?? '')"
    />
    <div v-if="!isLoading && !isGameOver" class="mt-4 flex justify-center">
        <button
            @click="handleResign"
            class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
        >
            Resign
        </button>
    </div>
    <transition name="fade">
        <div v-if="isGameOver" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-sm p-6 relative">
                <div class="flex flex-col items-center gap-2">
                    <div class="text-lg font-semibold text-gray-800 dark:text-gray-100">Game terminado</div>
                    <div class="flex gap-4">
                        <div class="text-gray-500 font-semibold">Jogador: <span class="text-gray-600">{{ gameStore.playerTotalPoints }}</span></div>
                        <div class="text-gray-500 font-semibold">Oponente: <span class="text-gray-600">{{ gameStore.opponentTotalPoints }}</span></div>
                    </div>
                    <div class="flex gap-4 mt-4">
                        <button 
                            @click="playAgain"
                            class="py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700">
                            Jogar novamente
                        </button>
                        <button 
                            @click="goDashboard"
                            class="py-2 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>