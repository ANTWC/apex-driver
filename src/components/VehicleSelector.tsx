'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { ChevronDown, Car } from 'lucide-react';

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  mileage: number | null;
  vin: string | null;
}

interface VehicleSelectorProps {
  onSelect: (vehicle: Vehicle) => void;
  selected?: Vehicle | null;
}

export default function VehicleSelector({ onSelect, selected }: VehicleSelectorProps) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('driver_vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setVehicles(data);
          if (!selected) onSelect(data[0]);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (vehicles.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#12121e] border border-[#2a2a3e] text-left"
      >
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-[#FF6200]" />
          <span className="text-white text-sm font-semibold">
            {selected ? `${selected.year} ${selected.make} ${selected.model}` : 'Select Vehicle'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#6b6b80] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden shadow-xl">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => { onSelect(v); setOpen(false); }}
              className={`w-full flex items-center gap-2 p-3 text-left hover:bg-[#222238] transition-colors ${
                selected?.id === v.id ? 'bg-[#222238]' : ''
              }`}
            >
              <Car className="w-4 h-4 text-[#FF6200]" />
              <div>
                <p className="text-white text-sm font-semibold">{v.year} {v.make} {v.model}</p>
                {v.mileage && <p className="text-[#6b6b80] text-xs">{v.mileage.toLocaleString()} mi</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
