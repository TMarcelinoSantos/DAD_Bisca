<script setup>
    import { useGameStore } from '@/stores/game'
    import GameBoard from '@/components/game/GameBoard.vue'
    import { onMounted, watch } from 'vue'
    import BiscaGame from '@/components/game/BiscaGame.vue'
    import { toast } from 'vue-sonner'
    const gameStore = useGameStore()

    watch(() => gameStore.isGameComplete, (isComplete) => {
        if (isComplete) {
            const playerPoints = gameStore.getBiscaPoints(gameStore.playerCardWon)
            const opponentPoints = gameStore.getBiscaPoints(gameStore.opponentCardWon)
            if (playerPoints < opponentPoints)
                toast.error(`Game Completed - You lost ${playerPoints} to ${opponentPoints}`)
            else if (playerPoints > opponentPoints){
                toast.success(`Game Completed - You won ${playerPoints} to ${opponentPoints}`)
            } else {
                toast(`Game Completed - It's a tie ${playerPoints} to ${opponentPoints}`)
            }
            gameStore.saveGame()
        }
    })

    onMounted(() => {
        gameStore.setBoard()
    })
</script>
<template>
    <BiscaGame
    />
</template>