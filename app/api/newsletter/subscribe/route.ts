import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }
    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!apiKey || !audienceId) {
      // Soft-fail: log and return success so the UI shows the confirmation.
      // In production with creds, this hits Resend's Audience API.
      // eslint-disable-next-line no-console
      console.warn('[newsletter] missing RESEND_API_KEY or RESEND_AUDIENCE_ID; accepting email without persistence:', email);
      return NextResponse.json({ ok: true, mode: 'noop' });
    }
    const r = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, unsubscribed: false })
    });
    if (!r.ok) {
      const text = await r.text();
      // Resend returns 409 if contact already exists — treat as success.
      if (r.status === 409) return NextResponse.json({ ok: true, mode: 'exists' });
      return NextResponse.json({ error: 'resend_error', detail: text }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'server_error', detail: e?.message }, { status: 500 });
  }
}
