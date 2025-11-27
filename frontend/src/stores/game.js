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
    const playedCards = ref([])
    const playerCardWon = ref([])
    const opponentCardWon = ref([])
    const turn = ref('player') 

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

    const getBiscaPoints = (cards) => {
        let total = 0
        cards.forEach(card => {
            if (['c1','e1','o1','p1'].includes(card.id)) {
                total += 11
            } else if (['c7','e7','o7','p7'].includes(card.id)) {
                total += 10
            } else if (['c11','e11','o11','p11'].includes(card.id)) {
                total += 3
            } else if (['c12','e12','o12','p12'].includes(card.id)) {
                total += 2
            } else if (['c13','e13','o13','p13'].includes(card.id)) {
                total += 4
            }
        })
        return total
    }

    const getCardsWon = () => {
        if (playedCards.value.length < 2) return

        let winner = null

        const [card1, card2] = playedCards.value

        const trumpSuit = trumpCard.value.id[0] 
        const card1Suit = card1.id[0]
        const card2Suit = card2.id[0]
        
        if (card1.id[0] === trumpSuit && card2.id[0] !== trumpSuit) {
            winner = card1.player
        }else if (card2.id[0] === trumpSuit && card1.id[0] !== trumpSuit) {
            winner = card2.player
        }
        else if (card1.id[0] === card2.id[0]) {
            //both cards are of the same suit, higher card wins
            const pointsCard1 = getBiscaPoints([card1])
            const pointsCard2 = getBiscaPoints([card2])

            winner = pointsCard1 > pointsCard2 ? card1.player : card2.player
        }
        else{
            //Otherwise,the first card played wins the trick
            if(playedCards.value[0].player === 'player'){
                winner = 'player'
            }else{
                winner = 'opponent'
            }
        }

        if(winner === 'player'){
            playerCardWon.value.push(card1, card2)
            turn.value = 'player'
        }else{
            opponentCardWon.value.push(card1, card2)
            turn.value = 'opponent'
        }
        playedCards.value = []

        getDeckCard()

        console.log("My Points:", getBiscaPoints(playerCardWon.value))
        console.log("Opponent Points:", getBiscaPoints(opponentCardWon.value))
    }

    const getDeckCard = () => {
        if (deck.value.length === 0) return

        let firstPlayer = null
        let secondPlayer = null

        if(turn.value === 'player'){
            firstPlayer = playerHand;
            secondPlayer = opponentHand;
        } else {
            firstPlayer = opponentHand;
            secondPlayer = playerHand;
        }

        if(deck.value.length > 1){
            firstPlayer.value.push(deck.value.pop());
            secondPlayer.value.push(deck.value.pop());
        } else {
            firstPlayer.value.push(deck.value.pop());
            if(trumpCard.value) {
                secondPlayer.value.push(trumpCard.value);
                trumpCard.value.hidden = true
            }
        }
    }

    const nextTurn = async () => {
        if(turn.value === 'opponent' && opponentHand.value.length > 0){
            await delay(1000)
            await playOpponentCard()
            if(playedCards.value.length === 2){
                await delay(1000)
                getCardsWon()
                await nextTurn()
            }
        }
    }

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    const playCard = async (playerCard) => {
        if(turn.value !== 'player') return
        if (playedCards.value.length >= 2) return
        
        playerHand.value = playerHand.value.filter(c => c.id !== playerCard.id)
        playedCards.value.push({ ...playerCard, player: 'player' })

        turn.value = 'opponent'
        await delay(1000)
        await nextTurn()
    }

    const playOpponentCard = async () => {
        if (turn.value !== 'opponent') return
        if (playedCards.value.length >= 2) return

        let cardToPlay;

        if (playedCards.value.length === 0) {
            // it plays its lowest-value card.
            cardToPlay = opponentHand.value.reduce((lowest, card) => {
                return getBiscaPoints([card]) < getBiscaPoints([lowest]) ? card : lowest;
            }, opponentHand.value[0]);
        } else if (playedCards.value.length === 1) {
            const playerCard = playedCards.value[0];
            const playerSuit = playerCard.id[0];

            // same suit and higher value
            const higherSameSuit = opponentHand.value.filter(
                c => c.id[0] === playerSuit && getBiscaPoints([c]) > getBiscaPoints([playerCard])
            );

            if (higherSameSuit.length > 0) {
                cardToPlay = higherSameSuit.reduce((best, c) =>
                    getBiscaPoints([c]) < getBiscaPoints([best]) ? c : best
                );
            } else if(getBiscaPoints([playerCard]) > 0){
                //if card played by player has points, try to play a trump card
                const trumpSuit = trumpCard.value.id[0];
                const higherTrumps = opponentHand.value.filter(
                    c => c.id[0] === trumpSuit && getBiscaPoints([c]) > getBiscaPoints([playerCard])
                );
                if (higherTrumps.length > 0) {
                    cardToPlay = higherTrumps.reduce((best, c) =>
                        getBiscaPoints([c]) < getBiscaPoints([best]) ? c : best
                    );
                }
            }

            // if can't win, play lowest value card
            if (!cardToPlay) {
                cardToPlay = opponentHand.value.reduce((lowest, card) => {
                    return getBiscaPoints([card]) < getBiscaPoints([lowest]) ? card : lowest;
                }, opponentHand.value[0]);
            }
        }

        opponentHand.value = opponentHand.value.filter(c => c.id !== cardToPlay.id);
        playedCards.value.push({ ...cardToPlay, player: 'opponent' });

        await delay(1000);
        turn.value = 'player';
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
        playCard,
        playedCards,
        playerCardWon,
        opponentCardWon,
        turn,
    }
})