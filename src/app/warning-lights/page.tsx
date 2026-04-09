'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import VehicleSelector from '@/components/VehicleSelector';
import type { Vehicle } from '@/components/VehicleSelector';
import { ArrowLeft, Search, Loader2, Car, X } from 'lucide-react';

const WARNING_LIGHTS = [
  { id: 'check-engine-solid', name: 'Check Engine (Solid)', icon: '🔧', color: 'yellow', description: 'Steady light — not flashing' },
  { id: 'check-engine-flashing', name: 'Check Engine (Flashing)', icon: '🔧', color: 'red', description: 'Blinking/flashing — more urgent' },
  { id: 'oil-pressure', name: 'Oil Pressure', icon: '🛢️', color: 'red', description: 'Oil can or oil lamp symbol' },
  { id: 'battery', name: 'Battery / Charging', icon: '🔋', color: 'red', description: 'Battery-shaped symbol' },
  { id: 'temperature', name: 'Engine Temperature', icon: '🌡️', color: 'red', description: 'Thermometer in water' },
  { id: 'brake', name: 'Brake Warning', icon: '🛑', color: 'red', description: 'Circle with ! or "BRAKE"' },
  { id: 'abs', name: 'ABS (Anti-Lock Brakes)', icon: '⚠️', color: 'yellow', description: 'Letters "ABS" in a circle' },
  { id: 'airbag', name: 'Airbag / SRS', icon: '🎈', color: 'red', description: 'Person with circle (airbag)' },
  { id: 'tpms', name: 'Tire Pressure (TPMS)', icon: '🔵', color: 'yellow', description: 'Tire cross-section with !' },
  { id: 'traction', name: 'Traction Control', icon: '🚗', color: 'yellow', description: 'Car with squiggly lines' },
  { id: 'power-steering', name: 'Power Steering', icon: '🔴', color: 'red', description: 'Steering wheel with !' },
  { id: 'transmission', name: 'Transmission Temp', icon: '⚙️', color: 'red', description: 'Gear with thermometer' },
  { id: 'fuel', name: 'Low Fuel', icon: '⛽', color: 'yellow', description: 'Gas pump symbol' },
  { id: 'door-ajar', name: 'Door Ajar', icon: '🚪', color: 'yellow', description: 'Car with open door' },
];

const colorMap: Record<string, string> = {
  red: 'border-red-500 bg-red-500/10',
  yellow: 'border-yellow-500 bg-yellow-500/10',
};

export default function WarningLightsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [search, setSearch] = useState('');
  const [customLight, setCustomLight] = useState('');
  const [selectedLight, setSelectedLight] = useState<string | null>(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
  }, [user, authLoading, router]);

  const handleLightSelect = async (lightName: string) => {
    if (!vehicle) return;
    setSelectedLight(lightName);
    setExplanation('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `My ${lightName} warning light is on. What does this mean for my specific vehicle and what should I do? Give me the full breakdown — urgency level, what it means on my vehicle, what to do right now, what NOT to do, and what to tell the shop.` }],
          vehicle,
          mode: 'warning_lights',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to get explanation');
      } else {
        setExplanation(data.message);
      }
    } catch {
      setError('Unable to connect. Please try again.');
    }

    setLoading(false);
  };

  const filtered = WARNING_LIGHTS.filter(light =>
    light.name.toLowerCase().includes(search.toLowerCase()) ||
    light.description.toLowerCase().includes(search.toLowerCase())
  );

  const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '';

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Warning Lights</h1>
            {vehicle && <p className="text-[#6b6b80] text-xs">{vehicleLabel}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <VehicleSelector selected={vehicle} onSelect={setVehicle} />

        {!vehicle && !authLoading && (
          <div className="text-center mt-12">
            <Car className="w-12 h-12 text-[#6b6b80] mx-auto mb-3" />
            <p className="text-white font-semibold text-lg mb-1">Add Your Vehicle First</p>
            <p className="text-[#a0a0b8] text-sm mb-4">We need your vehicle info to explain what each light means for your car.</p>
            <button onClick={() => router.push('/settings')} className="px-6 py-2 rounded-lg bg-[#FF6200] text-white font-semibold">
              Add Vehicle
            </button>
          </div>
        )}

        {vehicle && (
          <>
            {/* Selected light AI detail */}
            {selectedLight && (
              <div className="mb-4 p-5 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e]">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold text-xl">{selectedLight}</h2>
                  <button onClick={() => { setSelectedLight(null); setExplanation(''); setError(''); }} className="text-[#6b6b80] hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loading && (
                  <div className="flex items-center gap-2 text-[#a0a0b8]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Researching this light on your {vehicleLabel}...</span>
                  </div>
                )}

                {error && <p className="text-red-400 text-sm">{error}</p>}

                {explanation && (
                  <div>
                    <p className="text-[#a0a0b8] whitespace-pre-wrap text-[15px] leading-relaxed">{explanation}</p>
                    <p className="text-[#6b6b80] text-[11px] mt-4 leading-relaxed">
                      This content is provided for general educational purposes only and does not constitute professional mechanical advice. A.W.C. Consulting LLC and APEX Driver are not liable for any injury, damage, or loss resulting from the use of this information. When in doubt, contact a professional or roadside assistance service.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Important note about CEL */}
            <div className="p-3 rounded-xl bg-[#12121e] border border-[#2a2a3e] mb-4">
              <p className="text-[#a0a0b8] text-sm">
                <span className="text-yellow-400 font-semibold">Tip:</span> For the check engine light, it matters whether it is <span className="text-yellow-400">solid</span> (steady) or <span className="text-red-400">flashing</span> (blinking). These have very different urgency levels. Select the right one below.
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
              <input
                type="text"
                placeholder="Search warning lights..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]"
              />
            </div>

            {/* Grid */}
            <p className="text-[#6b6b80] text-sm mb-3">Tap the light that&apos;s on in your {vehicleLabel}:</p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((light) => (
                <button
                  key={light.id}
                  onClick={() => handleLightSelect(light.name)}
                  disabled={loading}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 ${colorMap[light.color]} hover:opacity-80 transition-opacity disabled:opacity-50`}
                >
                  <span className="text-2xl">{light.icon}</span>
                  <span className="text-white text-xs font-semibold text-center leading-tight">{light.name}</span>
                  <span className="text-[#6b6b80] text-[10px] text-center leading-tight">{light.description}</span>
                </button>
              ))}
            </div>

            {/* Custom light */}
            <div className="mt-4 p-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e]">
              <p className="text-[#a0a0b8] text-sm mb-2">Don&apos;t see your light? Describe it:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., red exclamation mark in circle..."
                  value={customLight}
                  onChange={(e) => setCustomLight(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0a0a14] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] text-sm"
                />
                <button
                  onClick={() => customLight.trim() && handleLightSelect(customLight.trim())}
                  disabled={!customLight.trim() || loading}
                  className="px-4 py-2 rounded-lg bg-[#FF6200] text-white text-sm font-semibold disabled:opacity-50"
                >
                  Ask
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
