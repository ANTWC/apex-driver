'use client';

import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a14] px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1a1a2e] flex items-center justify-center border border-[#2a2a3e] mx-auto mb-6">
          <span className="text-4xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Check Your Email</h1>
        <p className="text-[#a0a0b8] mb-6">
          We sent you a confirmation link. Click it to activate your account, then come back and sign in.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 rounded-lg bg-[#FF6200] text-white font-semibold hover:bg-[#e55800] transition-colors"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
