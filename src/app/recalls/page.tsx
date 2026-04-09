'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import VehicleSelector from '@/components/VehicleSelector';
import type { Vehicle } from '@/components/VehicleSelector';
import { ArrowLeft, Shield, Loader2, AlertTriangle, CheckCircle, Car } from 'lucide-react';

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
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [recalls, setRecalls] = useState<Recall[] | null>(null);
  const [checkedForId, setCheckedForId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
  }, [user, authLoading, router]);

  const checkRecalls = useCallback(async (v: Vehicle) => {
    setLoading(true);
    setRecalls(null);

    try {
      const res = await fetch(
        `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(v.make)}&model=${encodeURIComponent(v.model)}&modelYear=${v.year}`
      );
      const data = await res.json();
      setRecalls(data.results || []);
      setCheckedForId(v.id);
    } catch {
      setRecalls([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (vehicle && vehicle.id !== checkedForId) {
      checkRecalls(vehicle);
    }
  }, [vehicle, checkedForId, checkRecalls]);

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Recall Checker</h1>
            {vehicle && <p className="text-[#6b6b80] text-xs">{vehicle.year} {vehicle.make} {vehicle.model}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <VehicleSelector selected={vehicle} onSelect={setVehicle} />

        {!vehicle && !authLoading && (
          <div className="text-center mt-12">
            <Car className="w-12 h-12 text-[#6b6b80] mx-auto mb-3" />
            <p className="text-white font-semibold text-lg mb-1">Add Your Vehicle First</p>
            <p className="text-[#a0a0b8] text-sm mb-4">We need your vehicle info to check for safety recalls.</p>
            <button onClick={() => router.push('/settings')} className="px-6 py-2 rounded-lg bg-[#FF6200] text-white font-semibold">
              Add Vehicle
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center mt-8">
            <Loader2 className="w-8 h-8 text-[#FF6200] mx-auto mb-3 animate-spin" />
            <p className="text-[#a0a0b8]">Checking NHTSA database...</p>
          </div>
        )}

        {!loading && recalls !== null && (
          <div className="mt-4">
            {recalls.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h2 className="text-white font-bold text-xl mb-2">No Recalls Found</h2>
                <p className="text-[#a0a0b8]">
                  No open recalls found for your {vehicle?.year} {vehicle?.make} {vehicle?.model}. This checks the NHTSA database.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">{recalls.length} recall{recalls.length > 1 ? 's' : ''} found</span>
                </div>
                <p className="text-[#a0a0b8] text-sm">Contact your dealer — recall repairs are always free.</p>
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
