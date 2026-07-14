import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export interface Env {
  R2_CONTRACTS: any;
}

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  const env = getRequestContext().env as unknown as Env;

  if (!env || !env.R2_CONTRACTS) {
    return new Response('R2 binding not found', { status: 500 });
  }

  const { key } = params;

  try {
    const object = await env.R2_CONTRACTS.get(key);

    if (object === null) {
      return new Response('File not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      headers,
    });
  } catch (err: any) {
    return new Response(`Error retrieving file: ${err.message}`, { status: 500 });
  }
}
