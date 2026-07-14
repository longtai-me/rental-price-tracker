import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export interface Env {
  DB: any;
}

export async function GET(request: Request) {
  try {
    const env = getRequestContext().env as unknown as Env;

    if (!env || !env.DB) {
      return NextResponse.json({ 
        success: false, 
        cities: [],
        error: "D1 Database not bound."
      });
    }

    const { results } = await env.DB.prepare(`SELECT DISTINCT city FROM rentals WHERE approved = 1 AND city IS NOT NULL AND city != ''`).all();
    const cities = results.map((r: any) => r.city).filter(Boolean);

    return Response.json(
      { success: true, cities },
      { 
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        cities: [],
        error: err?.message || 'Failed to fetch cities',
      },
      { status: 500 }
    );
  }
}
