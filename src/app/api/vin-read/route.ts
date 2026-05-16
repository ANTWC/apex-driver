import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                text: 'Extract the 17-character Vehicle Identification Number (VIN) from this image. The VIN is usually printed on a label, stamped on metal, or displayed on a sticker. Return ONLY the 17 alphanumeric characters of the VIN, nothing else. VINs never contain the letters I, O, or Q. If you cannot find a clear 17-character VIN, respond with exactly: NOT_FOUND',
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini VIN read error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to process image. Please try again or enter VIN manually.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawText = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();

    if (rawText.includes('NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Could not read VIN from this photo. Try a clearer photo with good lighting, or enter the VIN manually.' },
        { status: 400 }
      );
    }

    const clean = rawText.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

    if (clean.length !== 17) {
      return NextResponse.json(
        { error: 'Could not read a complete 17-character VIN. Try a clearer photo or enter manually.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ vin: clean });
  } catch (error) {
    console.error('VIN read error:', error);
    return NextResponse.json(
      { error: 'Failed to process image. Please try again or enter VIN manually.' },
      { status: 500 }
    );
  }
}
