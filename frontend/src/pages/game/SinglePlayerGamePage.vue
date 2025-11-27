<script setup>
    import { useGameStore } from '@/stores/game'
    import GameBoard from '@/components/game/GameBoard.vue'
    import { onMounted } from 'vue'
    import BiscaGame from '@/components/game/BiscaGame.vue'

    const gameStore = useGameStore()

    onMounted(() => {
        gameStore.setBoard()
    })
</script>
<template>
    <BiscaGame
    />
</template>