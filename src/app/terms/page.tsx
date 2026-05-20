import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Terms of Service — APEX Driver' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/home" className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 text-[#a0a0b8] text-sm leading-relaxed space-y-6">
        <p className="text-[#6b6b80] text-xs">Last updated: May 20, 2026</p>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Acceptance</h2>
          <p>By using APEX Driver, you agree to these terms. If you do not agree, do not use the app.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">The Service</h2>
          <p>APEX Driver provides AI-powered automotive guidance for everyday car owners. This includes diagnostic suggestions, maintenance reminders, recall information, and educational content.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Not Professional Advice</h2>
          <p>APEX Driver is an informational tool. Our AI-generated content is not a substitute for professional automotive diagnosis or repair by a qualified technician. Always consult a certified mechanic for safety-critical issues. We are not liable for any decisions made based on information provided by the app.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Accounts</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. One account per person.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Subscriptions</h2>
          <p>APEX Driver Pro is a recurring subscription billed monthly or annually. You can cancel anytime from Settings. Refunds are handled on a case-by-case basis. Free trial users are not charged until the trial period ends.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Usage Limits</h2>
          <p>Free accounts receive 1 AI diagnostic per month and can store up to 2 vehicles. Pro accounts receive 10 AI diagnostics per month and can store up to 5 vehicles.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Prohibited Use</h2>
          <p>Do not use APEX Driver to reverse-engineer our AI systems, scrape content, create competing products, or engage in any activity that violates applicable law.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Changes</h2>
          <p>We may update these terms. Continued use after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Contact</h2>
          <p>Questions? Email us at support@myapexdriver.com.</p>
        </section>
      </main>
    </div>
  );
}
