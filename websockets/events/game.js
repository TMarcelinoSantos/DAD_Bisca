import { getUser } from "../state/connection.js"
import {
    createGame,
    joinGame,
    leaveGame,
    playerMove,
    getJoinableGames,
    updateGameBoard,
} from '../state/game.js'

export const registerGameEvents = (io, socket) => {
    // Use authenticated user from connection state, fallback to socket info
    const currentUser = getUser(socket.id)

    const player = currentUser
        ? {
              ...currentUser,
              id: currentUser.id ?? currentUser.user_id ?? socket.id,
              username:
                  currentUser.username ??
                  currentUser.name ??
                  currentUser.nickname ??
                  `user-${currentUser.id ?? socket.id}`,
          }
        : socket.user || { id: socket.id, username: socket.id }

    const roomName = (gameID) => `game:${gameID}`

    socket.on('game:create', (cb) => {
        try {
            const game = createGame(player)
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
            const game = updateGameBoard(gameID, board)
            const room = roomName(gameID)
            io.to(room).emit('game:updated', game)
            cb && cb({ ok: true })
        } catch (err) {
            cb && cb({ ok: false, error: err.message })
        }
    })

    socket.on('game:leave', ({ gameID }, cb) => {
        try {
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