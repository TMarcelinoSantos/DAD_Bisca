const games = new Map()
let currentGameID = 0

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
        game.state = 'playing'
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

export const createGame = (player1) => {
    const gameID = ++currentGameID
    games.set(gameID, {
        id: gameID,
        player1: player1,
        player2: null,
        state: 'waiting',
        moves: [],
    })
}

export const playerMove = (gameID, move) => {
    const game = games.get(gameID)
    if (!game) throw new Error('Game not found')
    if (game.state !== 'playing') throw new Error('Game is not in playing state')

    game.moves.push(move)

    // TODO: update game.state = 'finished' according to game rules
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
        return null
    }

    if (game.state === 'playing') {
        game.state = 'finished'
    }

    return game
}

export const cleanupFinishedGames = (maxAgeMs = 1000 * 60 * 60) => {
    const now = Date.now()
    for (const [id, game] of games.entries()) {
        if (
            (game.state === 'finished' || (!game.player1 && !game.player2)) &&
            now - game.createdAt > maxAgeMs
        ) {
            games.delete(id)
        }
    }
}