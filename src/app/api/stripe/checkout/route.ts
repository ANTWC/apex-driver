import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { plan } = await request.json();
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: 'subscription',
      payment_method_types: ['card'],
      subscription_data: {
        trial_period_days: 7,
        metadata: { user_id: user.id },
      },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/home?upgraded=true`,
      cancel_url: `${appUrl}/upgrade`,
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 });
  }
}
