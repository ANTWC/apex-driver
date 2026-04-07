'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';

interface Vehicle {
  year: number;
  make: string;
  model: string;
  mileage: number | null;
}

interface MaintenanceItem {
  name: string;
  interval: string;
  mileage: number;
  essential: boolean;
  note: string;
}

const MAINTENANCE_SCHEDULE: MaintenanceItem[] = [
  { name: 'Oil Change', interval: 'Every 5,000-7,500 miles', mileage: 5000, essential: true, note: 'Most modern cars use synthetic oil and go 7,500+ miles. Check your owner\'s manual — don\'t let a shop tell you 3,000 miles if your car doesn\'t need it.' },
  { name: 'Tire Rotation', interval: 'Every 5,000-7,500 miles', mileage: 5000, essential: true, note: 'Helps tires wear evenly so they last longer. Usually done with oil changes.' },
  { name: 'Air Filter (Engine)', interval: 'Every 15,000-30,000 miles', mileage: 15000, essential: true, note: 'Easy to check yourself — pop the hood, find the air filter box, and look at it. If it\'s dirty, replace it. $10-20 at any auto parts store.' },
  { name: 'Cabin Air Filter', interval: 'Every 15,000-20,000 miles', mileage: 15000, essential: false, note: 'Filters the air you breathe inside the car. Not urgent but nice to keep fresh. Easy DIY — usually behind the glove box.' },
  { name: 'Brake Inspection', interval: 'Every 20,000-30,000 miles', mileage: 20000, essential: true, note: 'Have a shop check brake pad thickness. Typical pads last 30,000-70,000 miles depending on driving.' },
  { name: 'Brake Fluid', interval: 'Every 30,000 miles or 2 years', mileage: 30000, essential: true, note: 'Brake fluid absorbs moisture over time, which reduces braking performance. Not an upsell — this is real maintenance.' },
  { name: 'Transmission Fluid', interval: 'Every 30,000-60,000 miles', mileage: 30000, essential: true, note: 'Check your owner\'s manual — some cars have "lifetime" fluid. If your transmission shifts rough, it\'s worth checking.' },
  { name: 'Coolant Flush', interval: 'Every 30,000 miles or 5 years', mileage: 30000, essential: true, note: 'Coolant breaks down over time and loses its ability to prevent overheating and corrosion.' },
  { name: 'Spark Plugs', interval: 'Every 60,000-100,000 miles', mileage: 60000, essential: true, note: 'Modern iridium/platinum plugs last a long time. Worn plugs cause poor fuel economy and misfires.' },
  { name: 'Timing Belt/Chain', interval: 'Every 60,000-100,000 miles', mileage: 60000, essential: true, note: 'CRITICAL: If your car has a timing belt (not chain) and it breaks, it can destroy your engine. Check your owner\'s manual.' },
  { name: 'Battery', interval: 'Every 3-5 years', mileage: 50000, essential: true, note: 'Most batteries last 3-5 years. If your car is slow to start or your battery is 4+ years old, have it tested — it\'s free at most auto parts stores.' },
  { name: 'Fuel Injector Cleaning', interval: 'Usually NOT needed', mileage: 100000, essential: false, note: 'This is one of the most common upsells. Modern fuel already has cleaning additives. Only do this if you\'re having actual performance issues.' },
  { name: 'Engine Flush', interval: 'Usually NOT needed', mileage: 100000, essential: false, note: 'Another common upsell. Regular oil changes are sufficient. An engine flush can actually cause problems on high-mileage engines.' },
];

export default function MaintenancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) {
      const supabase = createClient();
      supabase.from('driver_vehicles').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(1)
        .then(({ data }) => { if (data?.[0]) setVehicle(data[0]); });
    }
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Maintenance Schedule</h1>
            {vehicle && <p className="text-[#6b6b80] text-xs">{vehicle.year} {vehicle.make} {vehicle.model}{vehicle.mileage ? ` — ${vehicle.mileage.toLocaleString()} mi` : ''}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <p className="text-[#a0a0b8] text-sm mb-4">
          What you <span className="text-white font-semibold">actually</span> need vs. what shops try to upsell you on.
          Always check your owner&apos;s manual for your specific vehicle&apos;s schedule.
        </p>

        <div className="flex flex-col gap-3">
          {MAINTENANCE_SCHEDULE.map((item, i) => (
            <details key={i} className="group rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden">
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                {item.essential ? (
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                )}
                <div className="flex-1">
                  <span className="text-white font-semibold">{item.name}</span>
                  <span className="text-[#6b6b80] text-sm ml-2">{item.interval}</span>
                </div>
                <span className="text-[#6b6b80] group-open:rotate-180 transition-transform text-sm">▼</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-[#a0a0b8] text-[15px] leading-relaxed">{item.note}</p>
                {!item.essential && (
                  <p className="text-yellow-400 text-sm mt-2 font-semibold">
                    Common upsell — verify you actually need this before paying.
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
