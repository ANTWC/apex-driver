'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, FileText, Lock, Trash2, Upload } from 'lucide-react';

interface Document {
  id: string;
  doc_type: string;
  title: string;
  notes: string | null;
  created_at: string;
}

const DOC_TYPES = ['Insurance Card', 'Registration', 'Receipt', 'Warranty', 'Other'];

export default function GloveBoxPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [tier, setTier] = useState('free');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [docType, setDocType] = useState('Insurance Card');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) {
      const supabase = createClient();
      supabase.from('driver_profiles').select('tier').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setTier(data.tier); });
      fetch('/api/admin/check').then(r => r.json()).then(d => setIsAdmin(d.authorized)).catch(() => {});
      supabase.from('driver_glove_box').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setDocs(data); });
    }
  }, [user, authLoading, router]);

  const addDoc = async () => {
    if (!user || !title) return;
    const supabase = createClient();
    const { data } = await supabase.from('driver_glove_box').insert({
      user_id: user.id,
      doc_type: docType,
      title,
      notes: notes || null,
    }).select().single();
    if (data) {
      setDocs([data, ...docs]);
      setShowAdd(false);
      setTitle('');
      setNotes('');
    }
  };

  const removeDoc = async (id: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('driver_glove_box').delete().eq('id', id);
    setDocs(docs.filter(d => d.id !== id));
  };

  if (tier !== 'pro' && !isAdmin && !authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex flex-col">
        <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">My Glove Box</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Lock className="w-12 h-12 text-[#FF6200] mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Pro Feature</h2>
          <p className="text-[#a0a0b8] mb-6">Store your insurance, registration, and receipts digitally.</p>
          <button onClick={() => router.push('/upgrade')} className="px-8 py-3 rounded-xl bg-[#FF6200] text-white font-semibold">Go Pro — $34.99/yr</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/home')} className="text-[#a0a0b8] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">My Glove Box</h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 text-[#FF6200] font-semibold text-sm">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {showAdd && (
          <div className="mb-4 p-4 rounded-xl bg-[#12121e] border border-[#2a2a3e] flex flex-col gap-3">
            <select value={docType} onChange={(e) => setDocType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white focus:outline-none focus:border-[#FF6200]">
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200]" />
            <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#FF6200] resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg border border-[#2a2a3e] text-[#a0a0b8]">Cancel</button>
              <button onClick={addDoc} className="flex-1 py-2 rounded-lg bg-[#FF6200] text-white font-semibold">Save</button>
            </div>
          </div>
        )}

        {docs.length === 0 && !showAdd ? (
          <div className="text-center mt-12">
            <Upload className="w-12 h-12 text-[#6b6b80] mx-auto mb-3" />
            <p className="text-[#a0a0b8]">No documents yet</p>
            <p className="text-[#6b6b80] text-sm">Tap + to add your insurance, registration, or receipts.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e]">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#FF6200]" />
                  <div>
                    <p className="text-white font-semibold">{doc.title}</p>
                    <p className="text-[#6b6b80] text-sm">{doc.doc_type}</p>
                  </div>
                </div>
                <button onClick={() => removeDoc(doc.id)} className="text-[#6b6b80] hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
