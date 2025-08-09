const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

// Initialize Express app and HTTP server
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

// Serve static files from the public directory (HTML, CSS, JS)
app.use(express.static('public'))

// Socket.IO connection handling - manages real-time chat functionality
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Handle user joining a specific chat room
  socket.on('join', ({ username, chatId }) => {
    // Add user to the specified chat room
    socket.join(chatId)
    // Store user info on socket for later use
    socket.username = username
    socket.chatId = chatId

    console.log(`${username} joined chat ${chatId}`)

    // Notify other users in the room that someone joined
    socket.to(chatId).emit('message', {
      username: 'System',
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString()
    })
  })

  // Handle incoming chat messages
  socket.on('message', ({ username, chatId, message, timestamp }) => {
    console.log(`${username} in ${chatId}: ${message}`)

    // Broadcast message to all users in the same chat room
    io.to(chatId).emit('message', { username, message, timestamp })
  })

  // Handle user disconnection
  socket.on('disconnect', () => {
    if (socket.username && socket.chatId) {
      console.log(`${socket.username} left chat ${socket.chatId}`)

      // Notify other users in the room that someone left
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

// Start the server on port 3000
httpServer.listen(3000, () => {
  console.log('Server running on port 3000')
})
