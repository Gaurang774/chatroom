'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '../../store/useStore';
import { useHydration } from '../../hooks/useHydration';
import ShinyText from '../../components/ShinyText';
import ColorBends from '../../components/ColorBends';
import ClickSpark from '../../components/ClickSpark';

export default function JoinRoom() {
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const { username } = useStore();
  const router = useRouter();
  const isHydrated = useHydration();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    setIsJoining(true);
    setError('');
    
    try {
      // Check if room exists
      const res = await fetch(`/api/rooms/${roomId.trim()}`);
      
      if (res.ok) {
        // Room exists, join it
        router.push(`/room/${roomId.trim()}`);
      } else {
        setError('Room not found. Please check the Room ID.');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room. Please try again.');
    } finally {
      setIsJoining(false);
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
          colors={["#1b2951", "#1e3a8a", "#3b82f6"]}
          rotation={60}
          speed={0.12}
          scale={1.3}
          frequency={0.9}
          warpStrength={0.7}
          mouseInfluence={0.35}
          parallax={0.25}
          noise={0.025}
          transparent
        />
      </div>
      
      <ClickSpark sparkColor="#fff" sparkCount={10} sparkRadius={18}>
        <div className="glass-readable rounded-3xl p-10 w-full max-w-md neon-glow relative z-10">
          <div className="text-center mb-10">
            <ShinyText
              text="Join Room"
              speed={2}
              className="text-4xl font-bold text-white mb-4"
            />
            <p className="text-gray-300 text-base leading-relaxed">
              Enter a Room ID to join an existing conversation
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="roomId" className="block text-gray-200 text-sm font-medium mb-4">
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-5 py-4 input-premium rounded-xl text-white placeholder-gray-400 text-lg"
                placeholder="Enter 10-character room ID"
                required
                disabled={isJoining}
                maxLength={10}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isJoining || !roomId.trim()}
                className="flex-1 btn-premium text-white font-medium py-4 px-8 rounded-xl text-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/chat')}
                className="flex-1 glass-readable border border-white/20 text-white font-medium py-4 px-8 rounded-xl hover:bg-white/10 transition-colors"
              >
                Back to Global
              </button>
            </div>
          </form>
        </div>
      </ClickSpark>
    </div>
  );
}