const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

// Serve static files from the public directory
app.use(express.static('public'))

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  // Handle joining a chat room
  socket.on('join', (data) => {
    const { username, chatId } = data
    socket.join(chatId)
    socket.username = username
    socket.chatId = chatId

    console.log(`User ${username} joined chat ${chatId}`)

    // Notify others in the room
    socket.to(chatId).emit('message', {
      username: 'System',
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString()
    })
  })

  // Handle messages
  socket.on('message', (data) => {
    const { username, chatId, message, timestamp } = data

    console.log(`Message from ${username} in chat ${chatId}: ${message}`)

    // Broadcast message to all users in the chat room
    io.to(chatId).emit('message', {
      username,
      message,
      timestamp
    })
  })

  socket.on('disconnect', () => {
    if (socket.username && socket.chatId) {
      console.log(`User ${socket.username} disconnected from chat ${socket.chatId}`)

      // Notify others in the room
      socket.to(socket.chatId).emit('message', {
        username: 'System',
        message: `${socket.username} left the chat`,
        timestamp: new Date().toISOString()
      })
    } else {
      console.log('User disconnected:', socket.id)
    }
  })
})

httpServer.listen(3000, () => {
  console.log('Server is running on port 3000')
})
