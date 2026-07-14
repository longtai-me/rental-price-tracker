import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getClientIp, recordAdminRequest, type AdminLogEnv } from '@/lib/adminAccessLog';

export const runtime = 'edge';

export async function POST(request: Request) {
  const env = getRequestContext().env as unknown as AdminLogEnv;
  
  try {
    const body = await request.json() as any;
    if (body?.honeypot && env.DB) {
      const ip = getClientIp(request);
      await env.DB.prepare(
        `INSERT INTO audit_logs (id, rentalId, action, role, ip) VALUES (?, ?, ?, ?, ?)`
      ).bind(crypto.randomUUID(), 'HONEYPOT', 'honeypot_login_attempt', 'attacker', ip).run();
    }
  } catch (e) {
    // Ignore JSON parsing errors for standard access logs without body
  }

  await recordAdminRequest(request, env, '/admin');

  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
