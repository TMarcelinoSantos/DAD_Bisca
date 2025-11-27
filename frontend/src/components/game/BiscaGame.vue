<script setup>
import { onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import GameBoard from '@/components/game/GameBoard.vue'

const gameStore = useGameStore()

const props = defineProps({
  card: {
    type: Object,
    required: false
  }

});

onMounted(() => {
    gameStore.setBoard()
})
</script>

<template>
    <GameBoard
        :opponentCards="gameStore.opponentHand"
        :playerCards="gameStore.playerHand"
        :deck="gameStore.deck"
        :trumpCard="gameStore.trumpCard"
    />
</template>