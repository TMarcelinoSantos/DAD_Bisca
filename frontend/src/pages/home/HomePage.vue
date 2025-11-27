<template>
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
                        <!-- TODO: Add Difficulty Choice functionality -->
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
                    Comming Soon!!
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">

            </CardContent>
        </Card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
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
const gameStore = useGameStore()

const router = useRouter()
const selectedHand = ref('')

const startGame = () => {
    gameStore.hand = selectedHand.value
    router.push({ name: 'singleplayer' })
}

</script>