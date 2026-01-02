import { getUser } from "../state/connection.js"
import {
    createGame,
    joinGame,
    leaveGame,
    playerMove,
    getJoinableGames,
    updateGameBoard,
    resignGame,
    setGameIO,
} from '../state/game.js'

export const registerGameEvents = (io, socket) => {
    // Ensure game state module can broadcast on timeout
    setGameIO(io)
    const getPlayer = () => {
        const currentUser = getUser(socket.id)
        if (!currentUser) return null

        return {
            ...currentUser,
            id: currentUser.id ?? currentUser.user_id ?? socket.id,
            username:
                currentUser.username ??
                currentUser.name ??
                currentUser.nickname ??
                `user-${currentUser.id ?? socket.id}`,
        }
    }

    const roomName = (gameID) => `game:${gameID}`

    socket.on('game:create', ({ type }, cb) => {
        try {
            const player = getPlayer()
            if (!player) throw new Error('Authentication required')
            const gameType = type === '3' || type === '9' ? type : '9'

            const game = createGame(player, gameType)
            const room = roomName(game.id)
            socket.join(room)
            cb && cb({ ok: true, game })
            io.to(room).emit('game:updated', game)
        } catch (err) {
            cb && cb({ ok: false, error: err.message })
        }
    })

    socket.on('game:list', (cb) => {
        cb && cb({ ok: true, games: getJoinableGames() })
    })

    socket.on('game:join', ({ gameID }, cb) => {
        try {
            const player = getPlayer()
            if (!player) throw new Error('Authentication required')

            const game = joinGame(gameID, player)
            const room = roomName(gameID)
            socket.join(room)
            cb && cb({ ok: true, game })
            io.to(room).emit('game:updated', game)
        } catch (err) {
            cb && cb({ ok: false, error: err.message })
        }
    })

    socket.on('game:move', ({ gameID, move }, cb) => {
        try {
            const player = getPlayer()
            if (!player) throw new Error('Authentication required')

            const game = playerMove(gameID, player, move)
            const room = roomName(gameID)
            io.to(room).emit('game:updated', game)
            cb && cb({ ok: true })
        } catch (err) {
            cb && cb({ ok: false, error: err.message })
        }
    })

    socket.on('game:sync', ({ gameID, board }, cb) => {
        try {
            const player = getPlayer()
            if (!player) throw new Error('Authentication required')

            const game = updateGameBoard(gameID, board)
            const room = roomName(gameID)
            io.to(room).emit('game:updated', game)
            cb && cb({ ok: true })
        } catch (err) {
            cb && cb({ ok: false, error: err.message })
        }
    })

    socket.on('game:resign', ({ gameID }, cb) => {
        try {
            const player = getPlayer()
            if (!player) throw new Error('Authentication required')

            const game = resignGame(gameID, player)
            const room = roomName(gameID)
            io.to(room).emit('game:updated', game)
            cb && cb({ ok: true })
        } catch (err) {
            cb && cb({ ok: false, error: err.message })
        }
    })

    socket.on('game:leave', ({ gameID }, cb) => {
        try {
            const player = getPlayer()
            if (!player) throw new Error('Authentication required')

            const game = leaveGame(gameID, player)
            const room = roomName(gameID)
            socket.leave(room)

            if (!game) {
                io.to(room).emit('game:closed', { id: gameID })
            } else {
                io.to(room).emit('game:updated', game)
            }
            cb && cb({ ok: true })
        } catch (err) {
            cb && cb({ ok: false, error: err.message })
        }
    })
}