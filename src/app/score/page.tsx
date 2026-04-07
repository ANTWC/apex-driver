'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Trophy } from 'lucide-react';

export default function ScorePage() {
  const router = useRouter();

  // Placeholder — will be built out with gamification logic
  return (
    <div className="min-h-screen bg-[#0a0a14] flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Car Owner Score</h1>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <Trophy className="w-16 h-16 text-[#FF6200] mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-[#a0a0b8] max-w-xs">
          Track your maintenance, earn points, and level up your car owner score. Stay tuned!
        </p>
      </div>
    </div>
  );
}
