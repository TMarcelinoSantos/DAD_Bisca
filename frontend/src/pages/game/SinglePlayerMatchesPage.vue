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
    const isGameOver = ref(false)
    const gameWinner = ref(null)
    const matchWinner = ref(null)

    watch(() => gameStore.isGameComplete, async(isComplete) => {
        if (!isComplete) return
        
        const playerPoints = gameStore.getBiscaPoints(gameStore.playerCardWon)
        const opponentPoints = gameStore.getBiscaPoints(gameStore.opponentCardWon)
        if (playerPoints < opponentPoints){
            toast.error(`Game Completed - You lost ${playerPoints} to ${opponentPoints}`)
            gameWinner.value = "opponent"
        }else if(playerPoints > opponentPoints){
            toast.success(`Game Completed - You won ${playerPoints} to ${opponentPoints}`)
            gameWinner.value = "player"
        }else{
            toast(`Game Completed - It's a tie ${playerPoints} to ${opponentPoints}`)
            gameWinner.value = "tie"
        }
        if (gameStore.isAuthenticated){
            await gameStore.saveGame()
        } 
        gameStore.addMatchPoints()
        isGameOver.value = true

        if (gameStore.playerMarks >= 4) {
            toast.success("Match Completed — You WIN the match!")
            isMatchOver.value = true
            matchWinner.value = 'player'
            if (gameStore.isAuthenticated) gameStore.saveMatch()
            return
        }else if (gameStore.opponentMarks >= 4) {
            toast.error("Match Completed — You LOST the match!")
            isMatchOver.value = true
            matchWinner.value = 'opponent'
            if (gameStore.isAuthenticated) gameStore.saveMatch()
            return
        }
        console.log(`Starting new round. Current Score - Player: ${gameStore.playerMarks}, Opponent: ${gameStore.opponentMarks}`)
        //gameStore.playAgain()
        //await gameStore.startGame()
        //gameStore.setBoard()
                 
    })

    onMounted(async () => {
        gameStore.setBoard()
        await gameStore.startMatch()
    })

    const playAgain = async () =>{
        gameStore.playAgain()
        await gameStore.startMatch()
        isMatchOver.value = false
        isGameOver.value = false
    }

    const startNewMatch = async () => {
        gameStore.resetMatch()
        await gameStore.startMatch()
        isMatchOver.value = false
        isGameOver.value = false
    }

    const goDashboard = () => {
        router.push({ name: 'home' })
    }
</script>
<template>
    <div v-if="!isMatchOver">
        <BiscaGame />
    </div>
    <transition name="fade">
    <div v-if="isGameOver" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-sm p-6">
            
            <h2 class="text-xl font-bold text-center mb-3 text-gray-800 dark:text-gray-100">
                Resultado do Game
            </h2>

            <div class="text-center text-lg mb-2">
                <span v-if="gameWinner === 'player'" class="text-green-600 font-bold">
                    Ganhou o game!
                </span>
                <span v-else-if="gameWinner === 'opponent'" class="text-red-600 font-bold">
                    Perdeu o game!
                </span>
                <span v-else class="text-gray-600 font-bold">
                    Empate!
                </span>
            </div>

            <div class="text-center mb-3 text-gray-700 dark:text-gray-300">
                <div>Jogador: <strong>{{ gameStore.playerTotalPoints }}</strong></div>
                <div>Oponente: <strong>{{ gameStore.opponentTotalPoints }}</strong></div>
            </div>

            <div v-if="gameStore.getWinType !== 'tie'" class="text-center text-gray-800 dark:text-gray-200 mb-4">
                <span v-if="gameStore.getWinType === 'bandeira'" class="text-blue-600 font-bold">
                    🚩 Bandeira 
                </span>
                <span v-else-if="gameStore.getWinType === 'capote'" class="text-orange-600 font-bold">
                    🔶 Capote
                </span>
            </div>

            <div class="flex gap-4 mt-4 justify-center">
                <button 
                    @click="playAgain"
                    class="py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700">
                    Continuar a Match
                </button>
                <button 
                    @click="goDashboard"
                    class="py-2 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                    Dashboard
                </button>
            </div>
        </div>
    </div>
</transition>

    <transition name="fade">
        <div v-if="isMatchOver" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-sm p-6 relative">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-sm p-6 relative">
                <h2 class="text-xl font-bold text-center mb-3 text-gray-800 dark:text-gray-100">
                Resultado da Match </h2>
                <div class="text-center text-lg mb-2">
                    <span v-if="matchWinner === 'player'" class="text-green-600 font-bold">
                        Ganhou o match!
                    </span>
                    <span v-else-if="matchWinner === 'opponent'" class="text-red-600 font-bold">
                        Perdeu o match!
                    </span>
                </div>
                <div class="text-center mb-3 text-gray-700 dark:text-gray-300">
                    <div>Jogador: <strong>{{ gameStore.playerMarks }}</strong></div>
                    <div>Oponente: <strong>{{ gameStore.opponentMarks }}</strong></div>
                </div>
                <div class="flex gap-4 mt-4">
                        <button 
                            @click="startNewMatch"
                            class="py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700">
                            Jogar Match novamente
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