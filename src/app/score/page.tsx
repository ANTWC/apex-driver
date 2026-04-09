'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Lock, Trophy } from 'lucide-react';

export default function ScorePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tier, setTier] = useState('free');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) {
      const supabase = createClient();
      supabase.from('driver_profiles').select('tier').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setTier(data.tier); });
      fetch('/api/admin/check').then(r => r.json()).then(d => setIsAdmin(d.authorized)).catch(() => {});
    }
  }, [user, authLoading, router]);

  if (tier !== 'pro' && !isAdmin && !authLoading) {
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
          <Lock className="w-12 h-12 text-[#FF6200] mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Pro Feature</h2>
          <p className="text-[#a0a0b8] mb-6">Track your maintenance and level up your car owner score.</p>
          <button onClick={() => router.push('/upgrade')} className="px-8 py-3 rounded-xl bg-[#FF6200] text-white font-semibold">Go Pro — $34.99/yr</button>
        </div>
      </div>
    );
  }

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
