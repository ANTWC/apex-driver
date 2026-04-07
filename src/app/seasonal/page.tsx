'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Snowflake, Sun, MapPin, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';

const checklists = [
  {
    icon: Snowflake,
    title: 'Winter Prep',
    items: [
      'Check battery — cold weather kills weak batteries',
      'Inspect tires — consider winter tires if you get snow',
      'Check tire pressure — drops ~1 PSI for every 10°F temperature drop',
      'Top off antifreeze/coolant — should be at the correct freeze rating',
      'Replace wiper blades — consider winter blades',
      'Fill washer fluid with winter-rated formula',
      'Check all lights — shorter days mean you need them more',
      'Pack an emergency kit: blanket, flashlight, ice scraper, jumper cables',
      'Check your heater and defroster — fix before you need them',
      'Inspect belts and hoses — cold makes rubber brittle',
    ],
  },
  {
    icon: Sun,
    title: 'Summer Prep',
    items: [
      'Check AC — get it serviced before the heat hits',
      'Inspect cooling system — overheating is the #1 summer breakdown',
      'Check tire pressure — heat increases pressure',
      'Top off coolant',
      'Replace cabin air filter — you\'ll be running AC constantly',
      'Check battery — extreme heat kills batteries too',
      'Inspect brakes — summer road trips put extra wear on them',
      'Replace wiper blades — summer storms need good wipers',
      'Check oil level and condition',
      'Clean under the hood — leaves and debris can block airflow',
    ],
  },
  {
    icon: MapPin,
    title: 'Road Trip Prep',
    items: [
      'Get an oil change if you\'re within 1,000 miles of due',
      'Check all fluid levels: oil, coolant, brake, transmission, power steering',
      'Inspect tires — tread depth, pressure, spare tire condition',
      'Test all lights: headlights, brake lights, turn signals',
      'Check wiper blades and washer fluid',
      'Inspect brakes — listen for squealing or grinding',
      'Test the battery (free at most auto parts stores)',
      'Check belts and hoses for cracks',
      'Pack emergency kit: jumper cables, flashlight, first aid, water, phone charger',
      'Download offline maps in case you lose cell service',
      'Know your car\'s roadside assistance number',
    ],
  },
];

export default function SeasonalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tier, setTier] = useState('free');

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) {
      const supabase = createClient();
      supabase.from('driver_profiles').select('tier').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setTier(data.tier); });
    }
  }, [user, authLoading, router]);

  if (tier !== 'pro' && !authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex flex-col">
        <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">Seasonal Prep</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Lock className="w-12 h-12 text-[#FF6200] mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Pro Feature</h2>
          <p className="text-[#a0a0b8] mb-6">Get seasonal checklists to keep your car ready year-round.</p>
          <button onClick={() => router.push('/upgrade')} className="px-8 py-3 rounded-xl bg-[#FF6200] text-white font-semibold">Go Pro — $34.99/yr</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Seasonal Prep</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {checklists.map((checklist, i) => (
            <details key={i} className="group rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden">
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                <checklist.icon className="w-6 h-6 text-[#FF6200] shrink-0" />
                <span className="text-white font-semibold text-lg flex-1">{checklist.title}</span>
                <span className="text-[#6b6b80] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4">
                <div className="flex flex-col gap-2">
                  {checklist.items.map((item, j) => (
                    <label key={j} className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 accent-[#FF6200]" />
                      <span className="text-[#a0a0b8] text-[15px] leading-relaxed">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
