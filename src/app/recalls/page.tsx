'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Shield, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface Recall {
  NHTSACampaignNumber: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
}

export default function RecallsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [recalls, setRecalls] = useState<Recall[] | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
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
          if (data?.[0]) {
            setYear(String(data[0].year));
            setMake(data[0].make);
            setModel(data[0].model);
          }
        });
    }
  }, [user, authLoading, router]);

  const handleSearch = async () => {
    if (!year || !make || !model) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`
      );
      const data = await res.json();
      setRecalls(data.results || []);
    } catch {
      setRecalls([]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Recall Checker</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]"
          />
          <input
            type="text"
            placeholder="Make (e.g., Toyota)"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]"
          />
          <input
            type="text"
            placeholder="Model (e.g., Camry)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !year || !make || !model}
            className="w-full py-3 rounded-lg bg-[#FF6200] text-white font-semibold text-lg hover:bg-[#e55800] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
            {loading ? 'Checking...' : 'Check for Recalls'}
          </button>
        </div>

        {searched && recalls !== null && (
          <div>
            {recalls.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h2 className="text-white font-bold text-xl mb-2">No Recalls Found</h2>
                <p className="text-[#a0a0b8]">
                  No open recalls found for your {year} {make} {model}. This checks the NHTSA database.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">{recalls.length} recall{recalls.length > 1 ? 's' : ''} found</span>
                </div>
                {recalls.map((recall, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono">
                        {recall.NHTSACampaignNumber}
                      </span>
                      <span className="text-[#6b6b80] text-xs">{recall.ReportReceivedDate}</span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{recall.Component}</h3>
                    <p className="text-[#a0a0b8] text-sm mb-2">{recall.Summary}</p>
                    {recall.Consequence && (
                      <p className="text-red-400 text-sm mb-2">
                        <strong>Risk:</strong> {recall.Consequence}
                      </p>
                    )}
                    {recall.Remedy && (
                      <p className="text-green-400 text-sm">
                        <strong>Fix:</strong> {recall.Remedy}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
