import { Server } from 'socket.io';

let io;
let onlineUsers = new Map();

export async function GET(req) {
  if (!io) {
    const { createServer } = await import('http');
    const server = createServer();
    
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join', (username) => {
        onlineUsers.set(socket.id, username);
        socket.username = username;
        
        // Broadcast updated user list
        io.emit('users_update', Array.from(onlineUsers.values()));
        
        // Notify others that user joined
        socket.broadcast.emit('user_joined', username);
      });

      socket.on('chat message', (data) => {
        // Broadcast message to all clients
        io.emit('chat message', {
          id: Date.now(),
          username: data.username,
          message: data.message,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('disconnect', () => {
        if (socket.username) {
          onlineUsers.delete(socket.id);
          io.emit('users_update', Array.from(onlineUsers.values()));
          socket.broadcast.emit('user_left', socket.username);
        }
        console.log('User disconnected:', socket.id);
      });
    });

    server.listen(3001);
    console.log('Socket.IO server running on port 3001');
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}