<script setup>
    import { useGameStore } from '@/stores/game'
    import GameBoard from '@/components/game/GameBoard.vue'
    import { onMounted, watch } from 'vue'
    import BiscaGame from '@/components/game/BiscaGame.vue'
    import { toast } from 'vue-sonner'
    const gameStore = useGameStore()

    watch(() => gameStore.isGameComplete, (isComplete) => {
        if (isComplete) {
            const p = gameStore.getBiscaPoints(gameStore.playerCardWon)
            const o = gameStore.getBiscaPoints(gameStore.opponentCardWon)
            if (p < o)
                toast.error(`Game Completed - You lost ${p} to ${o}`)
            else{
                toast.success(`Game Completed - You won ${p} to ${o}`)
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