'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import VinScanner from '@/components/VinScanner';
import { ArrowLeft, Car, Plus, Crown, Trash2, CreditCard, Loader2, Shield } from 'lucide-react';

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  mileage: number | null;
  vin: string | null;
}

interface Profile {
  tier: 'free' | 'pro';
  email: string;
  stripe_customer_id: string | null;
  diag_count: number;
  diag_month: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [useVinScanner, setUseVinScanner] = useState(false);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      const supabase = createClient();
      supabase.from('driver_vehicles').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setVehicles(data); });
      supabase.from('driver_profiles').select('*').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setProfile(data); });

      fetch('/api/admin/check')
        .then(r => r.json())
        .then(d => setIsAdmin(d.authorized))
        .catch(() => {});
    }
  }, [user, authLoading, router]);

  const addVehicle = async () => {
    if (!user || !year || !make || !model) return;
    const supabase = createClient();
    const { data } = await supabase.from('driver_vehicles').insert({
      user_id: user.id,
      year: parseInt(year),
      make,
      model,
      mileage: mileage ? parseInt(mileage) : null,
      vin: vin || null,
    }).select().single();

    if (data) {
      setVehicles([data, ...vehicles]);
      setShowAddVehicle(false);
      setUseVinScanner(false);
      setYear(''); setMake(''); setModel(''); setMileage(''); setVin('');
    }
  };

  const removeVehicle = async (id: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('driver_vehicles').delete().eq('id', id).eq('user_id', user.id);
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setPortalError('');
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.url) {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) {
          window.open(data.url, '_blank');
        } else {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not open billing portal';
      setPortalError(msg);
      setPortalLoading(false);
    }
  };

  const isPro = profile?.tier === 'pro';
  const maxVehicles = isPro ? 5 : 2;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const diagUsed = profile?.diag_month === currentMonth ? (profile?.diag_count ?? 0) : 0;
  const diagLimit = isPro ? 10 : 1;

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Account */}
        <section className="mb-6">
          <h2 className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider mb-3">Account</h2>
          <div className="p-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e]">
            <p className="text-white">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {isPro ? (
                <span className="flex items-center gap-1 text-[#FF6200] text-sm font-semibold">
                  <Crown className="w-4 h-4" /> Pro
                </span>
              ) : (
                <span className="text-[#6b6b80] text-sm">Free Plan</span>
              )}
              {isAdmin && (
                <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-[#6b6b80] text-xs mt-2">
              Diagnostics used: {isAdmin ? '∞' : `${diagUsed}/${diagLimit}`} this month
            </p>
          </div>
        </section>

        {/* Subscription & Billing */}
        <section className="mb-6">
          <h2 className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider mb-3">Subscription & Billing</h2>
          <div className="flex flex-col gap-3">
            {isPro && profile?.stripe_customer_id && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-white font-semibold hover:bg-[#222238] transition-colors disabled:opacity-50"
              >
                {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 text-[#FF6200]" />}
                Manage Subscription & Payment
              </button>
            )}
            {!isPro && (
              <button
                onClick={() => router.push('/upgrade')}
                className="w-full py-3 rounded-xl bg-[#FF6200] text-white font-semibold hover:bg-[#e55800] flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" /> Upgrade to Pro — $34.99/yr
              </button>
            )}
            {portalError && <p className="text-red-400 text-sm">{portalError}</p>}
          </div>
        </section>

        {/* Vehicles */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider">
              Vehicles ({vehicles.length}/{maxVehicles})
            </h2>
            {vehicles.length < maxVehicles && (
              <button
                onClick={() => setShowAddVehicle(true)}
                className="flex items-center gap-1 text-[#FF6200] text-sm font-semibold"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e]">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-[#FF6200]" />
                  <div>
                    <p className="text-white font-semibold">{v.year} {v.make} {v.model}</p>
                    <div className="flex gap-2">
                      {v.mileage && <p className="text-[#6b6b80] text-xs">{v.mileage.toLocaleString()} miles</p>}
                      {v.vin && <p className="text-[#6b6b80] text-xs font-mono">{v.vin}</p>}
                    </div>
                  </div>
                </div>
                <button onClick={() => removeVehicle(v.id)} className="text-[#6b6b80] hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {showAddVehicle && (
            <div className="mt-3 p-4 rounded-xl bg-[#12121e] border border-[#2a2a3e] flex flex-col gap-3">
              {/* VIN Scanner toggle */}
              <div className="flex gap-2 mb-1">
                <button
                  onClick={() => setUseVinScanner(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${!useVinScanner ? 'bg-[#FF6200] text-white' : 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#a0a0b8]'}`}
                >
                  Manual Entry
                </button>
                <button
                  onClick={() => setUseVinScanner(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${useVinScanner ? 'bg-[#FF6200] text-white' : 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#a0a0b8]'}`}
                >
                  Scan VIN
                </button>
              </div>

              {useVinScanner ? (
                <VinScanner onDecoded={(data) => {
                  setYear(data.year);
                  setMake(data.make);
                  setModel(data.model);
                  setVin(data.vin);
                  setUseVinScanner(false);
                }} />
              ) : (
                <>
                  <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
                  <input type="text" placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
                  <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
                  <input type="number" placeholder="Mileage (optional)" value={mileage} onChange={(e) => setMileage(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
                  <input type="text" placeholder="VIN (optional)" value={vin} onChange={(e) => setVin(e.target.value)} maxLength={17}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] font-mono tracking-wider uppercase" />
                </>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setShowAddVehicle(false); setUseVinScanner(false); }} className="flex-1 py-2 rounded-lg border border-[#2a2a3e] text-[#a0a0b8]">Cancel</button>
                <button onClick={addVehicle} disabled={!year || !make || !model} className="flex-1 py-2 rounded-lg bg-[#FF6200] text-white font-semibold disabled:opacity-50">Add Vehicle</button>
              </div>
            </div>
          )}

          {!isPro && vehicles.length >= 2 && (
            <p className="text-[#FF6200] text-sm mt-2">Upgrade to Pro for up to 5 vehicles</p>
          )}
        </section>

        {/* Actions */}
        <section>
          <h2 className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider mb-3">Account Actions</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={async () => { await signOut(); router.replace('/login'); }}
              className="w-full py-3 rounded-xl border border-[#2a2a3e] text-[#a0a0b8] hover:text-white hover:border-[#FF6200] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
