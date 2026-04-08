import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Admin bypass disabled — testing Stripe unlock flow as a regular user
// To re-enable: ['antcalhoun1@gmail.com']
const SUPER_ADMIN_EMAILS: string[] = [];

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  const authorized = SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '');
  return NextResponse.json({ authorized });
}
