import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { recordAdminRequest, type AdminLogEnv } from '@/lib/adminAccessLog';

export const runtime = 'edge';

export async function POST(request: Request) {
  const env = getRequestContext().env as unknown as AdminLogEnv;
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
