'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Shield, DollarSign, Wrench, Car, AlertTriangle } from 'lucide-react';

const topics = [
  {
    icon: FileText,
    title: 'Insurance Basics',
    content: `**What you need:** Liability insurance at minimum (required by law in most states). Full coverage if you have a car loan.

**Liability** covers damage you cause to OTHER people/cars. **Collision** covers YOUR car in a crash. **Comprehensive** covers theft, weather, vandalism.

**Tips to save money:**
- Shop around — prices vary wildly between companies
- Higher deductible = lower monthly payment (but you pay more out of pocket in a crash)
- Good student discounts, multi-car discounts, bundling with renters insurance
- Don't just go with whatever your parents have — get your own quotes`,
  },
  {
    icon: Shield,
    title: 'Registration & Title',
    content: `**Title** = proof you own the car. Keep this in a safe place at home (NOT in the car).

**Registration** = permission from the state to drive the car on public roads. Must be renewed yearly. Keep the registration card IN the car.

**If you buy used from a private seller:**
1. Get the title signed over to you
2. Go to your local DMV within 30 days
3. Bring: signed title, bill of sale, your ID, proof of insurance
4. Pay title transfer fee + registration + taxes

**If you buy from a dealer:** They usually handle the paperwork for you.`,
  },
  {
    icon: DollarSign,
    title: 'Budgeting for a Car',
    content: `**The real cost of owning a car** goes way beyond the payment:

- Car payment (if financed)
- Insurance ($100-300+/month for young drivers)
- Gas ($100-250/month depending on commute)
- Maintenance ($50-100/month average, set aside even if you don't spend it)
- Registration renewal ($50-200/year)
- Unexpected repairs (budget $500-1000/year)

**Rule of thumb:** Your total car costs shouldn't exceed 15-20% of your take-home pay.

**Financing tip:** Get pre-approved at your bank or credit union BEFORE going to the dealer. Dealer financing often has higher rates.`,
  },
  {
    icon: Wrench,
    title: 'Finding a Mechanic You Trust',
    content: `**How to find a good mechanic:**
- Ask friends and family for recommendations
- Look for ASE-certified shops
- Check Google reviews (but read them — look for patterns, not just stars)
- Start with a small job (oil change) to test them out

**Green flags:**
- They explain what's wrong in plain language
- They show you the problem when possible
- They give you written estimates before starting work
- They call you before doing anything extra

**Red flags:**
- Pressure to fix things RIGHT NOW
- Won't show you the old parts they replaced
- Price is way different from the estimate
- They find a "new problem" every time you visit

**Always:** Get a second opinion on any repair over $500.`,
  },
  {
    icon: Car,
    title: 'Your First Road Trip',
    content: `**Before you go:**
- Check oil level
- Check tire pressure (including spare)
- Check coolant level
- Make sure all lights work
- Check wiper blades and washer fluid
- Full tank of gas

**Pack these:**
- Phone charger (car charger)
- Jumper cables
- Flashlight
- Basic first aid kit
- Blanket
- Water bottle
- Paper maps or downloaded offline maps (cell service isn't everywhere)

**On the road:**
- Stop every 2 hours or 100 miles to stretch
- Don't drive drowsy — it's as dangerous as drunk driving
- Follow the 3-second rule for following distance
- If weather gets bad, slow down or pull over`,
  },
  {
    icon: AlertTriangle,
    title: 'What to Do in an Accident',
    content: `**Stay calm. Here's your checklist:**

1. **Check for injuries** — call 911 if anyone is hurt
2. **Move to safety** if possible — pull to the shoulder or parking lot
3. **Turn on hazard lights**
4. **Call the police** — even for minor accidents, get a police report
5. **Exchange info** with the other driver:
   - Name, phone number
   - Insurance company and policy number
   - Driver's license number
   - License plate number
   - Make and model of their car
6. **Take photos** of everything: damage to both cars, the scene, license plates, the other driver's insurance card
7. **Don't admit fault** — just exchange info and let insurance sort it out
8. **Call your insurance** company to report it
9. **See a doctor** if you feel any pain — some injuries show up days later

**Never leave the scene** of an accident you're involved in — that's a crime.`,
  },
];

export default function FirstCarPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">First Car Owner</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <p className="text-[#a0a0b8] text-sm mb-4">
          Everything they don&apos;t teach you in driver&apos;s ed.
        </p>

        <div className="flex flex-col gap-4">
          {topics.map((topic, i) => (
            <details key={i} className="group rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden">
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                <topic.icon className="w-6 h-6 text-[#FF6200] shrink-0" />
                <span className="text-white font-semibold text-lg flex-1">{topic.title}</span>
                <span className="text-[#6b6b80] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4">
                <div className="text-[#a0a0b8] text-[15px] leading-relaxed whitespace-pre-line">
                  {topic.content}
                </div>
              </div>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
