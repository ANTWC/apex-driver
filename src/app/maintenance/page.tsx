'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import VehicleSelector from '@/components/VehicleSelector';
import type { Vehicle } from '@/components/VehicleSelector';
import { ArrowLeft, Loader2, Car, AlertCircle, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [schedule, setSchedule] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedForId, setGeneratedForId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
  }, [user, authLoading, router]);

  const generateSchedule = useCallback(async (v: Vehicle) => {
    setScheduleLoading(true);
    setError('');
    setSchedule('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Generate my complete maintenance schedule for my ${v.year} ${v.make} ${v.model}.${v.mileage ? ` My current mileage is ${v.mileage.toLocaleString()} miles.` : ''} Tell me what I actually need vs. what shops try to upsell. Explain WHY each service matters.` }],
          vehicle: v,
          mode: 'maintenance',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate schedule');
      } else {
        setSchedule(data.message);
        setGeneratedForId(v.id);
      }
    } catch {
      setError('Unable to connect. Please try again.');
    }

    setScheduleLoading(false);
  }, []);

  useEffect(() => {
    if (vehicle && vehicle.id !== generatedForId) {
      generateSchedule(vehicle);
    }
  }, [vehicle, generatedForId, generateSchedule]);

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Maintenance Schedule</h1>
            {vehicle && <p className="text-[#6b6b80] text-xs">{vehicle.year} {vehicle.make} {vehicle.model}{vehicle.mileage ? ` — ${vehicle.mileage.toLocaleString()} mi` : ''}</p>}
          </div>
          {schedule && !scheduleLoading && vehicle && (
            <button onClick={() => { setGeneratedForId(null); }} className="text-[#a0a0b8] hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <VehicleSelector selected={vehicle} onSelect={setVehicle} />

        {!vehicle && !authLoading && (
          <div className="text-center mt-12">
            <Car className="w-12 h-12 text-[#6b6b80] mx-auto mb-3" />
            <p className="text-white font-semibold text-lg mb-1">Add Your Vehicle First</p>
            <p className="text-[#a0a0b8] text-sm mb-4">We need your vehicle info to build your personalized maintenance schedule based on the manufacturer&apos;s recommendations.</p>
            <button onClick={() => router.push('/settings')} className="px-6 py-2 rounded-lg bg-[#FF6200] text-white font-semibold">
              Add Vehicle
            </button>
          </div>
        )}

        {scheduleLoading && (
          <div className="text-center mt-12">
            <Loader2 className="w-8 h-8 text-[#FF6200] mx-auto mb-3 animate-spin" />
            <p className="text-white font-semibold mb-1">Building Your Schedule</p>
            <p className="text-[#a0a0b8] text-sm">Searching manufacturer data for your {vehicle?.year} {vehicle?.make} {vehicle?.model}...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-900/20 border border-red-800/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={() => vehicle && generateSchedule(vehicle)} className="text-[#FF6200] text-sm font-semibold mt-2">
                Try Again
              </button>
            </div>
          </div>
        )}

        {schedule && (
          <div className="mt-4 p-5 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e]">
            <p className="text-white whitespace-pre-wrap text-[15px] leading-relaxed">{schedule}</p>
          </div>
        )}
      </main>
    </div>
  );
}
