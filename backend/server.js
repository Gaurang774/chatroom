import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./lib/mongo.js";
import Message from "./models/Message.js";
import Room from "./models/Room.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

// Environment variables
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

// -------------------
// Express Setup
// -------------------
const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// -------------------
// HTTP Server + Socket.IO
// -------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory user tracking (faster than DB for real-time)
const roomUsers = new Map();

// -------------------
// Helper Functions
// -------------------
async function getLastMessages(roomId, limit = 50) {
  try {
    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return messages.reverse().map((msg) => ({
      id: msg._id.toString(),
      user: msg.user,
      text: msg.text,
      timestamp: msg.createdAt || msg.timestamp
    }));
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return [];
  }
}

async function saveMessage(user, text, roomId) {
  try {
    const message = await Message.create({ user, text, roomId });
    return message;
  } catch (error) {
    console.error("Error saving message:", error.message);
    return null;
  }
}

async function saveUser(username, socketId, roomId) {
  try {
    await User.findOneAndUpdate(
      { socketId },
      { username, socketId, roomId, isOnline: true, lastSeen: new Date() },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error saving user:", error.message);
  }
}

async function removeUser(socketId) {
  try {
    await User.findOneAndUpdate(
      { socketId },
      { isOnline: false, lastSeen: new Date() }
    );
  } catch (error) {
    console.error("Error removing user:", error.message);
  }
}

function getRoomUsers(roomId) {
  return roomUsers.has(roomId) ? Array.from(roomUsers.get(roomId)) : [];
}

function addUserToRoom(roomId, username) {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Set());
  }
  roomUsers.get(roomId).add(username);
}

function removeUserFromRoom(roomId, username) {
  if (roomUsers.has(roomId)) {
    roomUsers.get(roomId).delete(username);
    if (roomUsers.get(roomId).size === 0) {
      roomUsers.delete(roomId);
    }
  }
}

// -------------------
// Socket.IO Handlers
// -------------------
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Global join event
  socket.on("join", async (username) => {
    socket.username = username;
    socket.roomId = "global";

    socket.join("global");
    addUserToRoom("global", username);
    await saveUser(username, socket.id, "global");

    // Send room history
    const history = await getLastMessages("global");
    socket.emit("room-history", history);

    // Notify room
    socket.to("global").emit("user-joined", { username });
    io.to("global").emit("users_update", getRoomUsers("global"));

    console.log(`👤 ${username} joined global chat`);
  });

  // Room-specific join
  socket.on("join-room", async ({ roomId, username }) => {
    // Leave previous room if any
    if (socket.roomId && socket.roomId !== roomId) {
      socket.leave(socket.roomId);
      removeUserFromRoom(socket.roomId, socket.username);
      io.to(socket.roomId).emit("users_update", getRoomUsers(socket.roomId));
    }

    socket.username = username;
    socket.roomId = roomId;

    socket.join(roomId);
    addUserToRoom(roomId, username);
    await saveUser(username, socket.id, roomId);

    // Send last 50 messages
    const history = await getLastMessages(roomId);
    socket.emit("room-history", history);

    // Notify room
    socket.to(roomId).emit("user-joined", { username });
    io.to(roomId).emit("users_update", getRoomUsers(roomId));

    console.log(`👤 ${username} joined room ${roomId}`);
  });

  // Chat message (works for both global and rooms)
  socket.on("chat-message", async ({ roomId, user, text }) => {
    const targetRoom = roomId || socket.roomId || "global";

    // Save to database
    await saveMessage(user, text, targetRoom);

    // Broadcast to room
    io.to(targetRoom).emit("chat-message", {
      user,
      text,
      timestamp: new Date()
    });

    console.log(`💬 [${targetRoom}] ${user}: ${text}`);
  });

  // Legacy chat message event (backward compatibility)
  socket.on("chat message", async (data) => {
    const { username, message } = data;
    const targetRoom = socket.roomId || "global";

    await saveMessage(username, message, targetRoom);

    io.to(targetRoom).emit("chat message", {
      id: Date.now(),
      username,
      message,
      timestamp: new Date().toISOString()
    });

    console.log(`💬 [${targetRoom}] ${username}: ${message}`);
  });

  // Disconnect handler
  socket.on("disconnect", async () => {
    const { username, roomId } = socket;

    if (username && roomId) {
      removeUserFromRoom(roomId, username);
      await removeUser(socket.id);

      socket.to(roomId).emit("user-left", { username });
      io.to(roomId).emit("users_update", getRoomUsers(roomId));

      console.log(`👋 ${username} left ${roomId}`);
    }

    console.log("❌ User disconnected:", socket.id);
  });
});

// -------------------
// Start Server
// -------------------
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 CORS enabled for: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// -------------------
// Graceful Shutdown
// -------------------
async function gracefulShutdown(signal) {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

  // Close Socket.IO connections
  io.close(() => {
    console.log("✅ Socket.IO connections closed");
  });

  // Close HTTP server
  server.close(() => {
    console.log("✅ HTTP server closed");
  });

  // Disconnect from MongoDB
  await disconnectDB();

  console.log("✅ Graceful shutdown complete");
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the server
startServer();