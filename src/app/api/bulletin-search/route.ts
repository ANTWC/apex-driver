import { NextResponse } from 'next/server';

const GEMINI_TIMEOUT = 5000;

export async function POST(request: Request) {
  try {
    const { vehicle, concern } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ bulletins: 'NO_BULLETINS_FOUND' });
    }

    const vehicleStr = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    // Guard against non-automotive queries
    const automotiveTerms = ['car', 'vehicle', 'engine', 'transmission', 'brake', 'noise', 'light', 'warning', 'oil', 'tire', 'battery', 'ac', 'heat', 'steer', 'shake', 'vibrat', 'leak', 'smell', 'start', 'idle', 'stall', 'check engine'];
    const lowerConcern = concern.toLowerCase();
    const isAutomotive = automotiveTerms.some(term => lowerConcern.includes(term)) || vehicleStr.length > 5;

    if (!isAutomotive) {
      return NextResponse.json({ bulletins: 'NO_BULLETINS_FOUND' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Search for Technical Service Bulletins (TSBs), safety recalls, NHTSA complaints, and known issues for: ${vehicleStr} related to: ${concern}

Return ONLY factual, verifiable information. Include:
- TSB numbers and descriptions
- NHTSA complaint counts if available
- Known common issues for this specific vehicle
- Any relevant recalls

If you find nothing specific, say NO_BULLETINS_FOUND.`
            }]
          }],
          tools: [{
            google_search: {}
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          }
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ bulletins: 'NO_BULLETINS_FOUND' });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'NO_BULLETINS_FOUND';

    return NextResponse.json({ bulletins: text });
  } catch {
    // Timeout or error — return gracefully
    return NextResponse.json({ bulletins: 'NO_BULLETINS_FOUND' });
  }
}
