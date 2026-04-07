'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        setError('Please check your email to confirm your account before logging in.');
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
      return;
    }

    router.replace('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a14] px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#1a1a2e] flex items-center justify-center border border-[#2a2a3e] mb-4">
            <span className="text-4xl">🦍</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            APEX <span className="text-[#FF6200]">Driver</span>
          </h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#FF6200] text-white font-semibold text-lg hover:bg-[#e55800] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#a0a0b8]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#FF6200] font-semibold hover:underline">
              Sign Up Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
