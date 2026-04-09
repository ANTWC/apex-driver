'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import VinScanner from '@/components/VinScanner';

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'account' | 'vehicle'>('account');

  useEffect(() => {
    if (searchParams.get('step') === 'vehicle') {
      setStep('vehicle');
    }
  }, [searchParams]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Vehicle fields
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [useVinScanner, setUseVinScanner] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      if (authError.message.includes('already') || authError.message.includes('exists')) {
        setError('An account with this email already exists. Please sign in instead — your existing login works here too.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep('vehicle');
  };

  const handleVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!year || !make || !model) {
      setError('Year, make, and model are required.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // User needs to confirm email first
      router.replace('/check-email');
      return;
    }

    // Create driver profile
    await supabase.from('driver_profiles').upsert({
      user_id: user.id,
      email: user.email,
      tier: 'free',
      diag_count: 0,
      diag_month: new Date().toISOString().slice(0, 7),
    });

    // Add vehicle
    await supabase.from('driver_vehicles').insert({
      user_id: user.id,
      year: parseInt(year),
      make,
      model,
      mileage: mileage ? parseInt(mileage) : null,
      vin: vin || null,
    });

    // Send welcome email
    try {
      await fetch('/api/auth/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
    } catch {
      // Non-blocking
    }

    setLoading(false);
    router.replace('/home');
  };

  if (step === 'vehicle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a14] px-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-2">Add Your Vehicle</h2>
          <p className="text-[#a0a0b8] mb-6">Tell us about your car so we can give you accurate advice.</p>

          {/* VIN Scanner toggle */}
          <div className="flex gap-2 mb-2">
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
            <div className="flex flex-col gap-4">
              <VinScanner onDecoded={(data) => {
                setYear(data.year);
                setMake(data.make);
                setModel(data.model);
                setVin(data.vin);
                setUseVinScanner(false);
              }} />
            </div>
          ) : (
            <form onSubmit={handleVehicle} className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Year (e.g., 2020)"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
                required
              />
              <input
                type="text"
                placeholder="Make (e.g., Toyota)"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
                required
              />
              <input
                type="text"
                placeholder="Model (e.g., Camry)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
                required
              />
              <input
                type="number"
                placeholder="Mileage (optional)"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
              />
              <input
                type="text"
                placeholder="VIN (optional)"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
                maxLength={17}
              />

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#FF6200] text-white font-semibold text-lg hover:bg-[#e55800] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a14] px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/apex-driver-icon.png"
            alt="APEX Driver"
            width={96}
            height={96}
            className="rounded-2xl mb-4"
          />
          <h1 className="text-2xl font-bold text-white">
            Create Your <span className="text-[#FF6200]">Free</span> Account
          </h1>
          <p className="text-[#a0a0b8] mt-1">No credit card required</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#FF6200] text-white font-semibold text-lg hover:bg-[#e55800] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up Free'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#a0a0b8]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF6200] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
