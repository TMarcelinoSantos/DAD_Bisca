<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BiscaGame from './BiscaGame.vue';
//import semFace from '@/cards/semFace.png'
import { useGameStore } from '@/stores/game'
import { useSocketStore } from '@/stores/socket';
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const gameStore = useGameStore()
const socketStore = useSocketStore()

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
  multiPlayer: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: String,
    default: null
  },
})

const semFace = computed(() =>
  authStore.currentUser?.card_theme
    ? `/cards/${authStore.currentUser.card_theme}`
    : '/cards/semFace.png'
)

const onCardClick = (card) => {
    if (!isCardPlayable(card.id)) return

    if (props.multiPlayer && props.roomId) {
        // In multiplayer, let the server apply game rules and
        // broadcast the updated board via game:updated.
        socketStore.emitPlayCard(props.roomId, card)
    } else {
        // Single player: use local game logic with AI
        gameStore.playCard(card)
    }
}

const isCardPlayable = (id) => gameStore.getValidPlayerCards().includes(id)

const isPlayerTurn = computed(() => gameStore.turn === 'player')
const isOpponentTurn = computed(() => gameStore.turn === 'opponent')

const playerPoints = computed(() => gameStore.playerTotalPoints)
const opponentPoints = computed(() => gameStore.opponentTotalPoints)

const remainingSeconds = computed(() => gameStore.remainingTurnSeconds)

// Multiplayer countdown derived from server-side turnDeadlineAt
const multiplayerSeconds = ref(null)

// Keep reference to interval so it can be cleared on unmount
const multiplayerIntervalId = ref(null)

const isMultiplayerGameOver = computed(
  () => socketStore.currentGame?.state === 'finished',
)

const handleMultiplayerResign = () => {
  const gameId = socketStore.currentGame?.id ?? Number(props.roomId)
  if (!gameId || Number.isNaN(gameId)) return
  socketStore.resignGame(gameId)
}

onMounted(() => {
  if (!props.multiPlayer) return

  // Update multiplayer countdown based on server-side deadline
  multiplayerIntervalId.value = setInterval(() => {
    const rawDeadline = socketStore.currentGame?.board?.turnDeadlineAt

    if (rawDeadline == null) {
      multiplayerSeconds.value = null
      return
    }

    // Coerce possible formats (number timestamp or ISO/string)
    let deadline = rawDeadline
    if (typeof rawDeadline === 'string') {
      const numeric = Number(rawDeadline)
      deadline = Number.isNaN(numeric) ? Date.parse(rawDeadline) : numeric
    }

    if (typeof deadline !== 'number' || Number.isNaN(deadline)) {
      multiplayerSeconds.value = null
      return
    }

    const diff = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
    multiplayerSeconds.value = diff
  }, 500)
})

onUnmounted(() => {
  if (multiplayerIntervalId.value) {
    clearInterval(multiplayerIntervalId.value)
    multiplayerIntervalId.value = null
  }
})
</script>

<template>

    <div class="flex flex-col justify-around items-center w-full min-h-screen"
        :style="{ backgroundColor: '#0b7a3c', padding: '100px 20px 120px 20px' }">
        <div class="flex flex-col items-center">
            <div class="mb-2 flex items-center gap-2 text-sm text-white/90">
                <span
                    class="inline-flex h-2.5 w-2.5 rounded-full"
                    :class="isOpponentTurn ? 'bg-amber-300 shadow-[0_0_0_2px_rgba(250,204,21,0.6)]' : 'bg-slate-600'"
                ></span>
                <span class="font-semibold">Opponent</span>
                <span class="text-xs text-white/75">Points: {{ opponentPoints }}</span>
            </div>
            <div class="opponent-hand flex flex-wrap gap-1 justify-center items-center">
                <img
                    v-for="(card,i) in opponentCards"
                    :key="i"
                    :src="semFace"
                    class="card card-img"
                />
            </div>
        </div>

        <div class="w-full max-w-3xl flex items-start gap-6 px-4">  
            <div class="flex flex-col items-center gap-1">
                <span class="text-black font-bold text-lg">{{ deck.length}} cartas</span>
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
                    <div v-if="trumpCard && !trumpCard.hidden" class="relative" style="margin-left: -80px; margin-top: 23px;">
                        <img
                            :src="trumpCard.src"
                            class="card card-img"
                            :style="{ transform: 'rotate(90deg)', transformOrigin:'center' }"
                        />
                    </div>
                </div>
            <!-- play zone -->
            <div class="flex-1 h-40 border-2 border-dashed rounded-lg bg-transparent flex items-center justify-center gap-4">
                <img 
                    v-for="(card,i) in gameStore.playedCards"
                    :key="i"
                :src="card?.src || semFace"
                    class="card card-img"
                />
            </div>
        </div>

              <div class="flex flex-col items-center">
                <div class="mt-4 flex items-center gap-2 text-sm text-white/90">
                  <span
                    class="inline-flex h-2.5 w-2.5 rounded-full"
                    :class="isPlayerTurn ? 'bg-amber-300 shadow-[0_0_0_2px_rgba(250,204,21,0.6)]' : 'bg-slate-600'"
                  ></span>
                  <span class="font-semibold">You</span>
                  <span class="text-xs text-white/75">Points: {{ playerPoints }}</span>
                  <span
                    v-if="isPlayerTurn && !props.multiPlayer"
                    class="ml-2 text-xs"
                    :class="remainingSeconds <= 5 ? 'text-red-200 font-semibold' : 'text-amber-100'"
                  >
                    {{ remainingSeconds }}s
                  </span>
                  <span
                    v-if="isPlayerTurn && props.multiPlayer && multiplayerSeconds !== null"
                    class="ml-2 text-xs"
                    :class="multiplayerSeconds <= 5 ? 'text-red-200 font-semibold' : 'text-amber-100'"
                  >
                    {{ multiplayerSeconds }}s
                  </span>
                </div>
                <button
                  v-if="!props.multiPlayer && isPlayerTurn"
                  class="mt-1 mb-1 px-3 py-1 text-xs rounded bg-red-600/80 text-white hover:bg-red-700"
                  @click="gameStore.resign('player')"
                >
                  Resign
                </button>
                <button
                  v-if="props.multiPlayer && !isMultiplayerGameOver"
                  class="mt-1 mb-1 px-3 py-1 text-xs rounded bg-red-600/80 text-white hover:bg-red-700"
                  @click="handleMultiplayerResign"
                >
                  Resign
                </button>
                <div class="player-hand flex flex-wrap gap-1 justify-center items-center mt-1">
                  <img
                    v-for="(card,i) in playerCards"
                    :key="i"
                    :src="card?.src || semFace"
                    class="card card-img cursor-pointer"
                    @click="onCardClick(card)"
                    :class="{
                      'opacity-100 cursor-pointer':isCardPlayable(card.id),
                      'opacity-40 cursor-not-allowed':!isCardPlayable(card.id)
                    }"
                  />
                </div>
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