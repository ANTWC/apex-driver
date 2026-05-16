import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan;

    // Issue #1: Validate plan input explicitly
    if (plan !== 'yearly' && plan !== 'monthly') {
      return NextResponse.json({ error: 'Invalid plan. Must be "yearly" or "monthly".' }, { status: 400 });
    }

    const priceId = plan === 'yearly'
      ? process.env.STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    // Issue #3: Block duplicate subscriptions — check if already Pro
    const serviceSupabase = getServiceSupabase();
    const { data: profile } = await serviceSupabase
      .from('driver_profiles')
      .select('tier, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (profile?.tier === 'pro') {
      return NextResponse.json({ error: 'You already have an active Pro subscription.' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripe = getStripe();

    // Issue #2 & #4: Reuse existing Stripe customer to prevent duplicates and infinite trials
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await serviceSupabase
        .from('driver_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Issue #4: Only grant trial if customer has never had a subscription
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
    });
    const isFirstSub = existingSubs.data.length === 0;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      subscription_data: {
        metadata: { user_id: user.id },
        ...(isFirstSub ? { trial_period_days: 7 } : {}),
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
