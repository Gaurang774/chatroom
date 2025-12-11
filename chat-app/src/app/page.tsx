'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHydration } from '../hooks/useHydration';

export default function Home() {
  const router = useRouter();
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      router.push('/login');
    }
  }, [router, isHydrated]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Redirecting to login...</div>
    </div>
  );
}
