import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
          },
          {
            type: 'text',
            text: 'Extract the 17-character Vehicle Identification Number (VIN) from this image. The VIN is usually printed on a label, stamped on metal, or displayed on a sticker. Return ONLY the 17 alphanumeric characters of the VIN, nothing else. VINs never contain the letters I, O, or Q. If you cannot find a clear 17-character VIN, respond with exactly: NOT_FOUND',
          },
        ],
      }],
    });

    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

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
