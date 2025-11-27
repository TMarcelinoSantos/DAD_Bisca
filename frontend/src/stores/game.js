import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
    const hands = [
        { value: '9', label: 'Hand of 9' },
        { value: '3', label: 'Hand of 3' },
    ]
    const hand = ref('9')

    const opponentHand = ref([])
    const playerHand = ref([])
    const deck = ref([])
    const trumpCard = ref(null)

    const shuffle = (array) => {
        const a = array.slice()
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
        }
        return a
    }

    const loadImagesAsDeck = () => {
        const modules = import.meta.glob('../cards/*.{png,jpg,jpeg}', { eager: true })
        const imgs = Object.entries(modules)
            .map(([path, mod]) => {
                const file = path.split('/').pop()
                const id = file.replace(/\.[^/.]+$/, '')
                const src = mod.default
                return {path, id, src }
            })
            .filter(i => !/semFace/i.test(i.path))
            .map(i => ({ id: i.id, src: i.src }))

        return imgs
    }


    const setBoard = () => {

        const imgs = loadImagesAsDeck()
        const shuffled = shuffle(imgs)

        deck.value = shuffled.slice()
        playerHand.value = []
        opponentHand.value = []


        for (let i = 0; i < parseInt(hand.value); i++) {
            playerHand.value.push(deck.value.pop())
            opponentHand.value.push(deck.value.pop())
        }

        trumpCard.value = deck.value.pop()
    }

    return {
        hands,
        hand,
        playerHand,
        opponentHand,
        deck,
        trumpCard,
        setBoard,
    }
})