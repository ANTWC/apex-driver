'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import VehicleSelector from '@/components/VehicleSelector';
import type { Vehicle } from '@/components/VehicleSelector';
import { ArrowLeft, Send, Loader2, Camera, Lock, Car } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProFeatureChatProps {
  title: string;
  placeholder: string;
  mode: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  allowImage?: boolean;
}

export default function ProFeatureChat({
  title,
  placeholder,
  mode,
  emptyStateTitle,
  emptyStateDescription,
  allowImage,
}: ProFeatureChatProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tier, setTier] = useState<string>('free');
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) {
      const supabase = createClient();
      supabase.from('driver_profiles').select('tier').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setTier(data.tier); });
      fetch('/api/admin/check')
        .then(r => r.json())
        .then(d => setIsAdmin(d.authorized))
        .catch(() => {});
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          vehicle,
          mode,
          imageBase64: imageBase64,
        }),
      });

      const data = await res.json();
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: res.ok ? data.message : (data.error || 'Something went wrong.'),
      }]);
      setImageBase64(null);
    } catch {
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: 'Unable to connect. Please try again.',
      }]);
    }

    setLoading(false);
  };

  if (tier !== 'pro' && !isAdmin && !authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex flex-col">
        <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Lock className="w-12 h-12 text-[#FF6200] mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Pro Feature</h2>
          <p className="text-[#a0a0b8] mb-6">Upgrade to APEX Driver Pro to unlock {title}.</p>
          <button
            onClick={() => router.push('/upgrade')}
            className="px-8 py-3 rounded-xl bg-[#FF6200] text-white font-semibold hover:bg-[#e55800]"
          >
            Go Pro — $34.99/yr
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{title}</h1>
            {vehicle && <p className="text-[#6b6b80] text-xs">{vehicle.year} {vehicle.make} {vehicle.model}</p>}
          </div>
        </div>
      </header>

      {/* Vehicle Selector */}
      <div className="max-w-lg mx-auto w-full px-4 pt-3">
        <VehicleSelector selected={vehicle} onSelect={setVehicle} />
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 overflow-y-auto">
        {!vehicle && messages.length === 0 && (
          <div className="text-center mt-12">
            <Car className="w-12 h-12 text-[#6b6b80] mx-auto mb-3" />
            <p className="text-white font-semibold text-lg mb-1">Add Your Vehicle First</p>
            <p className="text-[#a0a0b8] text-sm mb-4">We need your vehicle info to give you accurate advice.</p>
            <button onClick={() => router.push('/settings')} className="px-6 py-2 rounded-lg bg-[#FF6200] text-white font-semibold">
              Add Vehicle
            </button>
          </div>
        )}
        {vehicle && messages.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-[#a0a0b8] text-lg mb-2">{emptyStateTitle}</p>
            <p className="text-[#6b6b80] text-sm">{emptyStateDescription}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
            <div className={`max-w-[85%] p-4 rounded-xl ${
              msg.role === 'user'
                ? 'bg-[#FF6200] text-white rounded-br-sm'
                : 'bg-[#1a1a2e] text-white border border-[#2a2a3e] rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-4">
            <div className="max-w-[85%] p-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] rounded-bl-sm">
              <div className="flex items-center gap-2 text-[#a0a0b8]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="sticky bottom-0 bg-[#0a0a14] border-t border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3">
          {imageBase64 && (
            <div className="mb-2 flex items-center gap-2 text-[#a0a0b8] text-sm">
              <Camera className="w-4 h-4" />
              <span>Image attached</span>
              <button onClick={() => setImageBase64(null)} className="text-red-400 text-xs">Remove</button>
            </div>
          )}
          <div className="flex gap-2">
            {allowImage && (
              <>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-[#a0a0b8] hover:text-white"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || !vehicle}
              className="px-4 py-3 rounded-xl bg-[#FF6200] text-white hover:bg-[#e55800] disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
