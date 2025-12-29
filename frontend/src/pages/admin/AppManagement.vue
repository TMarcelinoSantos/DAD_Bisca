<template>
    <div>
        <span class="text-4xl text-align-center font-bold mb-10">GAMES</span>
    </div>
</template>

<script setup>
import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { useGameStore } from '@/stores/game'
const gameStore = useGameStore()

const router = useRouter()
const selectedHand = ref('')

const startGame = () => {
    gameStore.hand = selectedHand.value
    router.push({ name: 'singleplayer' })
}
const startMatch = () => {
    gameStore.hand = selectedHand.value
    router.push({ name: 'singlematches' })
}

</script>