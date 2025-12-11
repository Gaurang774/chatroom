'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '../../store/useStore';
import { useHydration } from '../../hooks/useHydration';
import ShinyText from '../../components/ShinyText';
import ColorBends from '../../components/ColorBends';

export default function Login() {
  const [inputUsername, setInputUsername] = useState('');
  const { setUsername } = useStore();
  const router = useRouter();
  const isHydrated = useHydration();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim());
      router.push('/chat');
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* ColorBends Background - Subtle purple theme */}
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
      
      <div className="glass-readable rounded-3xl p-10 w-full max-w-md neon-glow relative z-10">
        <div className="text-center mb-10">
          <ShinyText
            text="Neural Network Terminal"
            speed={2}
            className="text-4xl font-bold text-white mb-4"
          />
          <p className="text-gray-300 text-base leading-relaxed">
            Initialize user authentication protocol
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="username" className="block text-gray-200 text-sm font-medium mb-4">
              User Identifier
            </label>
            <input
              type="text"
              id="username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="w-full px-5 py-4 input-premium rounded-xl text-white placeholder-gray-400 text-lg"
              placeholder="Enter user identifier"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full btn-premium text-white font-medium py-4 px-8 rounded-xl text-lg transform hover:scale-105 active:scale-95"
          >
            Initialize Connection
          </button>
        </form>
        
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Interactive particle system enabled
          </p>
        </div>
      </div>
    </div>
  );
}