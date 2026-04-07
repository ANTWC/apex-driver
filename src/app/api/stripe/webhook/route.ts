import { NextResponse } from 'next/server';
import Stripe from 'stripe';
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
  const stripe = getStripe();
  const supabase = getServiceSupabase();

  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabase.from('driver_profiles').update({
          tier: 'pro',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        }).eq('user_id', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;
      if (userId) {
        await supabase.from('driver_profiles').update({
          tier: 'free',
          stripe_subscription_id: null,
        }).eq('user_id', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;
      if (userId) {
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        await supabase.from('driver_profiles').update({
          tier: isActive ? 'pro' : 'free',
        }).eq('user_id', userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
