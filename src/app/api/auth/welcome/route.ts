import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ ok: true }); // Skip if no key
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.WELCOME_EMAIL_FROM || 'AWC@awcconsultingservices.com',
      to: email,
      subject: 'Welcome to APEX Driver!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a14; color: #ffffff; padding: 32px; border-radius: 12px;">
          <h1 style="color: #FF6200; margin: 0 0 16px;">Welcome to APEX Driver!</h1>
          <p style="color: #a0a0b8; line-height: 1.6;">
            You now have a master technician in your pocket. Whether it's a warning light, a weird noise, or an estimate that doesn't look right — we've got you.
          </p>
          <p style="color: #a0a0b8; line-height: 1.6;">
            Your free account includes 1 AI diagnostic per month, plus unlimited access to Warning Lights, Recall Checker, Maintenance Schedules, and more.
          </p>
          <p style="color: #a0a0b8; line-height: 1.6; margin-top: 24px;">
            Drive safe,<br/>
            <strong style="color: #FF6200;">The APEX Driver Team</strong><br/>
            <span style="color: #6b6b80; font-size: 12px;">A.W.C. Consulting LLC</span>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Non-blocking
  }
}
