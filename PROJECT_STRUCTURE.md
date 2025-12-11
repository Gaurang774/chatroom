# Neural Network Terminal - Complete Project Structure

```
📁 ROOT/
│
├── 📁 backend/                          # Backend Service (Railway Deployment)
│   ├── server.js                        # Express + Socket.IO + MongoDB server
│   ├── package.json                     # Backend dependencies
│   └── .gitignore                       # Git ignore for backend
│
├── 📁 chat-app/                         # Frontend Application (Vercel Deployment)
│   │
│   ├── 📁 src/
│   │   ├── 📁 app/                      # Next.js 15 App Router
│   │   │   │
│   │   │   ├── 📁 api/                  # API Routes
│   │   │   │   ├── 📁 messages/
│   │   │   │   │   ├── route.js         # GET /api/messages - Fetch message history
│   │   │   │   │   └── 📁 older/
│   │   │   │   │       └── route.js     # GET /api/messages/older - Pagination
│   │   │   │   │
│   │   │   │   ├── 📁 rooms/
│   │   │   │   │   ├── 📁 create/
│   │   │   │   │   │   └── route.js     # POST /api/rooms/create - Create room
│   │   │   │   │   └── 📁 [roomId]/
│   │   │   │   │       └── route.js     # GET /api/rooms/[roomId] - Room info
│   │   │   │   │
│   │   │   │   └── 📁 socket/
│   │   │   │       └── route.js         # Socket.IO integration
│   │   │   │
│   │   │   ├── 📁 login/
│   │   │   │   └── page.js              # /login - User authentication
│   │   │   │
│   │   │   ├── 📁 chat/
│   │   │   │   └── page.js              # /chat - Global chat (Neural Network Terminal)
│   │   │   │
│   │   │   ├── 📁 create-room/
│   │   │   │   └── page.js              # /create-room - Room creation interface
│   │   │   │
│   │   │   ├── 📁 join-room/
│   │   │   │   └── page.js              # /join-room - Join room by ID
│   │   │   │
│   │   │   ├── 📁 room/
│   │   │   │   └── 📁 [roomId]/
│   │   │   │       └── page.js          # /room/[roomId] - Dynamic room chat
│   │   │   │
│   │   │   ├── layout.tsx               # Root layout with metadata
│   │   │   ├── page.tsx                 # / - Landing page (redirects to login)
│   │   │   ├── globals.css              # Global styles + animations
│   │   │   └── favicon.ico              # App favicon
│   │   │
│   │   ├── 📁 components/               # React Components
│   │   │   ├── ClickSpark.jsx           # Click particle animation
│   │   │   ├── ShinyText.jsx            # Gradient shimmer text
│   │   │   ├── ColorBends.jsx           # WebGL shader background
│   │   │   └── Particles.jsx            # 3D particle field (OGL)
│   │   │
│   │   ├── 📁 hooks/                    # Custom React Hooks
│   │   │   └── useHydration.js          # SSR hydration helper
│   │   │
│   │   └── 📁 store/                    # State Management
│   │       └── useStore.js              # Zustand store
│   │
│   ├── 📁 lib/                          # Utility Libraries
│   │   └── mongo.js                     # MongoDB connection helper
│   │
│   ├── 📁 models/                       # Mongoose Models
│   │   ├── Message.js                   # Message schema
│   │   ├── Room.js                      # Room schema
│   │   └── User.js                      # User schema
│   │
│   ├── 📁 public/                       # Static Assets
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   │
│   ├── .env.local                       # Environment variables (local)
│   ├── .gitignore                       # Git ignore
│   ├── next.config.ts                   # Next.js configuration
│   ├── next-env.d.ts                    # Next.js TypeScript declarations
│   ├── package.json                     # Frontend dependencies
│   ├── package-lock.json                # Dependency lock file
│   ├── postcss.config.mjs               # PostCSS configuration
│   ├── tailwind.config.js               # Tailwind CSS configuration
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── server.js                        # Local Socket.IO server (dev only)
│   └── README.md                        # Frontend documentation
│
├── 📁 .vscode/                          # VS Code settings
│
└── PROJECT_STRUCTURE.md                 # This file
```

## 🔗 Application Flow

```
User Flow:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  /login ──────► /chat (Global) ──────► /create-room             │
│                      │                      │                   │
│                      │                      ▼                   │
│                      │              /room/[roomId]              │
│                      │                      │                   │
│                      ▼                      │                   │
│               /join-room ───────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🌐 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────┐              │
│   │     VERCEL      │         │     RAILWAY     │              │
│   │   (Frontend)    │◄───────►│    (Backend)    │              │
│   │                 │ Socket  │                 │              │
│   │  chat-app/      │   IO    │  backend/       │              │
│   │  Next.js 15     │         │  Express +      │              │
│   │                 │         │  Socket.IO      │              │
│   └────────┬────────┘         └────────┬────────┘              │
│            │                           │                        │
│            │         ┌─────────────────┘                        │
│            │         │                                          │
│            ▼         ▼                                          │
│   ┌─────────────────────────────────────┐                      │
│   │          MONGODB ATLAS              │                      │
│   │         (Database)                  │                      │
│   │                                     │                      │
│   │  Collections:                       │                      │
│   │  - messages                         │                      │
│   │  - rooms                            │                      │
│   │  - users                            │                      │
│   └─────────────────────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Environment Variables

### Frontend (Vercel) - chat-app/.env.local
```env
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

### Backend (Railway) - backend/.env
```env
PORT=3001
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://your-app.vercel.app
```

## 📦 Key Dependencies

### Frontend (chat-app)
- Next.js 15 (App Router)
- React 18
- TailwindCSS
- Zustand (State)
- Socket.IO Client
- Three.js (ColorBends)
- OGL (Particles)
- Mongoose

### Backend (backend)
- Express.js
- Socket.IO
- Mongoose
- CORS

## 🚀 Quick Start

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd chat-app
npm install
npm run dev
```

### Production Deployment
1. Deploy `backend/` to Railway
2. Deploy `chat-app/` to Vercel
3. Configure environment variables
4. Connect MongoDB Atlas
