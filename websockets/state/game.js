const games = new Map()
let currentGameID = 0

// Per-game turn timers for multiplayer (server-side 20s rule)
const turnTimers = new Map()

// Socket.io instance (set from events layer) so we can
// broadcast updates from server-side timeouts.
let ioRef = null

export const setGameIO = (io) => {
    ioRef = io
}

const nextGameID = () => ++currentGameID

export const joinGame = (gameID, player) => {
    const game = games.get(gameID)
    if (!game) throw new Error('Game not found')

    // already in room
    if (
        (game.player1 && game.player1.username === player.username) ||
        (game.player2 && game.player2.username === player.username)
    ) {
        return game
    }

    if (!game.player1) {
        game.player1 = player
    } else if (!game.player2) {
        game.player2 = player
    } else {
        throw new Error('Game is full')
    }

    if (game.player1 && game.player2) {
        // When both seats are filled, game starts
        game.state = 'playing'
        if (!game.beganAt) {
            game.beganAt = new Date().toISOString()
        }
    }

    return game
}

export const getGame = (gameID) => games.get(gameID)

export const getGames = () => {
    return Array.from(games.values())
}

export const getJoinableGames = () => {
    return Array.from(games.values()).filter(
        (g) => g.state === 'waiting' && (!g.player1 || !g.player2),
    )
}

export const createGame = (player1, type = '9') => {
    const gameID = nextGameID()
    const game = {
        id: gameID,
        player1: player1,
        player2: null,
        state: 'waiting',
        type,
        createdAt: Date.now(),
        moves: [],
        board: {
            deck: [],              // array of card ids
            playerHand: [],        // ids for first seat
            opponentHand: [],      // ids for second seat
            trumpCard: null,       // trump card id
            trumpHidden: false,
            playedCards: [],       // [{ id, player: 'player'|'opponent' }]
            turn: 'player',        // whose turn from host perspective
            playerCardWon: [],
            opponentCardWon: [],
            playerTotalPoints: 0,
            opponentTotalPoints: 0,
        },
    }
    games.set(gameID, game)
    return game
}

const clearTurnTimer = (gameID) => {
    const existing = turnTimers.get(gameID)
    if (existing) {
        clearTimeout(existing)
        turnTimers.delete(gameID)
    }
}

const scheduleTurnTimer = (game, timeoutMs = 20000) => {
    clearTurnTimer(game.id)

    if (game.state !== 'playing') return
    const board = game.board
    if (!board) return
    if (isGameComplete(board)) return

    const deadline = Date.now() + timeoutMs
    board.turnDeadlineAt = deadline

    const timerId = setTimeout(() => {
        try {
            const seat = board.turn
            if (seat !== 'player' && seat !== 'opponent') return

            const resigningPlayer =
                seat === 'player' ? game.player1 : game.player2
            if (!resigningPlayer) return

            const updated = resignGame(game.id, resigningPlayer)

            // Broadcast the timeout result to all clients in this game room
            if (ioRef && updated) {
                ioRef.to(`game:${updated.id}`).emit('game:updated', updated)
            }
        } catch (err) {
            console.error('[TurnTimer] Error handling timeout', err)
        } finally {
            clearTurnTimer(game.id)
        }
    }, timeoutMs)

    turnTimers.set(game.id, timerId)
}

export const updateGameBoard = (gameID, partialBoard) => {
    const game = games.get(gameID)
    if (!game) throw new Error('Game not found')

    game.board = {
        ...(game.board || {}),
        ...partialBoard,
    }

    if (game.state === 'playing') {
        scheduleTurnTimer(game)
    } else {
        clearTurnTimer(gameID)
    }

    return game
}

export const resignGame = (gameID, player) => {
    const game = games.get(gameID)
    if (!game) throw new Error('Game not found')
    if (game.state !== 'playing') throw new Error('Game is not in playing state')

    const board = game.board
    if (!board) throw new Error('Game board not initialized')

    const seat =
        game.player1 && game.player1.username === player.username
            ? 'player'
            : game.player2 && game.player2.username === player.username
              ? 'opponent'
              : null

    if (!seat) throw new Error('Player not part of this game')

    const winnerSeat = seat === 'player' ? 'opponent' : 'player'

    const remaining = []
    remaining.push(...board.deck)
    remaining.push(...board.playerHand)
    remaining.push(...board.opponentHand)
    remaining.push(...(board.playedCards || []).map((c) => getCardId(c)))

    if (board.trumpCard && !board.trumpHidden) {
        remaining.push(getCardId(board.trumpCard))
    }

    if (winnerSeat === 'player') {
        board.playerCardWon.push(...remaining)
    } else {
        board.opponentCardWon.push(...remaining)
    }

    const extraPoints = getBiscaPoints(remaining)
    if (winnerSeat === 'player') {
        board.playerTotalPoints += extraPoints
    } else {
        board.opponentTotalPoints += extraPoints
    }

    board.deck = []
    board.playerHand = []
    board.opponentHand = []
    board.playedCards = []
    board.trumpCard = null

    finalizeGame(game)
    clearTurnTimer(gameID)
    return game
}
// --- Bisca rules helpers (server-side multiplayer logic) ---

const getCardId = (c) => (typeof c === 'string' ? c : c?.id)

const getBiscaPoints = (cards) => {
    let total = 0
    for (const raw of cards) {
        const id = getCardId(raw)
        if (!id) continue
        if (['c1', 'e1', 'o1', 'p1'].includes(id)) total += 11
        else if (['c7', 'e7', 'o7', 'p7'].includes(id)) total += 10
        else if (['c11', 'e11', 'o11', 'p11'].includes(id)) total += 3
        else if (['c12', 'e12', 'o12', 'p12'].includes(id)) total += 2
        else if (['c13', 'e13', 'o13', 'p13'].includes(id)) total += 4
    }
    return total
}

const isGameComplete = (board) => {
    return (
        board.deck.length === 0 &&
        board.playerHand.length === 0 &&
        board.opponentHand.length === 0 &&
        board.playedCards.length === 0
    )
}

const getDeckCard = (game) => {
    const board = game.board
    if (!board || board.deck.length === 0) return

    let firstHand
    let secondHand

    if (board.turn === 'player') {
        firstHand = 'playerHand'
        secondHand = 'opponentHand'
    } else {
        firstHand = 'opponentHand'
        secondHand = 'playerHand'
    }

    if (board.deck.length > 1) {
        const firstCard = board.deck.pop()
        const secondCard = board.deck.pop()
        board[firstHand].push(firstCard)
        board[secondHand].push(secondCard)
    } else {
        const lastCard = board.deck.pop()
        board[firstHand].push(lastCard)
        if (board.trumpCard) {
            board[secondHand].push(board.trumpCard)
            board.trumpHidden = true
        }
    }
}

const resolveTrick = (game) => {
    const board = game.board
    if (!board || board.playedCards.length < 2) return

    const [card1, card2] = board.playedCards

    const trumpSuit = getCardId(board.trumpCard)?.[0]
    const card1Id = getCardId(card1)
    const card2Id = getCardId(card2)
    const card1Suit = card1Id?.[0]
    const card2Suit = card2Id?.[0]

    let winner = null // 'player' | 'opponent'

    if (card1Suit === trumpSuit && card2Suit !== trumpSuit) {
        winner = card1.player
    } else if (card2Suit === trumpSuit && card1Suit !== trumpSuit) {
        winner = card2.player
    } else if (card1Suit === card2Suit) {
        const points1 = getBiscaPoints([card1])
        const points2 = getBiscaPoints([card2])
        winner = points1 >= points2 ? card1.player : card2.player
    } else {
        // different suits and no trump advantage – first played wins
        winner = card1.player
    }

    const roundPoints = getBiscaPoints([card1, card2])

    if (winner === 'player') {
        board.playerCardWon.push(card1Id, card2Id)
        board.playerTotalPoints += roundPoints
    } else {
        board.opponentCardWon.push(card1Id, card2Id)
        board.opponentTotalPoints += roundPoints
    }

    board.turn = winner
    board.playedCards = []

    getDeckCard(game)
}

const finalizeGame = (game) => {
    const board = game.board
    if (!board) return

    const now = new Date()

    // total points for each side
    const playerPoints =
        board.playerTotalPoints ?? getBiscaPoints(board.playerCardWon || [])
    const opponentPoints =
        board.opponentTotalPoints ?? getBiscaPoints(board.opponentCardWon || [])

    // who wins the game (61+ points)
    let winner = 'tie'
    if (playerPoints > opponentPoints && playerPoints >= 61) {
        winner = 'player'
    } else if (opponentPoints > playerPoints && opponentPoints >= 61) {
        winner = 'opponent'
    }

    // marks according to Bisca rules
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
        winner,          // 'player' | 'opponent' | 'tie'
        playerPoints,
        opponentPoints,
        playerMarks,
        opponentMarks,
    }

    // Mark game as finished in time terms as well
    game.endedAt = now.toISOString()
    if (game.beganAt) {
        const start = new Date(game.beganAt)
        const diffSeconds = Math.max(0, Math.round((now - start) / 1000))
        game.totalTimeSeconds = diffSeconds
    }

    game.state = 'finished'
}

export const playerMove = (gameID, player, move) => {
    const game = games.get(gameID)
    if (!game) throw new Error('Game not found')
    if (game.state !== 'playing') throw new Error('Game is not in playing state')

    const board = game.board
    if (!board) throw new Error('Game board not initialized')

    const seat =
        game.player1 && game.player1.username === player.username
            ? 'player'
            : game.player2 && game.player2.username === player.username
              ? 'opponent'
              : null

    if (!seat) throw new Error('Player not part of this game')

    if (board.turn !== seat) throw new Error('Not your turn')

    const handKey = seat === 'player' ? 'playerHand' : 'opponentHand'
    const cardId = getCardId(move.card)
    const hand = board[handKey]

    if (!hand.includes(cardId)) throw new Error('Card not in hand')

    // remove from hand
    board[handKey] = hand.filter((id) => id !== cardId)

    // add to table
    board.playedCards.push({ id: cardId, player: seat })

    if (board.playedCards.length === 1) {
        // switch turn to the other player
        board.turn = seat === 'player' ? 'opponent' : 'player'
    } else if (board.playedCards.length === 2) {
        // resolve trick and possibly draw from deck
        resolveTrick(game)
        if (isGameComplete(board)) {
            finalizeGame(game)
            clearTurnTimer(gameID)
        }
    }

    if (game.state === 'playing') {
        scheduleTurnTimer(game)
    }

    // keep move history for debugging/auditing
    game.moves.push({ ...move, by: player.username })

    return game
}

export const leaveGame = (gameID, player) => {
    const game = games.get(gameID)
    if (!game) return null

    const isP1 = game.player1 && game.player1.username === player.username
    const isP2 = game.player2 && game.player2.username === player.username

    if (!isP1 && !isP2) return game

    if (isP1) game.player1 = null
    if (isP2) game.player2 = null

    if (!game.player1 && !game.player2) {
        games.delete(gameID)
        clearTurnTimer(gameID)
        return null
    }

    if (game.state === 'playing') {
        game.state = 'finished'
        clearTurnTimer(gameID)
    }

    return game
}

export const cleanupFinishedGames = (maxAgeMs = 1000 * 60 * 60) => {
    const now = Date.now()
    for (const [id, game] of games.entries()) {
        const createdAt = game.createdAt ?? now
        if (
            (game.state === 'finished' || (!game.player1 && !game.player2)) &&
            now - createdAt > maxAgeMs
        ) {
            games.delete(id)
        }
    }
}