import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if this OAuth user has a driver profile yet
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('driver_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) {
          // New OAuth user — create profile and send to vehicle step
          await supabase.from('driver_profiles').insert({
            user_id: user.id,
            email: user.email,
            tier: 'free',
            diag_count: 0,
            diag_month: new Date().toISOString().slice(0, 7),
          });

          try {
            await fetch(`${origin}/api/auth/welcome`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email }),
            });
          } catch {
            // Non-blocking
          }

          return NextResponse.redirect(`${origin}/signup?step=vehicle`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
