'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, AlertTriangle, Car, Zap, Thermometer, Droplets } from 'lucide-react';

const emergencyScenarios = [
  {
    icon: Car,
    title: 'Car Won\'t Start',
    steps: [
      'Check if your headlights turn on. If they\'re dim or off, it\'s likely a dead battery.',
      'If you have jumper cables and another car, you can try a jump start.',
      'If the engine cranks (makes a grinding noise) but won\'t fire, it could be fuel or spark related — you\'ll need a tow.',
      'If nothing happens at all when you turn the key — dead battery or starter motor.',
      'Call roadside assistance or a tow truck if jump-starting doesn\'t work.',
    ],
  },
  {
    icon: Thermometer,
    title: 'Engine Overheating',
    steps: [
      'Pull over to a safe location immediately.',
      'Turn OFF the AC and turn the heater on FULL BLAST (this pulls heat from the engine).',
      'If safe, open the hood to let heat escape — but DO NOT touch anything.',
      'NEVER open the radiator cap when the engine is hot.',
      'Wait at least 30 minutes for the engine to cool.',
      'If you can see the coolant reservoir, check the level when cool.',
      'Call a tow truck — driving an overheated engine can cause thousands in damage.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Flat Tire',
    steps: [
      'Turn on your hazard lights immediately.',
      'Slowly move to a safe, flat surface away from traffic.',
      'Apply the parking brake.',
      'Check your trunk for a spare tire and jack (not all cars have spares — some have inflation kits).',
      'If you\'re on a highway or feel unsafe, stay in your car and call roadside assistance.',
      'If changing yourself: loosen lug nuts BEFORE jacking up the car.',
      'Never get under a car supported only by a jack.',
    ],
  },
  {
    icon: Zap,
    title: 'Dead Battery',
    steps: [
      'If you have jumper cables and another running car:',
      '1. Connect RED cable to YOUR dead battery\'s positive (+) terminal',
      '2. Connect other RED end to helper car\'s positive (+) terminal',
      '3. Connect BLACK cable to helper car\'s negative (-) terminal',
      '4. Connect other BLACK end to an unpainted metal surface on YOUR car (not the battery)',
      '5. Start the helper car, wait 2-3 minutes',
      '6. Try starting your car',
      '7. If it starts, disconnect cables in REVERSE order',
      '8. Drive for at least 20 minutes to recharge',
    ],
  },
  {
    icon: Droplets,
    title: 'Fluid Leaking',
    steps: [
      'Note the color of the fluid:',
      'RED/PINK = Transmission fluid or power steering — get towed',
      'GREEN/ORANGE = Coolant — do not drive, risk of overheating',
      'BROWN/BLACK = Oil — check level, do not drive if low',
      'CLEAR = Could be AC condensation (normal) or brake fluid (dangerous)',
      'If it\'s brake fluid (slippery, near wheels), DO NOT DRIVE. Call a tow.',
      'For any significant leak, it\'s safest to tow rather than drive.',
    ],
  },
];

export default function EmergencyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Emergency Mode</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href="tel:911"
            className="flex items-center gap-2 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-semibold"
          >
            <Phone className="w-5 h-5" /> Call 911
          </a>
          <a
            href="tel:18002224357"
            className="flex items-center gap-2 p-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-white font-semibold text-sm"
          >
            <Phone className="w-5 h-5 text-[#FF6200]" /> AAA Roadside
          </a>
        </div>

        <div className="p-3 rounded-xl bg-[#12121e] border border-[#2a2a3e] mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#FF6200] shrink-0" />
          <p className="text-[#a0a0b8] text-sm">
            Tip: Look for mile markers, cross streets, or landmarks to tell dispatchers where you are.
          </p>
        </div>

        {/* Scenarios */}
        <h2 className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider mb-3">What Happened?</h2>
        <div className="flex flex-col gap-4">
          {emergencyScenarios.map((scenario, i) => (
            <details key={i} className="group rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden">
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                <scenario.icon className="w-6 h-6 text-[#FF6200] shrink-0" />
                <span className="text-white font-semibold text-lg flex-1">{scenario.title}</span>
                <span className="text-[#6b6b80] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4">
                <ol className="flex flex-col gap-2">
                  {scenario.steps.map((step, j) => (
                    <li key={j} className="text-[#a0a0b8] text-[15px] leading-relaxed pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
