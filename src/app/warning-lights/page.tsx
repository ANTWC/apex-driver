'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';

interface WarningLight {
  id: string;
  name: string;
  icon: string;
  color: 'red' | 'yellow' | 'green' | 'blue';
  urgency: 'Stop Driving' | 'Get Checked Soon' | 'Informational';
  description: string;
  whatToDo: string;
}

const WARNING_LIGHTS: WarningLight[] = [
  {
    id: 'check-engine',
    name: 'Check Engine',
    icon: '🔧',
    color: 'yellow',
    urgency: 'Get Checked Soon',
    description: 'Your car\'s computer detected something wrong with the engine, emissions, or related systems. It could be as minor as a loose gas cap or as serious as a catalytic converter issue.',
    whatToDo: 'If the light is steady, schedule a visit to your mechanic soon. If it\'s FLASHING, reduce speed and get to a shop immediately — a flashing check engine light means potential engine damage is happening right now.',
  },
  {
    id: 'oil-pressure',
    name: 'Oil Pressure',
    icon: '🛢️',
    color: 'red',
    urgency: 'Stop Driving',
    description: 'Oil pressure is dangerously low. Oil is what keeps your engine\'s moving parts from grinding together. Without it, your engine can be destroyed in minutes.',
    whatToDo: 'Pull over safely and turn off your engine immediately. Check your oil level (look in your owner\'s manual for how). Do NOT drive with this light on. Call for a tow if needed.',
  },
  {
    id: 'battery',
    name: 'Battery / Charging',
    icon: '🔋',
    color: 'red',
    urgency: 'Get Checked Soon',
    description: 'Your car\'s charging system isn\'t working properly. This could mean a failing battery, a bad alternator (the part that charges your battery while driving), or a loose belt.',
    whatToDo: 'Your car may continue to run for a while on remaining battery power, but it will eventually die. Turn off non-essential electronics (AC, radio, seat heaters) and drive to the nearest shop. Don\'t turn the car off if you can avoid it — it may not restart.',
  },
  {
    id: 'temperature',
    name: 'Engine Temperature',
    icon: '🌡️',
    color: 'red',
    urgency: 'Stop Driving',
    description: 'Your engine is overheating. This can cause serious, expensive damage if you keep driving — like a warped cylinder head or blown head gasket.',
    whatToDo: 'Pull over safely as soon as possible. Turn off the AC and turn the heater on full blast (this helps pull heat from the engine). Let the engine cool for at least 30 minutes before checking coolant level. Do NOT open the radiator cap when hot. Call for a tow.',
  },
  {
    id: 'brake',
    name: 'Brake Warning',
    icon: '🛑',
    color: 'red',
    urgency: 'Stop Driving',
    description: 'There\'s a problem with your braking system. This could be low brake fluid, worn brake pads, or a more serious hydraulic issue.',
    whatToDo: 'First check: is your parking brake on? Release it and see if the light goes off. If not, carefully test your brakes at low speed. If they feel soft, spongy, or you have to press harder than normal — stop driving immediately and call for a tow.',
  },
  {
    id: 'abs',
    name: 'ABS (Anti-Lock Brakes)',
    icon: '⚠️',
    color: 'yellow',
    urgency: 'Get Checked Soon',
    description: 'Your anti-lock braking system has a problem. ABS prevents your wheels from locking up during hard braking. Your regular brakes should still work, but you won\'t have the anti-lock safety feature.',
    whatToDo: 'Your regular brakes should work normally. Avoid hard braking situations if possible. Schedule a service visit soon. If this light comes on WITH the regular brake light, that\'s more urgent — get checked immediately.',
  },
  {
    id: 'airbag',
    name: 'Airbag / SRS',
    icon: '🎈',
    color: 'red',
    urgency: 'Get Checked Soon',
    description: 'Something is wrong with your airbag system. Your airbags may not deploy in a crash, or in rare cases, could deploy unexpectedly.',
    whatToDo: 'Your car is still driveable, but your safety system is compromised. Get this checked as soon as possible. This is especially important if you have passengers.',
  },
  {
    id: 'tpms',
    name: 'Tire Pressure (TPMS)',
    icon: '🔵',
    color: 'yellow',
    urgency: 'Get Checked Soon',
    description: 'One or more of your tires is significantly low on air. Low tire pressure affects handling, increases stopping distance, and causes uneven tire wear.',
    whatToDo: 'Check all four tires with a tire pressure gauge (gas stations often have free air). The correct pressure is listed on a sticker inside your driver\'s door jamb. Fill to the recommended PSI. If the light keeps coming back, you may have a slow leak — visit a tire shop.',
  },
  {
    id: 'traction',
    name: 'Traction Control / Stability',
    icon: '🚗',
    color: 'yellow',
    urgency: 'Informational',
    description: 'If this light flashes while driving, it means the system is actively helping you maintain control (like on ice or wet roads). If it stays on solid, the system may be turned off or malfunctioning.',
    whatToDo: 'A flashing light during slippery conditions is normal — drive carefully. If the light stays on solid, check if you accidentally pressed the traction control off button. If not, have it checked — you\'ll want this working, especially in bad weather.',
  },
  {
    id: 'power-steering',
    name: 'Power Steering',
    icon: '🔴',
    color: 'red',
    urgency: 'Get Checked Soon',
    description: 'Your power steering system has a problem. Without power steering, turning the wheel becomes very difficult, especially at low speeds and during parking.',
    whatToDo: 'You can still steer, but it will require much more effort. Avoid tight turns and parking situations if possible. Drive carefully to a shop. This is more urgent if you have difficulty controlling the vehicle.',
  },
  {
    id: 'fuel',
    name: 'Low Fuel',
    icon: '⛽',
    color: 'yellow',
    urgency: 'Informational',
    description: 'You\'re running low on fuel. Most cars have about 30-50 miles of driving left when this light comes on, but this varies by vehicle.',
    whatToDo: 'Get fuel at your next opportunity. Consistently running your tank to empty can damage your fuel pump (which sits in the gas tank and uses fuel to stay cool).',
  },
  {
    id: 'door-ajar',
    name: 'Door Ajar',
    icon: '🚪',
    color: 'yellow',
    urgency: 'Informational',
    description: 'A door, trunk, or hood isn\'t fully closed.',
    whatToDo: 'Stop safely and check all doors, the trunk, and the hood. Sometimes a door looks closed but hasn\'t latched. Give it a firm push. If the light stays on with all doors closed, the sensor may need replacement.',
  },
];

export default function WarningLightsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<WarningLight | null>(null);

  const filtered = WARNING_LIGHTS.filter(light =>
    light.name.toLowerCase().includes(search.toLowerCase())
  );

  const colorMap = {
    red: 'border-red-500 bg-red-500/10',
    yellow: 'border-yellow-500 bg-yellow-500/10',
    green: 'border-green-500 bg-green-500/10',
    blue: 'border-blue-500 bg-blue-500/10',
  };

  const urgencyColor = {
    'Stop Driving': 'text-red-400',
    'Get Checked Soon': 'text-yellow-400',
    'Informational': 'text-green-400',
  };

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Warning Lights</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
          <input
            type="text"
            placeholder="Search warning lights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
          />
        </div>

        {/* Selected light detail */}
        {selected && (
          <div className="mb-6 p-5 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selected.icon}</span>
                <div>
                  <h2 className="text-white font-bold text-xl">{selected.name}</h2>
                  <span className={`text-sm font-semibold ${urgencyColor[selected.urgency]}`}>
                    {selected.urgency}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#6b6b80] hover:text-white text-sm"
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-[#FF6200] font-semibold text-sm mb-1">What It Means</h3>
                <p className="text-[#a0a0b8] text-[15px] leading-relaxed">{selected.description}</p>
              </div>
              <div>
                <h3 className="text-[#FF6200] font-semibold text-sm mb-1">What to Do</h3>
                <p className="text-[#a0a0b8] text-[15px] leading-relaxed">{selected.whatToDo}</p>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((light) => (
            <button
              key={light.id}
              onClick={() => setSelected(light)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 ${colorMap[light.color]} hover:opacity-80 transition-opacity`}
            >
              <span className="text-3xl">{light.icon}</span>
              <span className="text-white text-xs font-semibold text-center leading-tight">{light.name}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
