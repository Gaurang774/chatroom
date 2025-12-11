'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '../../store/useStore';
import { useHydration } from '../../hooks/useHydration';
import ShinyText from '../../components/ShinyText';
import ColorBends from '../../components/ColorBends';
import ClickSpark from '../../components/ClickSpark';

export default function CreateRoom() {
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const { username } = useStore();
  const router = useRouter();
  const isHydrated = useHydration();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName.trim(),
          createdBy: username
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedRoom(data);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = async () => {
    if (createdRoom) {
      try {
        await navigator.clipboard.writeText(createdRoom.link);
        // Could add a toast notification here
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        console.log('Copy link:', createdRoom.link);
      }
    }
  };

  const joinRoom = () => {
    if (createdRoom) {
      router.push(`/room/${createdRoom.roomId}`);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!username) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* ColorBends Background */}
      <div className="fixed inset-0 -z-10">
        <ColorBends
          colors={["#2d1b69", "#11998e", "#38ef7d"]}
          rotation={45}
          speed={0.15}
          scale={1.2}
          frequency={1.0}
          warpStrength={0.8}
          mouseInfluence={0.4}
          parallax={0.3}
          noise={0.03}
          transparent
        />
      </div>
      
      <ClickSpark sparkColor="#fff" sparkCount={10} sparkRadius={18}>
        <div className="glass-readable rounded-3xl p-10 w-full max-w-md neon-glow relative z-10">
          {!createdRoom ? (
            <>
              <div className="text-center mb-10">
                <ShinyText
                  text="Create Room"
                  speed={2}
                  className="text-4xl font-bold text-white mb-4"
                />
                <p className="text-gray-300 text-base leading-relaxed">
                  Initialize a new communication channel
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="roomName" className="block text-gray-200 text-sm font-medium mb-4">
                    Room Name
                  </label>
                  <input
                    type="text"
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-5 py-4 input-premium rounded-xl text-white placeholder-gray-400 text-lg"
                    placeholder="Enter room name"
                    required
                    disabled={isCreating}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full btn-premium text-white font-medium py-4 px-8 rounded-xl text-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating Room...' : 'Create Room'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <ShinyText
                  text="Room Created"
                  speed={2}
                  className="text-4xl font-bold text-white mb-4"
                />
                <p className="text-gray-300 text-base leading-relaxed">
                  Share the invite link to let others join
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-2">
                    Room Name
                  </label>
                  <div className="glass-readable rounded-xl p-4">
                    <p className="text-white text-lg">{createdRoom.name}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-2">
                    Room ID
                  </label>
                  <div className="glass-readable rounded-xl p-4">
                    <p className="text-neon-purple font-mono text-lg">{createdRoom.roomId}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-2">
                    Invite Link
                  </label>
                  <div className="glass-readable rounded-xl p-4 flex items-center justify-between">
                    <p className="text-white text-sm truncate mr-4">{createdRoom.link}</p>
                    <button
                      onClick={copyLink}
                      className="text-neon-blue hover:text-neon-purple transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={joinRoom}
                    className="w-full btn-premium text-white font-medium py-3 px-6 rounded-xl transform hover:scale-105 active:scale-95"
                  >
                    Join Room
                  </button>
                  <button
                    onClick={() => router.push('/chat')}
                    className="w-full glass-readable border border-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Back to Global Chat
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </ClickSpark>
    </div>
  );
}