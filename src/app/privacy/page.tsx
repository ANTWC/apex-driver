import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — APEX Driver' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/home" className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 text-[#a0a0b8] text-sm leading-relaxed space-y-6">
        <p className="text-[#6b6b80] text-xs">Last updated: May 20, 2026</p>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">What We Collect</h2>
          <p>When you create an account, we collect your email address and password (hashed). When you add a vehicle, we store its year, make, model, and mileage. When you use AI diagnostics, we store your conversation history to improve your experience.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">How We Use Your Data</h2>
          <p>Your data is used to provide personalized automotive guidance, maintain your vehicle records, and process your subscription. We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Third-Party Services</h2>
          <p>We use Supabase for authentication and data storage, Stripe for payment processing, Google Gemini for AI diagnostics, and Resend for transactional emails. Each service processes only the data necessary for its function.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Data Security</h2>
          <p>All data is transmitted over HTTPS. Passwords are hashed using industry-standard algorithms. Payment information is handled entirely by Stripe and never touches our servers.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Your Rights</h2>
          <p>You can delete your account and all associated data at any time from Settings. You can export your vehicle and diagnostic data by contacting us. If you are a California resident, you have additional rights under the CCPA.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Cookies</h2>
          <p>We use essential cookies for authentication. We do not use advertising or tracking cookies.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Children</h2>
          <p>APEX Driver is not intended for children under 13. We do not knowingly collect data from children.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Contact</h2>
          <p>Questions about this policy? Email us at support@myapexdriver.com.</p>
        </section>
      </main>
    </div>
  );
}
