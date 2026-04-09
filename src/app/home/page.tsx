'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import Disclaimer from '@/components/Disclaimer';
import VehicleSelector from '@/components/VehicleSelector';
import type { Vehicle as VehicleType } from '@/components/VehicleSelector';
import {
  AlertTriangle,
  Search,
  Lightbulb,
  Shield,
  Wrench,
  HelpCircle,
  GraduationCap,
  Siren,
  Camera,
  MessageSquareReply,
  Smartphone,
  Clock,
  DollarSign,
  Car,
  FolderOpen,
  Trophy,
  Snowflake,
  Ban,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react';

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  mileage: number | null;
}

interface Profile {
  tier: 'free' | 'pro';
  diag_count: number;
  diag_month: string;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  badge,
  locked,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  badge?: string;
  locked?: boolean;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => !locked && router.push(href)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] hover:bg-[#222238] transition-colors text-left ${locked ? 'opacity-60' : ''}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#222238] flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-[#FF6200]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-lg">{title}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6200]/20 text-[#FF6200] font-semibold">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[#a0a0b8] text-sm mt-0.5 truncate">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-[#6b6b80] shrink-0" />
    </button>
  );
}

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleType | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    if (user) {
      const supabase = createClient();

      supabase
        .from('driver_vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) setVehicle(data[0]);
        });

      supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });

      fetch('/api/admin/check')
        .then(r => r.json())
        .then(d => setIsAdmin(d.authorized))
        .catch(() => {});
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a14]">
        <div className="w-8 h-8 border-2 border-[#FF6200] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPro = profile?.tier === 'pro';
  const currentMonth = new Date().toISOString().slice(0, 7);
  const diagUsed = profile?.diag_month === currentMonth ? (profile?.diag_count ?? 0) : 0;
  const diagLimit = isPro ? 10 : 1;
  const diagRemaining = Math.max(0, diagLimit - diagUsed);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            APEX <span className="text-[#FF6200]">Driver</span>
          </h1>
          <div className="flex items-center gap-3">
            {!isPro && (
              <button
                onClick={() => router.push('/upgrade')}
                className="px-3 py-1.5 rounded-lg bg-[#FF6200] text-white text-sm font-semibold hover:bg-[#e55800] transition-colors"
              >
                Go Pro
              </button>
            )}
            <button onClick={() => router.push('/settings')} className="text-[#a0a0b8] hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={handleSignOut} className="text-[#a0a0b8] hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24">
        {/* Vehicle Selector */}
        <div className="mt-4">
          <VehicleSelector selected={vehicle} onSelect={setVehicle} />
        </div>

        {/* Vehicle Banner */}
        {vehicle && (
          <div className="mt-3 p-4 rounded-xl bg-[#12121e] border border-[#2a2a3e]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#a0a0b8] text-sm">Active Vehicle</p>
                <p className="text-white font-bold text-lg">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                {vehicle.mileage && (
                  <p className="text-[#6b6b80] text-sm">{vehicle.mileage.toLocaleString()} miles</p>
                )}
              </div>
              <Car className="w-8 h-8 text-[#FF6200]" />
            </div>
          </div>
        )}

        {/* Diagnostics Remaining */}
        <div className="mt-4 p-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-between">
          <span className="text-[#a0a0b8] text-sm">
            AI Diagnostics: <span className="text-white font-semibold">{isAdmin ? '∞' : `${diagRemaining}/${diagLimit}`}</span> remaining this month
          </span>
          {!isPro && !isAdmin && (
            <span className="text-[#FF6200] text-sm font-semibold">Unlock 10 with Pro</span>
          )}
        </div>

        {/* Free Features */}
        <div className="mt-6">
          <h2 className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider mb-3">Features</h2>
          <div className="flex flex-col gap-3">
            <FeatureCard
              icon={Search}
              title="What's Wrong?"
              description="Describe your issue — AI figures out the rest"
              href="/diagnose"
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Warning Lights"
              description="Tap your light, get an instant explanation"
              href="/warning-lights"
            />
            <FeatureCard
              icon={Shield}
              title="Recall Checker"
              description="Is your car affected by a safety recall?"
              href="/recalls"
            />
            <FeatureCard
              icon={Wrench}
              title="Maintenance Schedule"
              description="What you actually need vs. the upsell"
              href="/maintenance"
            />
            <FeatureCard
              icon={HelpCircle}
              title="How Do I?"
              description="Check oil, change a tire, jump start & more"
              href="/how-to"
            />
            <FeatureCard
              icon={GraduationCap}
              title="First Car Owner"
              description="Everything they don't teach in driver's ed"
              href="/first-car"
            />
            <FeatureCard
              icon={Siren}
              title="Emergency Mode"
              description="Car broke down? Step-by-step help right now"
              href="/emergency"
            />
          </div>
        </div>

        {/* Pro Features */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider">Pro Features</h2>
            <span className="text-[#FF6200] text-sm font-semibold">$34.99/yr or $4.99/mo</span>
          </div>
          <div className="flex flex-col gap-3">
            <FeatureCard
              icon={Camera}
              title="Understand Your Estimate"
              description="Photo your bill — AI explains every line"
              href="/estimate"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
            <FeatureCard
              icon={MessageSquareReply}
              title="Reply to My Technician"
              description="Know what to say back, every time"
              href="/reply-tech"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
            <FeatureCard
              icon={Smartphone}
              title="My Car's Tech"
              description="Bluetooth, nav, heated seats — how to use it all"
              href="/car-tech"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
            <FeatureCard
              icon={Clock}
              title="How Urgent Is This?"
              description="Stop Driving / Get Checked Soon / Schedule Service"
              href="/urgency"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
            <FeatureCard
              icon={DollarSign}
              title="What Should I Expect?"
              description="National average repair cost ranges"
              href="/cost-estimate"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
            <FeatureCard
              icon={Lightbulb}
              title="Before You Buy"
              description="Used car intelligence report"
              href="/before-you-buy"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
            <FeatureCard
              icon={FolderOpen}
              title="My Glove Box"
              description="Insurance, registration, receipts — always on you"
              href="/glove-box"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
            <FeatureCard
              icon={Trophy}
              title="Car Owner Score"
              description="Gamified maintenance tracking"
              href="/score"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
            <FeatureCard
              icon={Snowflake}
              title="Seasonal Prep"
              description="Winter, summer & road trip checklists"
              href="/seasonal"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
            <FeatureCard
              icon={Ban}
              title="Ad-Free"
              description="No banner ads, ever"
              href="/upgrade"
              badge="PRO"
              locked={!isPro && !isAdmin}
            />
          </div>
        </div>

        {/* Credibility Footer */}
        <div className="mt-12 mb-4 text-center">
          <p className="text-[#FF6200] font-semibold text-sm">Built by a 25-year ASE Master Technician</p>
          <p className="text-[#6b6b80] text-xs mt-2 max-w-xs mx-auto">
            Not a tech startup guessing about cars — real shop-floor expertise powering every answer.
            Built to help the everyday driver.
          </p>
          <p className="text-[#6b6b80] text-xs mt-2">A.W.C. Consulting LLC</p>
        </div>
      </main>

      <Disclaimer />
    </div>
  );
}
