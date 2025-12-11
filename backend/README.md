# Chat Backend - Neural Network Terminal

Production-ready backend service for the Neural Network Terminal real-time chat application.

## 🚀 Features

- **Real-time Communication**: Socket.IO WebSocket server
- **Multi-room Support**: Create and join chat rooms
- **Message Persistence**: MongoDB storage with history
- **User Tracking**: Online user management per room
- **Health Monitoring**: `/health` endpoint for uptime checks
- **Graceful Shutdown**: Proper cleanup on termination
- **Railway Ready**: Configured for Railway deployment

## 🛠️ Tech Stack

- Node.js + Express
- Socket.IO
- MongoDB + Mongoose
- CORS

## 📁 Project Structure

```
backend/
├── database/
│   └── mongo.js          # MongoDB connection helper
├── models/
│   ├── Message.js        # Message schema
│   ├── Room.js           # Room schema
│   └── User.js           # User schema
├── server.js             # Main entry point
├── package.json          # Dependencies
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/chatapp
FRONTEND_URL=http://localhost:3000
```

### Production (Railway):

```env
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🏃 Running Locally

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
cd backend
npm install
```

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## 📡 API Endpoints

### Health Check
- **GET** `/health`
- Returns: `{ "status": "ok" }`

## 🔌 Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `username` | Join global chat |
| `join-room` | `{ roomId, username }` | Join specific room |
| `chat-message` | `{ roomId, user, text }` | Send message |
| `chat message` | `{ username, message }` | Legacy message event |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room-history` | `[messages]` | Last 50 messages |
| `chat-message` | `{ user, text, timestamp }` | New message |
| `chat message` | `{ id, username, message, timestamp }` | Legacy message |
| `users_update` | `[usernames]` | Online users list |
| `user-joined` | `{ username }` | User joined notification |
| `user-left` | `{ username }` | User left notification |

## 🗄️ Database Models

### Message
```javascript
{
  text: String,      // Message content
  user: String,      // Sender username
  roomId: String,    // Room identifier (default: "global")
  timestamp: Date    // Message timestamp
}
```

### Room
```javascript
{
  name: String,      // Room display name
  roomId: String,    // Unique room identifier
  createdBy: String  // Creator username
}
```

### User
```javascript
{
  username: String,  // Display name
  socketId: String,  // Socket connection ID
  roomId: String,    // Current room
  isOnline: Boolean  // Online status
}
```

## 🚂 Railway Deployment

1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables:
   - `MONGODB_URI`
   - `FRONTEND_URL`
   - `PORT` (optional, Railway auto-assigns)
4. Deploy!

### Railway Configuration

The `railway.toml` in the repository root configures:
- Build command: `npm install`
- Start command: `npm start`
- Health check: `/health`

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes Railway IPs (or use `0.0.0.0/0`)

### CORS Errors
- Verify `FRONTEND_URL` matches your frontend domain exactly
- Include protocol (`https://`)

### Socket.IO Connection Issues
- Check that frontend uses correct backend URL
- Verify CORS configuration
- Check browser console for errors

## 📊 Monitoring

- Health check: `GET /health`
- Console logs for all connections and messages
- Graceful shutdown on SIGTERM/SIGINT