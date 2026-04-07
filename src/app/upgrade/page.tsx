'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Crown } from 'lucide-react';

export default function UpgradePage() {
  const router = useRouter();
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  };

  const proFeatures = [
    '10 AI diagnostics per month',
    'Understand Your Estimate',
    'Reply to My Technician',
    'My Car\'s Tech',
    'How Urgent Is This?',
    'Cost Estimate Ranges',
    'Before You Buy',
    'My Glove Box',
    'Car Owner Score',
    'Seasonal Prep Checklists',
    'Ad-free experience',
    'Up to 5 vehicles',
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Go Pro</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <Crown className="w-12 h-12 text-[#FF6200] mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">APEX Driver Pro</h2>
          <p className="text-[#a0a0b8]">Your complete car ownership companion</p>
        </div>

        {/* Plan toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setPlan('yearly')}
            className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
              plan === 'yearly'
                ? 'border-[#FF6200] bg-[#FF6200]/10'
                : 'border-[#2a2a3e] bg-[#1a1a2e]'
            }`}
          >
            <p className="text-white font-bold text-lg">$34.99/yr</p>
            <p className="text-[#a0a0b8] text-sm">$2.92/mo — Save 42%</p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-[#FF6200]/20 text-[#FF6200] font-semibold">
              Best Value
            </span>
          </button>
          <button
            onClick={() => setPlan('monthly')}
            className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
              plan === 'monthly'
                ? 'border-[#FF6200] bg-[#FF6200]/10'
                : 'border-[#2a2a3e] bg-[#1a1a2e]'
            }`}
          >
            <p className="text-white font-bold text-lg">$4.99/mo</p>
            <p className="text-[#a0a0b8] text-sm">Cancel anytime</p>
          </button>
        </div>

        {/* 7-day trial */}
        <div className="p-4 rounded-xl bg-[#12121e] border border-[#2a2a3e] mb-6 text-center">
          <p className="text-white font-semibold">7-day free trial</p>
          <p className="text-[#a0a0b8] text-sm">Try everything free. Cancel before day 8 and pay nothing.</p>
        </div>

        {/* Features list */}
        <div className="mb-8">
          <h3 className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider mb-3">Everything in Pro</h3>
          <div className="flex flex-col gap-2">
            {proFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#FF6200] shrink-0" />
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[#FF6200] text-white font-bold text-lg hover:bg-[#e55800] transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : `Start Free Trial — ${plan === 'yearly' ? '$34.99/yr' : '$4.99/mo'}`}
        </button>

        <p className="text-[#6b6b80] text-xs text-center mt-3">
          Cancel anytime from your account settings. No hidden fees.
        </p>
      </main>
    </div>
  );
}
