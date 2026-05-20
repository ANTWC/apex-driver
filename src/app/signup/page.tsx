'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';


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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const router = useRouter();

  // Vehicle fields
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/signup?step=vehicle`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setAppleLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/signup?step=vehicle`,
      },
    });
    if (error) {
      setError(error.message);
      setAppleLoading(false);
    }
  };

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
              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#FF6200] text-white font-semibold text-lg hover:bg-[#e55800] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </form>
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

        {/* OAuth buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full py-3 rounded-lg bg-white text-[#333] font-semibold text-base flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <button
            onClick={handleAppleSignup}
            disabled={appleLoading}
            className="w-full py-3 rounded-lg bg-white text-[#333] font-semibold text-base flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {appleLoading ? 'Connecting...' : 'Continue with Apple'}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#2a2a3e]" />
          <span className="text-[#6b6b80] text-sm">or</span>
          <div className="flex-1 h-px bg-[#2a2a3e]" />
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
