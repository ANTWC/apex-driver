'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function SplashPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      router.replace(user ? '/home' : '/login');
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a14]">
      <div
        className="flex flex-col items-center gap-4 transition-opacity duration-1000"
        style={{ opacity }}
      >
        <div className="w-24 h-24 rounded-2xl bg-[#1a1a2e] flex items-center justify-center border border-[#2a2a3e]">
          <span className="text-5xl">🦍</span>
        </div>
        <h1 className="text-3xl font-bold tracking-wide text-white">
          APEX <span className="text-[#FF6200]">Driver</span>
        </h1>
        <p className="text-[#a0a0b8] text-lg">Your Master Tech in Your Pocket</p>
      </div>
    </div>
  );
}
