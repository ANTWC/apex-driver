'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, CheckCircle, Type } from 'lucide-react';

interface VinScannerProps {
  onDecoded: (data: {
    year: string;
    make: string;
    model: string;
    vin: string;
  }) => void;
}

export default function VinScanner({ onDecoded }: VinScannerProps) {
  const [mode, setMode] = useState<'choose' | 'photo' | 'manual'>('choose');
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result.split(',')[1]);
      setMode('photo');
    };
    reader.readAsDataURL(file);
  };

  const readVinFromPhoto = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/vin-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not read VIN from photo');
        setLoading(false);
        return;
      }

      setVin(data.vin);
      await decodeVin(data.vin);
    } catch {
      setError('Failed to read VIN. Try entering it manually.');
    }

    setLoading(false);
  };

  const decodeVin = async (vinValue: string) => {
    const clean = vinValue.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    if (clean.length !== 17) {
      setError('VIN must be exactly 17 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${clean}?format=json`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) throw new Error('NHTSA API error');

      const data = await res.json();
      const result = data.Results?.[0];
      if (!result) throw new Error('No decode results');

      const errorCode = result.ErrorCode || '';
      const hasErrors = errorCode.split(',').some((c: string) => {
        const code = c.trim();
        return code !== '0' && code !== '';
      });

      if (hasErrors && !result.Make && !result.Model) {
        throw new Error('Could not decode this VIN. Check that it is correct.');
      }

      const year = result.ModelYear || '';
      const make = result.Make || '';
      const model = result.Model || '';
      const summary = [year, make, model, result.Trim].filter(Boolean).join(' ');
      setSuccess(summary);
      onDecoded({ year, make, model, vin: clean });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'VIN decode failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17);
    setVin(val);
    setError('');
    setSuccess('');
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/30 border border-green-800/50">
        <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
        <span className="text-green-400 text-sm font-semibold">{success}</span>
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handlePhotoCapture}
        className="hidden"
      />

      {mode === 'choose' && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#222238]"
          >
            <Camera className="w-5 h-5 text-[#FF6200]" />
            Take Photo of VIN
          </button>
          <button
            onClick={() => setMode('manual')}
            className="w-full py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-[#a0a0b8] font-semibold flex items-center justify-center gap-2 hover:bg-[#222238]"
          >
            <Type className="w-5 h-5" />
            Type VIN Manually
          </button>
          <p className="text-[#6b6b80] text-xs text-center">Your VIN is on the driver&apos;s side dashboard or inside the driver&apos;s door jamb.</p>
        </div>
      )}

      {mode === 'photo' && (
        <div className="flex flex-col gap-3">
          {imagePreview && (
            <div className="rounded-lg overflow-hidden border border-[#2a2a3e]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="VIN photo" className="w-full max-h-48 object-cover" />
            </div>
          )}
          <button
            onClick={readVinFromPhoto}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#FF6200] text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Reading VIN...</> : 'Read VIN from Photo'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 rounded-lg border border-[#2a2a3e] text-[#a0a0b8] text-sm"
            >
              Retake
            </button>
            <button
              onClick={() => { setMode('manual'); setImagePreview(null); setImageBase64(null); }}
              className="flex-1 py-2 rounded-lg border border-[#2a2a3e] text-[#a0a0b8] text-sm"
            >
              Type Instead
            </button>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div className="flex flex-col gap-2">
          <input
            value={vin}
            onChange={handleManualInput}
            placeholder="17-character VIN"
            maxLength={17}
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] font-mono tracking-widest uppercase"
          />
          <p className="text-[#6b6b80] text-xs">Find your VIN on the driver&apos;s side dashboard or inside the driver&apos;s door jamb.</p>
          {vin.length === 17 && (
            <button
              onClick={() => decodeVin(vin)}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#FF6200] text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Decoding...</> : 'Decode VIN'}
            </button>
          )}
          <button
            onClick={() => setMode('choose')}
            className="text-[#a0a0b8] text-sm underline text-center"
          >
            Back
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
