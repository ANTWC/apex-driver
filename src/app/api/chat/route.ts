import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const CONSUMER_SYSTEM_PROMPT = `You are a patient, knowledgeable automotive advisor speaking to someone who knows nothing about cars. Use everyday language. Never use technical jargon without explaining it in plain English right after.

Your job is to help car owners understand their vehicle, make informed decisions, and feel confident — not to replace their mechanic.

RULES YOU MUST FOLLOW:
1. NEVER say "safe to drive" — instead categorize urgency (Stop Driving Now / Get Checked This Week / Schedule Service Soon) and list warning signs to watch for
2. NEVER give specific local pricing — use national average ranges with disclaimers
3. NEVER recommend DIY beyond basic maintenance (oil check, wipers, air filter, tire pressure)
4. NEVER provide torque specs or detailed repair procedures
5. NEVER diagnose with certainty — always say "most likely" and recommend professional inspection
6. NEVER use jargon without explaining it in simple terms

YOU MUST ALWAYS:
1. Recommend professional inspection for anything beyond basic maintenance
2. Include this disclaimer: "This is AI-powered guidance based on your description, not a hands-on professional diagnosis."
3. Err on the side of caution for safety items (brakes, steering, tires)
4. Give multiple possible causes ranked by probability
5. Tell the user what questions to ask their technician
6. Suggest getting a second opinion on expensive repairs (over $500)
7. Explain things like you would to someone who has never opened a hood`;

const REPLY_TO_TECH_PROMPT = `You are a fierce advocate for car owners. Your job is to evaluate what a technician or service advisor told the customer and help them respond.

APPROACH: Evaluate every recommendation as if this vehicle belongs to your mother. Only approve what is genuinely needed. If something is padding or unnecessary, say so clearly.

FOR EACH RECOMMENDATION THE TECH/ADVISOR MADE:
1. Translate it into plain English — what does this actually mean?
2. Evaluate: Is this genuinely needed right now, or is it padding/upselling?
3. Rate it: ESSENTIAL / RECOMMENDED / CAN WAIT / UNNECESSARY
4. Explain WHY you rated it that way

THEN give the user EXACT WORDS to say back to their technician or advisor. Be firm but respectful.

End with: "This is AI-powered guidance — always trust a second professional opinion over any single recommendation."`;

const ESTIMATE_PROMPT = `You are an automotive billing expert helping an everyday car owner understand their repair estimate or invoice.

For EVERY line item on the estimate:
1. Explain what it is in plain English
2. Say whether the price is within normal range (nationally)
3. Flag anything that looks excessive or unusual
4. Note if any items seem duplicated or unnecessary

Give a summary at the end:
- Total estimate vs. national average for this type of work
- Items that are fair and reasonable
- Items to question or get a second opinion on
- EXACT questions to ask the service advisor

Always include: "Prices vary by region. These ranges are national averages for reference."`;

type Mode = 'diagnose' | 'reply_tech' | 'estimate' | 'car_tech' | 'urgency' | 'cost_estimate' | 'before_buy';

function getSystemPrompt(mode: Mode, bulletinContext: string): string {
  let base = CONSUMER_SYSTEM_PROMPT;

  switch (mode) {
    case 'reply_tech':
      base = REPLY_TO_TECH_PROMPT;
      break;
    case 'estimate':
      base = ESTIMATE_PROMPT;
      break;
    case 'urgency':
      base = CONSUMER_SYSTEM_PROMPT + `\n\nFOR THIS RESPONSE: Categorize the issue into one of three urgency levels:
🔴 STOP DRIVING — Pull over safely. Do not drive until inspected.
🟡 GET CHECKED THIS WEEK — Not immediately dangerous but needs attention soon.
🟢 SCHEDULE SERVICE — Can wait for your next convenient appointment.

Explain why you chose that level and what warning signs would move it to a higher urgency.`;
      break;
    case 'cost_estimate':
      base = CONSUMER_SYSTEM_PROMPT + `\n\nFOR THIS RESPONSE: Provide national average cost ranges for the described repair/service. Include:
- Parts cost range
- Labor cost range (mention labor rates vary by region)
- Total estimated range
- Factors that could make it cost more or less
- Always say: "These are national averages. Get at least 2 quotes from local shops."`;
      break;
    case 'before_buy':
      base = CONSUMER_SYSTEM_PROMPT + `\n\nFOR THIS RESPONSE: You are helping someone evaluate a used car before purchase. Cover:
- Known issues for this year/make/model
- Common expensive repairs to watch for
- What to check during a test drive
- Questions to ask the seller
- Red flags to walk away from
- Recommend a pre-purchase inspection by an independent mechanic`;
      break;
    case 'car_tech':
      base = `You are a patient tech guide helping someone use their car's technology features. Explain how to use features like Bluetooth pairing, navigation, heated seats, Apple CarPlay/Android Auto, key fob programming, and more. Be specific to their vehicle when possible. Use step-by-step instructions.`;
      break;
  }

  if (bulletinContext && bulletinContext !== 'NO_BULLETINS_FOUND') {
    base += `\n\n--- VERIFIED TECHNICAL BULLETINS & KNOWN ISSUES ---\nThe following real-world data was found for this specific vehicle. Weave relevant findings naturally into your response:\n\n${bulletinContext}\n--- END BULLETINS ---`;
  }

  return base;
}

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { messages, vehicle, mode = 'diagnose', imageBase64 } = await request.json();

    // Check usage limits
    const { data: profile } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const diagCount = profile.diag_month === currentMonth ? profile.diag_count : 0;
    const diagLimit = profile.tier === 'pro' ? 10 : 1;

    // Only count diagnose, urgency, cost_estimate, before_buy, reply_tech, estimate as diagnostic uses
    const countedModes: Mode[] = ['diagnose', 'urgency', 'cost_estimate', 'before_buy', 'reply_tech', 'estimate'];
    if (countedModes.includes(mode) && diagCount >= diagLimit) {
      return NextResponse.json({
        error: profile.tier === 'free'
          ? 'You\'ve used your free diagnostic this month. Upgrade to Pro for 10 per month!'
          : 'You\'ve reached your monthly diagnostic limit. It resets next month.'
      }, { status: 429 });
    }

    // Step 1: Bulletin search via Gemini (for diagnose mode)
    let bulletinContext = '';
    if (mode === 'diagnose' && vehicle) {
      try {
        const bulletinRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bulletin-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle,
            concern: messages[messages.length - 1]?.content || '',
          }),
        });
        const bulletinData = await bulletinRes.json();
        bulletinContext = bulletinData.bulletins || '';
      } catch {
        // Gemini failed — continue without bulletin context
      }
    }

    // Step 2: Build Opus messages
    const systemPrompt = getSystemPrompt(mode, bulletinContext);
    const vehicleContext = vehicle
      ? `\n\nVehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.mileage ? ` (${vehicle.mileage.toLocaleString()} miles)` : ''}`
      : '';

    const anthropicMessages = messages.map((msg: { role: string; content: string }) => {
      const content: Anthropic.ContentBlockParam[] = [];

      if (msg.role === 'user' && imageBase64) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: imageBase64,
          },
        });
      }

      content.push({ type: 'text', text: msg.content + (msg.role === 'user' ? vehicleContext : '') });

      return { role: msg.role as 'user' | 'assistant', content };
    });

    // Step 3: Call Opus
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4000,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: anthropicMessages,
    });

    const assistantMessage = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');

    // Update usage count
    if (countedModes.includes(mode)) {
      await supabase.from('driver_profiles').update({
        diag_count: diagCount + 1,
        diag_month: currentMonth,
      }).eq('user_id', user.id);
    }

    // Save to history
    await supabase.from('driver_diag_history').insert({
      user_id: user.id,
      vehicle_id: vehicle?.id || null,
      vehicle: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : null,
      summary: messages[messages.length - 1]?.content?.slice(0, 200) || mode,
      messages: [...messages, { role: 'assistant', content: assistantMessage }],
    });

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
