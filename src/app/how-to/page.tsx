'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import VehicleSelector from '@/components/VehicleSelector';
import type { Vehicle } from '@/components/VehicleSelector';
import { ArrowLeft, Droplets, Wind, Gauge, Wrench, Lightbulb, Snowflake, Car, ShieldAlert } from 'lucide-react';

const LEGAL_FOOTER = `This content is provided for general educational purposes only and does not constitute professional mechanical advice. A.W.C. Consulting LLC and APEX Driver are not liable for any injury, damage, or loss resulting from the use of this information. When in doubt, contact a professional or roadside assistance service.`;

interface Guide {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  doNotAttempt: string[];
  safetyFirst: string[];
  steps: string[];
  followUp: string[];
}

const guides: Guide[] = [
  {
    icon: Droplets,
    title: 'Check Your Oil',
    doNotAttempt: [
      'The engine has been running in the last 5 minutes and is still hot — let it cool to avoid burns.',
      'You smell gas or see fluid leaking heavily under the car — call a professional.',
      'You are parked on a slope or uneven surface.',
    ],
    safetyFirst: [
      'Park on a flat, level surface and engage the parking brake.',
      'Turn off the engine and wait at least 5 minutes for oil to settle.',
      'Keep loose clothing and jewelry away from the engine bay.',
    ],
    steps: [
      'Open the hood and locate the oil dipstick — it usually has a yellow or orange loop handle.',
      'Pull the dipstick out and wipe it clean with a lint-free rag or paper towel.',
      'Insert the dipstick all the way back in, then pull it out again slowly.',
      'Look at the oil level — it should fall between the two marks (MIN and MAX) near the bottom of the dipstick.',
      'Check the oil color: golden or amber means the oil is in good shape. Dark brown or black means it is time for an oil change.',
      'If the level is below the MIN mark, you will need to add the correct type of oil. Check your owner\'s manual for the right weight (for example, 5W-30).',
      'Add oil a little at a time (about half a quart), wait a minute, then recheck. Do not overfill.',
    ],
    followUp: [
      'If you added oil, recheck the level after driving a few miles.',
      'If your oil is consistently low between changes, mention it to your mechanic — it could indicate a leak or consumption issue.',
      'Refer to your owner\'s manual for your recommended oil change interval.',
    ],
  },
  {
    icon: Wind,
    title: 'Change a Flat Tire',
    doNotAttempt: [
      'You are on a highway, interstate, or busy road with no safe shoulder — stay in the car with hazards on and call roadside assistance.',
      'The car is on a slope, hill, or soft ground (dirt, grass, gravel).',
      'It is dark and you do not have adequate lighting or visibility.',
      'You have any physical limitation that would make lifting a tire or crouching difficult.',
      'Your vehicle does not have a spare tire or jack — many newer cars only have an inflation kit. Check your trunk first.',
      'You feel unsafe or unsure at any point — your safety is more important than doing it yourself.',
    ],
    safetyFirst: [
      'Turn on your hazard lights immediately.',
      'Pull to a flat, solid, paved surface as far from traffic as possible.',
      'Engage the parking brake firmly.',
      'Place wheel wedges, bricks, or heavy objects behind the tires on the opposite side to prevent rolling.',
      'If you have reflective triangles or flares, place them behind your vehicle.',
    ],
    steps: [
      'Remove the hubcap or wheel cover if your vehicle has one.',
      'Using the lug wrench from your trunk, loosen each lug nut about a half turn counterclockwise. Do not remove them yet — just break them loose while the tire is still on the ground.',
      'Place the jack under the vehicle frame at the correct jack point near the flat tire. Check your owner\'s manual for the exact location — the wrong spot can damage your car.',
      'Raise the jack until the flat tire is about 6 inches off the ground.',
      'Now fully remove the lug nuts and set them somewhere you will not lose them.',
      'Pull the flat tire straight toward you to remove it. Set it aside flat on the ground.',
      'Mount the spare tire onto the wheel studs and push it flush against the hub.',
      'Hand-tighten the lug nuts in a star or crisscross pattern — not in a circle.',
      'Lower the vehicle until the tire just touches the ground but the full weight is not on it yet.',
      'Tighten the lug nuts firmly in the same star pattern. Take your time and prioritize getting them snug and even.',
      'Lower the vehicle completely and remove the jack.',
    ],
    followUp: [
      'Spare tires (especially compact "donut" spares) are NOT meant for highway speeds or long distances. Most are rated for 50 mph max and 50-70 miles.',
      'Drive directly to a tire shop to get your full-size tire repaired or replaced.',
      'Have a shop verify your lug nuts are properly torqued within 24-48 hours — this is critical for safety.',
      'Check your spare tire\'s air pressure as soon as possible.',
    ],
  },
  {
    icon: Gauge,
    title: 'Check Tire Pressure',
    doNotAttempt: [
      'You just finished driving — tire pressure readings are inaccurate when tires are hot. Wait at least 3 hours or check before your first drive of the day.',
    ],
    safetyFirst: [
      'Park on a flat, level surface.',
      'Make sure the vehicle is in park with the parking brake engaged.',
    ],
    steps: [
      'Find the recommended tire pressure for your vehicle — it is on a sticker inside the driver\'s door jamb (NOT on the tire itself — the number on the tire is the maximum, not the target).',
      'Remove the valve cap from one tire and keep it somewhere safe.',
      'Press the tire pressure gauge firmly and straight onto the valve stem. You will hear a brief hiss — that is normal.',
      'Read the pressure on the gauge. Compare it to the recommended number from the door sticker.',
      'If the pressure is low, add air at a gas station air pump. Add air in short bursts and recheck frequently — it is easy to overinflate.',
      'If the pressure is too high, press the small pin inside the valve stem briefly to release air. Recheck.',
      'Replace the valve cap when done.',
      'Repeat for all four tires — and check the spare if your vehicle has one.',
    ],
    followUp: [
      'Check tire pressure at least once a month and before any long drive.',
      'Tire pressure drops about 1 PSI for every 10-degree drop in temperature, so check more often in winter.',
      'If a tire is consistently losing pressure, it may have a slow leak — have a shop inspect it.',
    ],
  },
  {
    icon: Wrench,
    title: 'Jump Start a Car',
    doNotAttempt: [
      'You drive a hybrid or electric vehicle — the process may be different or dangerous. Check your owner\'s manual first or call roadside assistance.',
      'The battery is cracked, leaking, or visibly damaged.',
      'You smell rotten eggs (sulfur) near the battery — this could indicate a dangerous gas leak.',
      'The battery terminals are heavily corroded and you cannot get a clean connection.',
      'You are not confident about which terminals are positive (+) and negative (-) — connecting them wrong can cause serious damage or injury.',
    ],
    safetyFirst: [
      'Park both vehicles on flat ground, close enough for the cables to reach but not touching each other.',
      'Turn off both vehicles completely — engine, lights, radio, everything.',
      'Remove any loose clothing, jewelry, or dangling items before working near the battery.',
      'Never let the cable clamps touch each other while connected to any battery.',
    ],
    steps: [
      'Identify the positive (+) and negative (-) terminals on both batteries. Positive is usually marked with a + and often has a red cover.',
      'Connect one RED clamp to the DEAD battery\'s positive (+) terminal.',
      'Connect the other RED clamp to the GOOD battery\'s positive (+) terminal.',
      'Connect one BLACK clamp to the GOOD battery\'s negative (-) terminal.',
      'Connect the other BLACK clamp to an UNPAINTED metal surface on the dead car\'s engine block — NOT the dead battery\'s negative terminal. This prevents sparking near the battery.',
      'Start the working car and let it run for 2-3 minutes.',
      'Try starting the dead car. If it cranks but does not start, wait another 2-3 minutes and try again.',
      'If it starts — success! Remove the cables in REVERSE order: black from dead car, black from good car, red from good car, red from dead car.',
    ],
    followUp: [
      'Drive the jumped car for at least 20-30 minutes to let the alternator recharge the battery.',
      'If the battery dies again within a day or two, it likely needs replacement — have a shop test it.',
      'If the car did not start after 2-3 attempts, the issue may not be the battery. Call for professional help.',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Replace Wiper Blades',
    doNotAttempt: [
      'You are unsure how the wiper arm release mechanism works on your vehicle — forcing it can break the arm or scratch your windshield.',
    ],
    safetyFirst: [
      'Turn off the engine and wipers.',
      'Be gentle when lifting wiper arms — if one snaps back, it can crack your windshield.',
      'Place a folded towel on the windshield under the arm as a precaution.',
    ],
    steps: [
      'Buy the correct size wiper blades — check your owner\'s manual or use the fitment guide at any auto parts store. Most vehicles use different sizes for driver and passenger side.',
      'Lift the wiper arm away from the windshield. It should stay up on its own.',
      'Find the release tab or clip where the blade connects to the arm.',
      'Press the tab and slide the old blade down and off the arm hook.',
      'Slide the new blade onto the hook until it clicks securely into place.',
      'Gently lower the arm back to the windshield.',
      'Repeat on the other side.',
    ],
    followUp: [
      'Test them with your windshield washer fluid to make sure they wipe cleanly with no streaks.',
      'Replace wiper blades every 6-12 months, or sooner if they streak, skip, or squeak.',
      'Worn wipers are a safety issue in rain — do not put this off.',
    ],
  },
  {
    icon: Snowflake,
    title: 'Replace Cabin Air Filter',
    doNotAttempt: [
      'Your vehicle requires dashboard disassembly to access the filter — some vehicles have cabin filters in difficult locations. Check your owner\'s manual first.',
    ],
    safetyFirst: [
      'Turn off the engine and the HVAC system.',
      'Work in a well-lit area so you can see the filter housing clearly.',
    ],
    steps: [
      'Your cabin air filter cleans the air you breathe inside the car. When it is dirty, you may notice reduced airflow, musty smells, or foggy windows.',
      'Most cabin air filters are behind the glove box. Open it and look for squeeze tabs or release clips on the sides.',
      'Squeeze the tabs or unclip the stops, and let the glove box drop down fully to reveal the filter housing.',
      'Open the filter housing cover — it usually has tabs or a latch.',
      'Slide the old filter out. Before you do, note the direction of the airflow arrows printed on the filter — the new one must go in the same direction.',
      'Slide the new filter in with the airflow arrows pointing the same direction as the old one.',
      'Close the housing cover, push the glove box back up, and re-clip the stops.',
    ],
    followUp: [
      'Replace the cabin air filter every 15,000-20,000 miles or once a year — more often if you drive in dusty conditions or have allergies.',
      'If you are unsure about the location or process on your specific vehicle, any shop can do this for you quickly and inexpensively.',
    ],
  },
];

export default function HowToPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
  }, [user, authLoading, router]);

  const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '';

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">How Do I?</h1>
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
            <p className="text-[#a0a0b8] text-sm mb-4">Add your vehicle to see guides tailored to your car.</p>
            <button onClick={() => router.push('/settings')} className="px-6 py-2 rounded-lg bg-[#FF6200] text-white font-semibold">
              Add Vehicle
            </button>
          </div>
        )}

        {vehicle && (
          <>
            {/* Master Disclaimer */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold text-sm mb-2">Safety &amp; Liability Notice</p>
                  <p className="text-[#a0a0b8] text-sm leading-relaxed">
                    These guides are for educational purposes only. If you are unsure, uncomfortable, or in an unsafe location, call roadside assistance or a professional. Your safety is more important than doing it yourself.
                  </p>
                  <p className="text-[#a0a0b8] text-sm leading-relaxed mt-2">
                    Every vehicle is different. Consult your {vehicleLabel} owner&apos;s manual for vehicle-specific instructions.
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle context note */}
            <div className="p-3 rounded-xl bg-[#12121e] border border-[#2a2a3e] mb-5">
              <p className="text-[#a0a0b8] text-sm">
                Based on your <span className="text-white font-semibold">{vehicleLabel}</span>, here&apos;s what to know. These are general steps that apply to most vehicles — your {vehicleLabel} may have specific differences. Check your owner&apos;s manual or ask in <span className="text-[#FF6200]">My Car&apos;s Tech</span> for steps specific to your vehicle.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {guides.map((guide, i) => (
                <details key={i} className="group rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                    <guide.icon className="w-6 h-6 text-[#FF6200] shrink-0" />
                    <span className="text-white font-semibold text-lg flex-1">{guide.title}</span>
                    <span className="text-[#6b6b80] group-open:rotate-180 transition-transform">&#9660;</span>
                  </summary>
                  <div className="px-4 pb-4">
                    {/* Do Not Attempt */}
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-red-400 font-semibold text-sm mb-2">Do Not Attempt If:</p>
                      <ul className="flex flex-col gap-1.5">
                        {guide.doNotAttempt.map((item, j) => (
                          <li key={j} className="text-[#a0a0b8] text-sm leading-relaxed flex gap-2">
                            <span className="text-red-400 shrink-0">&#10005;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-red-400 text-xs mt-2 font-semibold">If any of the above apply — do not attempt. Call for help.</p>
                    </div>

                    {/* Safety First */}
                    <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-yellow-400 font-semibold text-sm mb-2">Safety Steps First:</p>
                      <ul className="flex flex-col gap-1.5">
                        {guide.safetyFirst.map((item, j) => (
                          <li key={j} className="text-[#a0a0b8] text-sm leading-relaxed flex gap-2">
                            <span className="text-yellow-400 shrink-0">&#9888;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Steps */}
                    <p className="text-[#a0a0b8] text-xs mb-2">Take your time and prioritize safety at every step.</p>
                    <ol className="flex flex-col gap-2 mb-4">
                      {guide.steps.map((step, j) => (
                        <li key={j} className="text-[#a0a0b8] text-[15px] leading-relaxed flex gap-2">
                          <span className="text-[#FF6200] font-semibold shrink-0">{j + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>

                    {/* Follow-Up */}
                    <div className="mb-3 p-3 rounded-lg bg-[#0a0a14] border border-[#2a2a3e]">
                      <p className="text-[#FF6200] font-semibold text-sm mb-2">After You&apos;re Done:</p>
                      <ul className="flex flex-col gap-1.5">
                        {guide.followUp.map((item, j) => (
                          <li key={j} className="text-[#a0a0b8] text-sm leading-relaxed flex gap-2">
                            <span className="text-[#FF6200] shrink-0">&#8594;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Per-guide legal */}
                    <p className="text-[#6b6b80] text-[11px] leading-relaxed mt-3">
                      {LEGAL_FOOTER}
                    </p>
                  </div>
                </details>
              ))}
            </div>

            {/* Bottom legal */}
            <div className="mt-6 p-4 rounded-xl bg-[#12121e] border border-[#2a2a3e]">
              <p className="text-[#6b6b80] text-xs text-center leading-relaxed">
                {LEGAL_FOOTER}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
