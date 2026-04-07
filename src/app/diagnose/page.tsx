'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  mileage: number | null;
}

export default function DiagnosePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          if (data?.[0]) setVehicle(data[0]);
        });
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          mode: 'diagnose',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: data.error || 'Something went wrong. Please try again.',
        }]);
      } else {
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: data.message,
        }]);
      }
    } catch {
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: 'Unable to connect. Please check your internet and try again.',
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a14]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">What&apos;s Wrong?</h1>
            {vehicle && (
              <p className="text-[#6b6b80] text-xs">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-[#a0a0b8] text-lg mb-2">Describe what&apos;s happening with your car</p>
            <p className="text-[#6b6b80] text-sm">
              Be specific — noises, warning lights, when it happens, how long it&apos;s been going on
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
            <div
              className={`max-w-[85%] p-4 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-[#FF6200] text-white rounded-br-sm'
                  : 'bg-[#1a1a2e] text-white border border-[#2a2a3e] rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-4">
            <div className="max-w-[85%] p-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] rounded-bl-sm">
              <div className="flex items-center gap-2 text-[#a0a0b8]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing your concern...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="sticky bottom-0 bg-[#0a0a14] border-t border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Describe your issue..."
              className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-[#FF6200] text-white hover:bg-[#e55800] transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
