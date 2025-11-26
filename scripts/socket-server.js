// Simple Socket.io chat server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let messages = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send existing messages to new client
  socket.emit('chat:init', messages);

  // Listen for new messages
  socket.on('chat:send', (msg) => {
    const message = {
      id: Date.now().toString(),
      userId: msg.userId,
      username: msg.username,
      message: msg.message,
      timestamp: new Date().toISOString(),
      type: msg.type || 'text',
      groupId: msg.groupId || 'default'
    };
    messages.push(message);
    io.emit('chat:receive', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
