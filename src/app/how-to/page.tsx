'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Droplets, Wind, Gauge, Wrench, Lightbulb, Snowflake } from 'lucide-react';

const guides = [
  {
    icon: Droplets,
    title: 'Check Your Oil',
    steps: [
      'Park on a flat surface and wait 5 minutes after turning off the engine.',
      'Open the hood and find the oil dipstick (usually has a yellow or orange handle).',
      'Pull the dipstick out and wipe it clean with a paper towel.',
      'Insert it all the way back in, then pull it out again.',
      'Look at the oil level — it should be between the two marks (min and max).',
      'Check the color: golden/amber = good. Dark brown/black = time for an oil change.',
      'If it\'s below the minimum mark, add the correct type of oil (check your owner\'s manual).',
    ],
  },
  {
    icon: Wind,
    title: 'Change a Flat Tire',
    steps: [
      'Pull over to a flat, stable surface. Turn on hazard lights.',
      'Apply the parking brake. Place wheel wedges behind the tires.',
      'Remove the hubcap and loosen the lug nuts (turn left) — loosen only, don\'t remove yet.',
      'Place the jack under the vehicle frame near the flat tire. Raise until the tire is 6 inches off ground.',
      'Fully remove the lug nuts. Pull off the flat tire.',
      'Mount the spare tire. Hand-tighten the lug nuts in a star pattern.',
      'Lower the vehicle. Tighten lug nuts fully in a star pattern.',
      'Check the spare tire pressure. Drive carefully — spare tires are meant for short distances.',
    ],
  },
  {
    icon: Gauge,
    title: 'Check Tire Pressure',
    steps: [
      'Find the recommended PSI on the sticker inside your driver\'s door jamb.',
      'Remove the valve cap from one tire.',
      'Press the tire pressure gauge firmly onto the valve stem.',
      'Read the pressure. Compare to the recommended number.',
      'If low, add air at a gas station air pump. Check again after adding.',
      'Don\'t forget to check all four tires plus the spare.',
      'Check tire pressure when tires are cold (before driving or after sitting 3+ hours).',
    ],
  },
  {
    icon: Wrench,
    title: 'Jump Start a Car',
    steps: [
      'Position the working car near yours — batteries close, cars not touching.',
      'Turn off both cars. Open both hoods.',
      'RED cable: Connect to dead battery positive (+), then to good battery positive (+).',
      'BLACK cable: Connect to good battery negative (-), then to unpainted metal on dead car.',
      'Start the working car. Wait 2-3 minutes.',
      'Try starting the dead car. If it starts, success!',
      'Remove cables in REVERSE order. Drive for 20+ minutes to recharge.',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Replace Wiper Blades',
    steps: [
      'Buy the correct size — check your owner\'s manual or a wiper size chart at the auto parts store.',
      'Lift the wiper arm away from the windshield (it should stay up on its own).',
      'Find the release tab where the blade connects to the arm.',
      'Press the tab and slide the old blade down and off.',
      'Slide the new blade on until it clicks into place.',
      'Gently lower the arm back. Repeat on the other side.',
      'Test them with your windshield washer.',
    ],
  },
  {
    icon: Snowflake,
    title: 'Replace Cabin Air Filter',
    steps: [
      'Your cabin air filter cleans the air you breathe inside the car.',
      'Most are behind the glove box. Open it and look for release tabs on the sides.',
      'Squeeze the tabs, let the glove box drop down.',
      'Find the filter housing — usually a rectangular panel.',
      'Open the panel and slide the old filter out. Note which direction the arrows point.',
      'Slide the new filter in with the airflow arrows pointing the same direction.',
      'Reassemble. Replace every 15,000-20,000 miles or once a year.',
    ],
  },
];

export default function HowToPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">How Do I?</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {guides.map((guide, i) => (
            <details key={i} className="group rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden">
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                <guide.icon className="w-6 h-6 text-[#FF6200] shrink-0" />
                <span className="text-white font-semibold text-lg flex-1">{guide.title}</span>
                <span className="text-[#6b6b80] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4">
                <ol className="flex flex-col gap-2">
                  {guide.steps.map((step, j) => (
                    <li key={j} className="text-[#a0a0b8] text-[15px] leading-relaxed flex gap-2">
                      <span className="text-[#FF6200] font-semibold shrink-0">{j + 1}.</span>
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
