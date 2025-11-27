<script setup>
import BiscaGame from './BiscaGame.vue';
import semFace from '@/cards/semFace.png'

const props = defineProps({
  opponentCards: {
    type: Array,
    required: true
  },
  playerCards: {
    type: Array,
    required: true
  },
  deck: {
    type: Array,
    required: true,
    default: () => []
  },
  trumpCard: {
    type: Object,
    default: () => null
  },
})
</script>

<template>

    <div
        class="flex flex-col justify-around items-center w-full h-screen"
        :style="{ backgroundColor: '#0b7a3c', padding: '40px 20px' }"
    >
        <div class="opponent-hand flex flex-wrap gap-1 justify-center items-center">
            <img
                v-for="(card,i) in opponentCards"
                :key="i"
                :src="semFace"
                class="card card-img"
            />
        </div>

        <div class="w-full max-w-3xl flex items-start gap-6 px-4">  
            <div class="flex flex-col items-center gap-1">
                <span class="text-black font-bold text-lg">{{ deck.length  + 1}} cartas</span>
                <div class="relative w-20 h-36" :style="{ width:'90px', height:'135px' }">
                    <div class="absolute top-0 left-0 z-1">
                        <img
                            v-if="deck.length > 0"
                            :src="semFace"
                            class="card"
                        />
                    </div>
                    <div v-if="deck.length === 0" class="absolute left-0 right-0 mx-auto top-0">
                        <div class="w-20 h-36 border-2 border-dashed rounded-lg flex items-center justify-center text-sm text-gray-400">
                        Empty
                        </div>
                    </div>
                </div>
            </div>
                <div class="trump mt-2" >
                    <div v-if="trumpCard" class="relative" style="margin-left: -80px; margin-top: 23px;">
                        <img
                            :src="trumpCard.src"
                            class="card card-img"
                            :style="{ transform: 'rotate(90deg)', transformOrigin:'center' }"
                        />
                    </div>
                </div>
            <div class="flex-1 h-40 border-2 border-dashed rounded-lg bg-transparent flex items-center justify-center">   
            </div>
        </div>

        <div class="player-hand flex flex-wrap gap-1 justify-center items-center">
            <img
                v-for="(card,i) in playerCards"
                :key="i"
                :src="card.src"
                class="card card-img cursor-pointer"
            />
        </div>
    </div>

</template>

<style>
.card {
    transition: transform .15s ease-in-out;
}

.card-img {
  width: 90px;
  border-radius: 6px;
}

.card:hover {
    transform: scale(1.1);
}
</style>