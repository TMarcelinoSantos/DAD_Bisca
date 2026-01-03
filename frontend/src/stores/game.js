import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './auth'
import { useAPIStore } from './api'
import { toast } from 'vue-sonner'

export const useGameStore = defineStore('game', () => {
    const apiStore = useAPIStore()
    const authStore = useAuthStore()

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
    const beganAt = ref(undefined)
    const endedAt = ref(undefined)
    const currentGameId = ref(null)
    const totalRounds = ref(0)
    const playerTotalPoints = ref(0)
    const opponentTotalPoints = ref(0)
    const roundSaved = ref(false)
    const lastRoundWinner = ref(null)
    const lastGameWinner = ref(null)

    // Tracks forced game endings (timeout / resign)
    const forcedGameEnd = ref(false)

    // Turn timer (single-player)
    const TURN_LIMIT_SECONDS = 20
    const remainingTurnSeconds = ref(TURN_LIMIT_SECONDS)
    let turnTimerId = null

    // MULTIPLAYER
    const multiplayerGames = ref([])          // list from lobby (joinable games, etc.)
    const activeMultiplayerGame = ref(null)   // game object from websockets server

    const isMultiplayerGame = computed(() => !!activeMultiplayerGame.value)
    // Explicit flag to control whether the local 20s timer
    // should be active for the current board (single-player only).
    const isTimerEnabled = ref(false)

    const setGames = (games) => {
        multiplayerGames.value = Array.isArray(games) ? games : []
    }

    const setActiveMultiplayerGame = (game) => {
        activeMultiplayerGame.value = game ?? null
    }

    const syncFromServerGame = (game) => {
        activeMultiplayerGame.value = game ?? null
        isTimerEnabled.value = false
        if (!game?.board) return

        const board = game.board
        const allCards = getAllCards()
        const cardMap = new Map(allCards.map(c => [c.id, c]))

        const mapIdsToCards = (ids = []) =>
            ids
                .map(id => cardMap.get(id))
                .filter(Boolean)
                .map(c => ({ ...c }))

        // Determine which seat is "me" 
        const mySeat = game._seat === 'player2' ? 'player2' : 'player1'

        const myHandIds = mySeat === 'player1' ? board.playerHand : board.opponentHand
        const oppHandIds = mySeat === 'player1' ? board.opponentHand : board.playerHand

        deck.value = mapIdsToCards(board.deck)
        playerHand.value = mapIdsToCards(myHandIds)
        opponentHand.value = mapIdsToCards(oppHandIds)

        trumpCard.value = board.trumpCard
            ? { ...(cardMap.get(board.trumpCard) || {}), hidden: !!board.trumpHidden }
            : null

        playedCards.value = (board.playedCards || []).map(pc => ({
            ...(cardMap.get(pc.id) || {}),
            id: pc.id,
            player: pc.player,
        }))

        // Map won cards and points by seat
        const myWonIds = mySeat === 'player1' ? board.playerCardWon : board.opponentCardWon
        const oppWonIds = mySeat === 'player1' ? board.opponentCardWon : board.playerCardWon

        playerCardWon.value = mapIdsToCards(myWonIds)
        opponentCardWon.value = mapIdsToCards(oppWonIds)

        const myPoints =
            mySeat === 'player1' ? board.playerTotalPoints : board.opponentTotalPoints
        const oppPoints =
            mySeat === 'player1' ? board.opponentTotalPoints : board.playerTotalPoints

        // Turn must also be mapped to local 'player' / 'opponent'
        if (mySeat === 'player1') {
            turn.value = board.turn || 'player'
        } else {
            // server's 'player' is remote for seat2
            turn.value = board.turn === 'player' ? 'opponent' : 'player'
        }

        playerTotalPoints.value = myPoints || 0
        opponentTotalPoints.value = oppPoints || 0
    }

    const resetMultiplayer = () => {
        multiplayerGames.value = []
        activeMultiplayerGame.value = null
        forcedGameEnd.value = false

        // Clear board state and scores so a new multiplayer
        // game does not reuse points or cards from the previous one.
        playerHand.value = []
        opponentHand.value = []
        deck.value = []
        playedCards.value = []
        playerCardWon.value = []
        opponentCardWon.value = []
        playerTotalPoints.value = 0
        opponentTotalPoints.value = 0
    }

    const getBoardSnapshot = () => {
        return {
            deck: deck.value.map(c => c.id),
            playerHand: playerHand.value.map(c => c.id),
            opponentHand: opponentHand.value.map(c => c.id),
            trumpCard: trumpCard.value?.id ?? null,
            trumpHidden: !!trumpCard.value?.hidden,
            playedCards: playedCards.value.map(c => ({
                id: c.id,
                player: c.player,
            })),
            playerCardWon: playerCardWon.value.map(c => c.id),
            opponentCardWon: opponentCardWon.value.map(c => c.id),
            turn: turn.value,
            playerTotalPoints: playerTotalPoints.value,
            opponentTotalPoints: opponentTotalPoints.value,
        }
    }

    // MULTIPLAYER END

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

    let allCardsCache = null
    const getAllCards = () => {
        if (!allCardsCache) {
            allCardsCache = loadImagesAsDeck()
        }
        return allCardsCache
    }

    const startGame = async () => {
        if (!authStore.currentUser) return
        if (currentGameId.value) return currentGameId.value

        const currentUser = authStore.currentUser
        const playerId = currentUser?.id ?? null

        const game = {
            type: hand.value,
            status: 'PL',
            player1_user_id: playerId,
            began_at: beganAt.value,
            match_id: currentMatchId.value?? null
        }

        console.log("Enviar Game para API:", game)

        const response = await apiStore.postSingleGame(game)
        console.log("RESPONSE API:", response)
        currentGameId.value = response.data.data.id
        console.log("Current Game id: " + currentGameId.value)
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
        beganAt.value = new Date()
        turn.value = lastGameWinner.value ? lastGameWinner.value : 'player'
        isTimerEnabled.value = true

        if (turn.value === 'opponent') {
            nextTurn()
        }

        // Start turn timer once the initial board is ready
        startTurnTimer()
    }

    // Multiplayer board initializer: same dealing logic, but no AI turn
    const setBoardMultiplayer = () => {
        const imgs = loadImagesAsDeck()
        const shuffled = shuffle(imgs)

        deck.value = shuffled.slice()
        playerHand.value = []
        opponentHand.value = []

        // Reset any previous multiplayer game state
        playedCards.value = []
        playerCardWon.value = []
        opponentCardWon.value = []
        playerTotalPoints.value = 0
        opponentTotalPoints.value = 0

        for (let i = 0; i < parseInt(hand.value); i++) {
            playerHand.value.push(deck.value.pop())
            opponentHand.value.push(deck.value.pop())
        }

        trumpCard.value = deck.value.pop()
        beganAt.value = new Date()
        turn.value = 'player'
        forcedGameEnd.value = false
        isTimerEnabled.value = false
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

    const getCardsWon = async () => {
        if (playedCards.value.length < 2) return

        let winner = null

        const [card1, card2] = playedCards.value

        const trumpSuit = trumpCard.value.id[0] 
        const card1Suit = card1.id[0]
        const card2Suit = card2.id[0]
        
        if (card1Suit === trumpSuit && card2Suit !== trumpSuit) {
            winner = card1.player
        }else if (card2Suit === trumpSuit && card1Suit !== trumpSuit) {
            winner = card2.player
        }
        else if (card1Suit === card2Suit) {
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

        const roundPoints = getBiscaPoints([card1, card2])

        if(winner === 'player'){
            playerCardWon.value.push(card1, card2)
            turn.value = 'player'
            lastRoundWinner.value = 'player'
            playerTotalPoints.value += roundPoints
        }else{
            opponentCardWon.value.push(card1, card2)
            turn.value = 'opponent'
            lastRoundWinner.value = 'opponent'
            opponentTotalPoints.value += roundPoints
        }

        if(roundSaved.value) return;
        roundSaved.value = true

        if (currentGameId.value) {
            await saveRound({
                played: playedCards.value.slice(),
                playerHandSnapshot: playerHand.value.concat(),
                opponentHandSnapshot: opponentHand.value.concat(),
                trumpCardSnapshot: trumpCard.value
            })
        }

        totalRounds.value ++
        playedCards.value = []

        getDeckCard()

        console.log("My Points:", getBiscaPoints(playerCardWon.value))
        console.log("Opponent Points:", getBiscaPoints(opponentCardWon.value))

        roundSaved.value = false
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

    const clearTurnTimer = () => {
        if (turnTimerId) {
            clearInterval(turnTimerId)
            turnTimerId = null
        }
    }

    const forceWinFor = (winner) => {
        // Collect all remaining cards in the game and give them
        // to the winner as per timeout/resign rule.
        const winnerPile = winner === 'player' ? playerCardWon : opponentCardWon

        const remaining = []

        remaining.push(...deck.value)
        remaining.push(...playerHand.value)
        remaining.push(...opponentHand.value)

        // Cards currently on the table
        remaining.push(...playedCards.value.map(c => ({ ...c })))

        // Visible trump still on table
        if (trumpCard.value && !trumpCard.value.hidden) {
            remaining.push(trumpCard.value)
        }

        winnerPile.value.push(...remaining)

        const extraPoints = getBiscaPoints(remaining)
        if (winner === 'player') {
            playerTotalPoints.value += extraPoints
        } else {
            opponentTotalPoints.value += extraPoints
        }

        // Clear board state so game is effectively finished
        deck.value = []
        playerHand.value = []
        opponentHand.value = []
        playedCards.value = []
        trumpCard.value = null

        forcedGameEnd.value = true
        clearTurnTimer()
    }

    const handleTurnTimeout = () => {
        // Only enforce automatic timeout when timer is enabled (single-player).
        if (!isTimerEnabled.value) return

        if (turn.value === 'player') {
            forceWinFor('opponent')
        } else if (turn.value === 'opponent') {
            forceWinFor('player')
        }
    }

    const startTurnTimer = () => {
        // Timer in this store is only for boards that enabled it.
        if (!isTimerEnabled.value) return

        clearTurnTimer()

        // Don't start timer if game is already complete
        if (deck.value.length === 0 &&
            playerHand.value.length === 0 &&
            opponentHand.value.length === 0 &&
            playedCards.value.length === 0) {
            return
        }

        remainingTurnSeconds.value = TURN_LIMIT_SECONDS

        turnTimerId = setInterval(() => {
            if (remainingTurnSeconds.value > 0) {
                remainingTurnSeconds.value -= 1
            }

            if (remainingTurnSeconds.value <= 0) {
                clearTurnTimer()
                handleTurnTimeout()
            }
        }, 1000)
    }

    const resign = (who = 'player') => {
        if (who === 'player') {
            forceWinFor('opponent')
        } else {
            forceWinFor('player')
        }
    }

    const nextTurn = async () => {
        if(turn.value === 'opponent' && opponentHand.value.length > 0){
            await delay(100)
            await playOpponentCard()
            if(playedCards.value.length === 2){
                await delay(100)
                await getCardsWon()
                await nextTurn()
            }
        }
        if (deck.value.length === 0 && playerHand.value.length === 0 && 
            opponentHand.value.length === 0 && playedCards.value.length === 2) 
        {
            await delay(100)
            await getCardsWon()
        }
    }

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    const playCard = async (playerCard) => {
        if(turn.value !== 'player') return
        if (playedCards.value.length >= 2) return
        
        playerHand.value = playerHand.value.filter(c => c.id !== playerCard.id)
        playedCards.value.push({ ...playerCard, player: 'player' })

        turn.value = 'opponent'
        await delay(100)
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

        await delay(100);
        turn.value = 'player';
    }

    const getValidPlayerCards = () => {
        if (deck.value.length > 0)
            return playerHand.value.map(c => c.id)

        if (playedCards.value.length === 0)
            return playerHand.value.map(c => c.id)

        const opponentCard = playedCards.value[0]  
        const suit = opponentCard.id[0]           

        const matchingSuit = playerHand.value.filter(c => c.id[0] === suit)

        if (matchingSuit.length > 0) 
            return matchingSuit.map(c => c.id)

        return playerHand.value.map(c => c.id)
    }



    const saveGame = async () => {
        if (!authStore.currentUser) return
        const playerPoints = getBiscaPoints(playerCardWon.value)
        const botPoints = getBiscaPoints(opponentCardWon.value)
        const currentUser = authStore.currentUser

        const playerId = currentUser?.id ?? null
        const winnerUserId = (currentUser && playerPoints > botPoints) ? currentUser.id : null

        const isDraw = playerPoints === botPoints
        const gameId = currentGameId.value

        const gameUpdate = {
            status: 'E',
            ended_at: endedAt.value,
            total_time: Math.ceil((endedAt.value - beganAt.value) / 1000),
            winner_user_id: winnerUserId,
            is_draw: isDraw? 1 : 0,
            player_points: playerPoints,
            bot_points: botPoints,
            winner_user_id: winnerUserId,
        }
        toast.promise(apiStore.updateSingleGame(gameId, gameUpdate), {
            loading: 'Upating game...',
            success: () => {
                return `[API] Game saved successfully`
            },
            error: (data) => `[API] Error saving game - ${data?.response?.data?.message}`,
        })
        if (playerPoints > botPoints) {
            lastGameWinner.value = 'player'
        } else if (botPoints > playerPoints) {
            lastGameWinner.value = 'opponent'
        } else {
            lastGameWinner.value = null
        }
    }

    const isGameComplete = computed(() => {
        return forcedGameEnd.value || (
            deck.value.length === 0 &&
            playerHand.value.length === 0 &&
            opponentHand.value.length === 0 &&
            playedCards.value.length === 0
        )
    })

    const finalizeGame = (game) => {
        const board = game.board
        if (!board) return

        const playerPoints =
            board.playerTotalPoints ?? getBiscaPoints(board.playerCardWon || [])
        const opponentPoints =
            board.opponentTotalPoints ?? getBiscaPoints(board.opponentCardWon || [])

        let winner = 'tie'
        if (playerPoints > opponentPoints && playerPoints >= 61) {
            winner = 'player'
        } else if (opponentPoints > playerPoints && opponentPoints >= 61) {
            winner = 'opponent'
        }

        let playerMarks = 0
        let opponentMarks = 0
        if (winner !== 'tie') {
            const winnerPoints = winner === 'player' ? playerPoints : opponentPoints

            if (winnerPoints >= 61 && winnerPoints <= 90) {
                // 1 mark
                if (winner === 'player') playerMarks = 1
                else opponentMarks = 1
            } else if (winnerPoints >= 91 && winnerPoints <= 119) {
                // 2 marks (capote)
                if (winner === 'player') playerMarks = 2
                else opponentMarks = 2
            } else if (winnerPoints >= 120) {
                // 4 marks (bandeira)
                if (winner === 'player') playerMarks = 4
                else opponentMarks = 4
            }
        }

        game.result = {
            winner,               // 'player' | 'opponent' | 'tie'
            playerPoints,
            opponentPoints,
            playerMarks,
            opponentMarks,
        }

        game.state = 'finished'
    }

    // --- Bisca rules helpers (server-side multiplayer logic) ---
    const getCardId = (c) => (typeof c === 'string' ? c : c?.id)


    watch(isGameComplete, (value) => {
        if (value) {
            endedAt.value = new Date()
            clearTurnTimer()
        }
    })

    // (Re)start timer whenever local turn changes in single-player
    watch(turn, () => {
        startTurnTimer()
    }, { immediate: true })


    const saveRound = async ({played, playerHandSnapshot, opponentHandSnapshot, trumpCardSnapshot}) => {
        if (!currentGameId.value) return

    const roundPoints = getBiscaPoints(played.map(c => ({ id: c.id })))

    const playerRoundPoints = lastRoundWinner.value === 'player' ? roundPoints : 0    
    const opponentRoundPoints = lastRoundWinner.value === 'opponent' ? roundPoints : 0

        console.log("Saving round...")
        const roundData = {
            single_game_id: currentGameId.value,

            round_number: totalRounds.value + 1,

            player_hand: playerHandSnapshot.map(c => c.id),
            opponent_hand: opponentHandSnapshot.map(c => c.id),

            trump_card: trumpCardSnapshot?.id ?? null,
            deck_cards: deck.value.map(c => c.id),

            played_cards: played.map(c => ({
                id: c.id,
                player: c.player
            })),

            player_cards_won: playerCardWon.value.map(c => c.id),
            opponent_cards_won: opponentCardWon.value.map(c => c.id),

            winner_user_id: lastRoundWinner.value === "player"
                ? authStore.currentUser?.id ?? null
                : null,

            player_points: playerRoundPoints,
            opponent_points: opponentRoundPoints,
        }

        await apiStore.postRound(roundData)
    }

    const playAgain = async () => {
        clearTurnTimer()
        forcedGameEnd.value = false
        playerHand.value = []
        opponentHand.value = []
        deck.value = []
        playedCards.value = []
        playerCardWon.value = []
        opponentCardWon.value = []
        turn.value = 'player'
        beganAt.value = undefined
        endedAt.value = undefined
        totalRounds.value = 0
        playerTotalPoints.value = 0
        opponentTotalPoints.value = 0
        roundSaved.value = false
        currentGameId.value = null
        lastGameWinner.value = null
        await startGame()
        setBoard()
    }

    const resetMultiplayerBoard = () => {
        clearTurnTimer()
        forcedGameEnd.value = false
        playerHand.value = []
        opponentHand.value = []
        deck.value = []
        playedCards.value = []
        playerCardWon.value = []
        opponentCardWon.value = []
        turn.value = 'player'
        beganAt.value = undefined
        endedAt.value = undefined
        totalRounds.value = 0
        playerTotalPoints.value = 0
        opponentTotalPoints.value = 0
        roundSaved.value = false
        lastGameWinner.value = null

        // Re-deal a fresh multiplayer board
        setBoardMultiplayer()
    }

    //-----------------------MATCHES---------------------------------

    const isAuthenticated = computed(() => !!authStore.currentUser)

    const playerMarks = ref(0)
    const opponentMarks = ref(0)

    const currentMatchId = ref(null)
    const getWinType = ref(null)

    const getPointsMatches = (playerPoints, opponentPoints) =>{
        const winnerPoints = playerPoints > opponentPoints ? playerPoints : opponentPoints

        if(playerPoints == opponentPoints) return 0

        if(winnerPoints >= 61 && winnerPoints <= 90){
            return 1
        }
        else if(winnerPoints > 90 && winnerPoints < 120){
            getWinType.value = "capote"
            return 2
        } else if(winnerPoints >= 120){
            getWinType.value = "bandeira"
            return 4
        }

        return 0
    }

    const resetMatch = () => {
        playerMarks.value = 0
        opponentMarks.value = 0
        currentMatchId.value = null
        currentGameId.value = null

        clearTurnTimer()
        forcedGameEnd.value = false
        playerHand.value = []
        opponentHand.value = []
        deck.value = []
        playedCards.value = []
        playerCardWon.value = []
        opponentCardWon.value = []
        turn.value = 'player'
        beganAt.value = undefined
        endedAt.value = undefined
        totalRounds.value = 0
        playerTotalPoints.value = 0
        opponentTotalPoints.value = 0
        roundSaved.value = false
        lastGameWinner.value = null
    }

    const addMatchPoints = () => {
        // For multiplayer matches we rely on the board's total points,
        // which can be normalized by the server (e.g. resignation).
        let playerPoints
        let opponentPoints

        if (isMultiplayerGame.value) {
            playerPoints = playerTotalPoints.value
            opponentPoints = opponentTotalPoints.value
        } else {
            playerPoints = getBiscaPoints(playerCardWon.value)
            opponentPoints = getBiscaPoints(opponentCardWon.value)
        }

        const marks = getPointsMatches(playerPoints, opponentPoints)

        if (playerPoints > opponentPoints) {
            playerMarks.value += marks
        } else if (opponentPoints > playerPoints) {
            opponentMarks.value += marks
        }

        playerTotalPoints.value = playerPoints
        opponentTotalPoints.value = opponentPoints

        playerCardWon.value = []
        opponentCardWon.value = []
    }

    const startMatch = async () => {
        if (!authStore.currentUser) return
        if (currentMatchId.value) return currentMatchId.value

        const currentUser = authStore.currentUser
        const playerId = currentUser?.id ?? null

        const match = {
            type: hand.value,
            status: 'PL',
            player1_user_id: playerId,
            began_at: beganAt.value,
        }

        console.log("Enviando MATCH para API:", match)

        const response = await apiStore.postSingleMatch(match)
        currentMatchId.value = response.data.id
        startGame()
    }


    const saveMatch = async () => {
        if (!authStore.currentUser) return
        const playerPoints = getBiscaPoints(playerCardWon.value)
        const botPoints = getBiscaPoints(opponentCardWon.value)
        const currentUser = authStore.currentUser

        const playerId = currentUser?.id ?? null
        const winnerUserId = (currentUser && playerPoints > botPoints) ? currentUser.id : null

        const matchId = currentMatchId.value

        const matchUpdate = {
            status: 'E',
            ended_at: endedAt.value,
            total_time: Math.ceil((endedAt.value - beganAt.value) / 1000),
            winner_user_id: winnerUserId,
            player1_user_id: playerId,
            player1_marks: playerMarks.value,
            opponent_marks: opponentMarks.value,
        }
        toast.promise(apiStore.updateSingleMatch(matchId, matchUpdate), {
            loading: 'Upating match...',
            success: () => {
                return `[API] Match saved successfully`
            },
            error: (data) => `[API] Error saving match - ${data?.response?.data?.message}`,
        })
    }


    return {
        hands,
        hand,
        playerHand,
        opponentHand,
        deck,
        trumpCard,
        setBoard,
        setBoardMultiplayer,
        playCard,
        playedCards,
        playerCardWon,
        opponentCardWon,
        turn,
        getValidPlayerCards,
        saveGame,
        startGame,
        isGameComplete,
        playerTotalPoints,
        opponentTotalPoints,
        playAgain,
        getBiscaPoints,
        addMatchPoints,
        resetMatch,
        getWinType,
        playerMarks,
        opponentMarks,
        saveMatch,
        startMatch,
        isAuthenticated,

        // MULTIPLAYER
        multiplayerGames,
        activeMultiplayerGame,
        isMultiplayerGame,
        setGames,
        setActiveMultiplayerGame,
        syncFromServerGame,
        resetMultiplayer,
        getBoardSnapshot,

        // Turn timer / resign
        remainingTurnSeconds,
        resign,
        resetMultiplayerBoard,
    }
})