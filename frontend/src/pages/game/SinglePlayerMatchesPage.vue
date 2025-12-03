<script setup>
    import { useGameStore } from '@/stores/game'
    import GameBoard from '@/components/game/GameBoard.vue'
    import { onMounted, watch, ref } from 'vue'
    import BiscaGame from '@/components/game/BiscaGame.vue'
    import { toast } from 'vue-sonner'
    import { useRouter } from 'vue-router'

    const gameStore = useGameStore()
    const isMatchOver = ref(false)
    const router = useRouter()

    watch(() => gameStore.isGameComplete, (isComplete) => {
        if (!isComplete) return
            
        const playerPoints = gameStore.getBiscaPoints(gameStore.playerCardWon)
        const opponentPoints = gameStore.getBiscaPoints(gameStore.opponentCardWon)
        if (playerPoints < opponentPoints)
            toast.error(`Game Completed - You lost ${playerPoints} to ${opponentPoints}`)
        else if(playerPoints > opponentPoints){
            toast.success(`Game Completed - You won ${playerPoints} to ${opponentPoints}`)
        }else{
            toast(`Game Completed - It's a tie ${playerPoints} to ${opponentPoints}`)
        }
        if (gameStore.isAuthenticated) gameStore.saveGame()
        gameStore.addMatchPoints()

        if (gameStore.playerMarks >= 3) {
            toast.success("Match Completed — You WIN the match!")
            isMatchOver.value = true
            if (gameStore.isAuthenticated) gameStore.saveMatch()
            return
        }else if (gameStore.opponentMarks >= 3) {
            toast.error("Match Completed — You LOST the match!")
            isMatchOver.value = true
            if (gameStore.isAuthenticated) gameStore.saveMatch()
            return
        }
        console.log(`Starting new round. Current Score - Player: ${gameStore.playerMarks}, Opponent: ${gameStore.opponentMarks}`)
        gameStore.setBoard()
                 
    })

    onMounted(async () => {
        gameStore.setBoard()
        await gameStore.startMatch()
        gameStore.resetMatch()
    })

    const goDashboard = () => {
        router.push({ name: 'home' })
    }
</script>
<template>
    <div v-if="!isMatchOver">
        <BiscaGame />
    </div>

    <transition name="fade">
        <div v-if="isMatchOver" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-sm p-6 relative">
                <div class="flex flex-col items-center gap-2">
                    <div class="text-lg font-semibold text-gray-800 dark:text-gray-100">🎉 Match terminado</div>
                    <div class="flex gap-4">
                        <div class="text-gray-500 font-semibold">Jogador: <span class="text-gray-600">{{ gameStore.playerMarks }}</span></div>
                        <div class="text-gray-500 font-semibold">Oponente: <span class="text-gray-600">{{ gameStore.opponentMarks }}</span></div>
                    </div>
                    <button 
                        @click="goDashboard"
                        class="mt-4 py-2 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                        OK
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>