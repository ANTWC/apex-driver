'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Car, Plus, Crown, Trash2 } from 'lucide-react';

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  mileage: number | null;
}

interface Profile {
  tier: 'free' | 'pro';
  email: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      const supabase = createClient();
      supabase.from('driver_vehicles').select('*').eq('user_id', user.id).then(({ data }) => {
        if (data) setVehicles(data);
      });
      supabase.from('driver_profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
        if (data) setProfile(data);
      });
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
      setVehicles([...vehicles, data]);
      setShowAddVehicle(false);
      setYear(''); setMake(''); setModel(''); setMileage(''); setVin('');
    }
  };

  const removeVehicle = async (id: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('driver_vehicles').delete().eq('id', id).eq('user_id', user.id);
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const isPro = profile?.tier === 'pro';
  const maxVehicles = isPro ? 5 : 1;

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
            </div>
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
                    {v.mileage && <p className="text-[#6b6b80] text-sm">{v.mileage.toLocaleString()} miles</p>}
                  </div>
                </div>
                {vehicles.length > 1 && (
                  <button onClick={() => removeVehicle(v.id)} className="text-[#6b6b80] hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {showAddVehicle && (
            <div className="mt-3 p-4 rounded-xl bg-[#12121e] border border-[#2a2a3e] flex flex-col gap-3">
              <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
              <input type="text" placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
              <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
              <input type="number" placeholder="Mileage (optional)" value={mileage} onChange={(e) => setMileage(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
              <input type="text" placeholder="VIN (optional)" value={vin} onChange={(e) => setVin(e.target.value)} maxLength={17}
                className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
              <div className="flex gap-2">
                <button onClick={() => setShowAddVehicle(false)} className="flex-1 py-2 rounded-lg border border-[#2a2a3e] text-[#a0a0b8]">Cancel</button>
                <button onClick={addVehicle} className="flex-1 py-2 rounded-lg bg-[#FF6200] text-white font-semibold">Add Vehicle</button>
              </div>
            </div>
          )}

          {!isPro && vehicles.length >= 1 && (
            <p className="text-[#FF6200] text-sm mt-2">Upgrade to Pro for up to 5 vehicles</p>
          )}
        </section>

        {/* Actions */}
        <section>
          <h2 className="text-[#a0a0b8] text-sm font-semibold uppercase tracking-wider mb-3">Actions</h2>
          <div className="flex flex-col gap-3">
            {!isPro && (
              <button
                onClick={() => router.push('/upgrade')}
                className="w-full py-3 rounded-xl bg-[#FF6200] text-white font-semibold hover:bg-[#e55800]"
              >
                Upgrade to Pro
              </button>
            )}
            <button
              onClick={async () => { await signOut(); router.replace('/login'); }}
              className="w-full py-3 rounded-xl border border-[#2a2a3e] text-[#a0a0b8] hover:text-white hover:border-[#FF6200]"
            >
              Sign Out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
