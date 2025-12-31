import { Server } from "socket.io"
import { handleConnectionEvents } from "./events/connection.js"
import { registerGameEvents } from "./events/game.js"
import { cleanupFinishedGames } from "./state/game.js"

export const server = {
  io: null,
}

export const serverStart = (port) => {
  server.io = new Server(port, {
    cors: {
      origin: "*",
    },
  })

  setInterval(() => cleanupFinishedGames(), 1000 * 60 * 5)

  server.io.on("connection", (socket) => {
    console.log("New connection:", socket.id)

    handleConnectionEvents(server.io, socket)
    registerGameEvents(server.io, socket)
  })
}