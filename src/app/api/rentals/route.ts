import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export interface Env {
  DB: any;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const maxPrice = searchParams.get('maxPrice');
  const minPrice = searchParams.get('minPrice');
  
  // High concurrency optimization: Edge caching
  const responseHeaders = {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  };

  try {
    const env = process.env.NODE_ENV === 'development' 
      ? null 
      : getRequestContext().env as unknown as Env;
      
    // In local development before wrangler is fully set up, we could fallback, 
    // but here we will try to query D1 directly if available.
    if (!env || !env.DB) {
      // Fallback for local `npm run dev` if D1 isn't bound yet.
      // In a real environment, you'd run `npx wrangler pages dev`
      return NextResponse.json({ 
        total: 0, 
        data: [],
        message: "D1 Database not bound. Run with wrangler pages dev."
      }, { headers: responseHeaders });
    }

    // Build dynamic SQL
    let sql = 'SELECT * FROM rentals WHERE 1=1';
    const params: any[] = [];

    if (city) {
      sql += ' AND city = ?';
      params.push(city);
    }
    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(Number(maxPrice));
    }
    
    // Note: To keep the example concise, we only added a few SQL conditions here.
    // The rest of the advanced filters can be implemented similarly with `AND ...`.

    const { results } = await env.DB.prepare(sql).bind(...params).all();

    // Convert booleans back to true/false (SQLite stores them as 0/1)
    const formattedData = results.map((row: any) => ({
      ...row,
      includesWater: Boolean(row.includesWater),
      includesElectricity: Boolean(row.includesElectricity),
      hasParking: Boolean(row.hasParking),
      hasElevator: Boolean(row.hasElevator),
      canCook: Boolean(row.canCook),
      hasBalcony: Boolean(row.hasBalcony),
      canMoveHuji: Boolean(row.canMoveHuji),
      canPet: Boolean(row.canPet),
      trashService: Boolean(row.trashService),
    }));

    return NextResponse.json({
      total: formattedData.length,
      data: formattedData
    }, { headers: responseHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
