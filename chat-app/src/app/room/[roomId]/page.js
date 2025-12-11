'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import useStore from '../../../store/useStore';
import ClickSpark from '../../../components/ClickSpark';
import ShinyText from '../../../components/ShinyText';
import ColorBends from '../../../components/ColorBends';
import Particles from '../../../components/Particles';
import { useHydration } from '../../../hooks/useHydration';

export default function RoomChat() {
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomMessages, setRoomMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { username, onlineUsers, setOnlineUsers } = useStore();
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId;
  const isHydrated = useHydration();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load room information
  useEffect(() => {
    async function loadRoomInfo() {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setRoomInfo(data);
        } else {
          // Room not found, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading room info:', error);
        router.push('/login');
      }
    }
    
    if (isHydrated && roomId) {
      loadRoomInfo();
    }
  }, [isHydrated, roomId, router]);

  // Load initial room messages
  useEffect(() => {
    async function loadInitialMessages() {
      try {
        const res = await fetch(`/api/messages?roomId=${roomId}&limit=50`);
        if (res.ok) {
          const data = await res.json();
          setRoomMessages(data);
        }
      } catch (error) {
        console.error('Error loading room messages:', error);
      }
    }
    
    if (isHydrated && roomId) {
      loadInitialMessages();
    }
  }, [isHydrated, roomId]);

  // Socket connection and room joining
  useEffect(() => {
    if (!username) {
      router.push('/login');
      return;
    }

    if (!roomId) return;

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Join the specific room
    newSocket.emit('join-room', { roomId, username });

    // Listen for room messages
    newSocket.on('chat-message', (data) => {
      setRoomMessages(prev => [...prev, {
        id: Date.now(),
        username: data.user,
        message: data.text,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }]);
    });

    // Listen for user updates in this room
    newSocket.on('users_update', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.close();
    };
  }, [username, roomId, router, setOnlineUsers]);

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  // Infinite scroll handler for loading older messages
  const handleScroll = async (e) => {
    const container = e.target;
    
    if (container.scrollTop === 0 && roomMessages.length > 0 && !isLoadingOlder) {
      setIsLoadingOlder(true);
      
      try {
        const oldestMessage = roomMessages[0];
        const before = oldestMessage.createdAt || oldestMessage.timestamp;
        
        const res = await fetch(`/api/messages/older?roomId=${roomId}&before=${before}&limit=50`);
        if (res.ok) {
          const olderMessages = await res.json();
          if (olderMessages.length > 0) {
            const scrollHeight = container.scrollHeight;
            
            // Prepend older messages
            setRoomMessages(prev => [...olderMessages, ...prev]);
            
            // Restore scroll position
            setTimeout(() => {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - scrollHeight;
            }, 0);
          }
        }
      } catch (error) {
        console.error('Error loading older messages:', error);
      } finally {
        setIsLoadingOlder(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && socket && roomId) {
      socket.emit('chat-message', {
        roomId,
        user: username,
        text: message.trim()
      });
      setMessage('');
    }
  };

  // Show loading until hydrated and username is available
  if (!isHydrated || !username || !roomInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading room...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative">
      {/* ColorBends Background */}
      <div className="fixed inset-0 -z-20">
        <ColorBends
          colors={["#1a0b2e", "#16213e", "#0f3460"]}
          rotation={30}
          speed={0.1}
          scale={1.5}
          frequency={0.8}
          warpStrength={0.6}
          mouseInfluence={0.3}
          parallax={0.2}
          noise={0.02}
          transparent
        />
      </div>
      
      {/* Particles Layer */}
      <div className="fixed inset-0 -z-10">
        <Particles
          particleColors={['#a855f7', '#3b82f6']}
          particleCount={150}
          particleSpread={8}
          speed={0.05}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>
      
      <ClickSpark sparkColor="#fff" sparkCount={10} sparkRadius={18}>
        {/* Header */}
        <div className="glass-readable p-6 border-b border-white/20 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/chat')}
                className="glass-readable px-3 py-2 rounded-full text-sm text-gray-300 hover:text-neon-blue transition-colors border border-gray-500/30 hover:border-neon-blue/30"
              >
                ← Global Chat
              </button>
              <div>
                <ShinyText
                  text={roomInfo.name}
                  speed={3}
                  className="text-3xl font-bold text-white"
                />
                <div className="text-sm text-gray-400 mt-1">Room ID: {roomId}</div>
              </div>
            </div>
            <div className="text-sm text-gray-200 glass-readable px-4 py-2 rounded-full neon-glow">
              <span className="text-neon-purple font-medium">{username}</span> • {onlineUsers.length} online
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 p-6 relative z-10">
          <div className="glass-readable rounded-2xl h-full flex flex-col neon-glow">
            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
              onScroll={handleScroll}
            >
              {/* Loading indicator for older messages */}
              {isLoadingOlder && (
                <div className="text-center py-2">
                  <div className="text-gray-400 text-sm">Loading older messages...</div>
                </div>
              )}
              
              {roomMessages.length === 0 ? (
                <div className="text-center text-gray-300 mt-8">
                  <div className="glass-readable rounded-xl p-6">
                    <p className="text-lg">Room initialized</p>
                    <p className="text-sm mt-2 opacity-80">Start the conversation in {roomInfo.name}</p>
                  </div>
                </div>
              ) : (
                roomMessages.map((msg, index) => {
                  const isOwnMessage = msg.username === username;
                  return (
                    <div key={msg.id || index} className={`flex items-start space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`message-bubble rounded-2xl p-4 max-w-xs lg:max-w-md ${isOwnMessage ? 'own-message' : ''}`}>
                        <div className={`text-xs font-medium mb-2 flex items-center ${isOwnMessage ? 'flex-row-reverse text-neon-blue' : 'text-neon-purple'}`}>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${isOwnMessage ? 'bg-neon-blue ml-2' : 'bg-neon-purple mr-2'}`}></span>
                          {msg.username}
                        </div>
                        <div className="text-white leading-relaxed">{msg.message}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/20">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-5 py-4 input-premium rounded-xl text-white placeholder-gray-400 text-lg"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="btn-premium text-white font-medium py-4 px-8 rounded-xl transform hover:scale-105 active:scale-95"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </ClickSpark>
    </div>
  );
}