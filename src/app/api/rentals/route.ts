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
  const location = searchParams.get('location');
  const roomCount = searchParams.get('roomCount');
  const hasElevator = searchParams.get('hasElevator');
  const canPet = searchParams.get('canPet');
  const hasParking = searchParams.get('hasParking');
  const genderRestriction = searchParams.get('genderRestriction');
  
  // High concurrency optimization: Edge caching
  const responseHeaders = {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  };

  const env = process.env.NODE_ENV === 'development' 
    ? null 
    : getRequestContext().env as unknown as Env;

  if (!env || !env.DB) {
    return NextResponse.json({ 
      total: 0, 
      data: [],
      message: "D1 Database not bound. Run with wrangler pages dev."
    });
  }

  let queryStr = `SELECT * FROM rentals WHERE approved = 1`;
  const queryParams: any[] = [];
  const conditions: string[] = [];

  // Parse location (format: City,District)
  if (location) {
    const [city, district] = location.split(',');
    if (city) {
      conditions.push(`city = ?`);
      queryParams.push(city);
    }
    if (district) {
      conditions.push(`district = ?`);
      queryParams.push(district);
    }
  }

  if (minPrice) {
    conditions.push(`price >= ?`);
    queryParams.push(parseInt(minPrice));
  }
  if (maxPrice) {
    conditions.push(`price <= ?`);
    queryParams.push(parseInt(maxPrice));
  }

  if (roomCount) {
    // Simple matching for room count, assuming layout starts with 'N房'
    if (roomCount === '4+') {
      conditions.push(`(layout LIKE '4房%' OR layout LIKE '5房%' OR layout LIKE '6房%')`);
    } else {
      conditions.push(`layout LIKE ?`);
      queryParams.push(`${roomCount}房%`);
    }
  }

  if (hasElevator === 'true') {
    conditions.push(`hasElevator = 1`);
  }
  if (canPet === 'true') {
    conditions.push(`canPet = 1`);
  }
  if (hasParking === 'true') {
    conditions.push(`hasParking = 1`);
  }

  if (genderRestriction && genderRestriction !== '不限') {
    if (genderRestriction === '限女') {
      conditions.push(`genderRestriction = 'female'`);
    } else if (genderRestriction === '限男') {
      conditions.push(`genderRestriction = 'male'`);
    } else {
      conditions.push(`genderRestriction = 'none'`);
    }
  }

  if (conditions.length > 0) {
    queryStr += ` AND ${conditions.join(' AND ')}`;
  }

  try {
    const { results } = await env.DB.prepare(queryStr).bind(...queryParams).all();
    
    return Response.json(
      { success: true, data: results },
      { 
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const env = getRequestContext().env as Env;
  try {
    const body = await request.json() as any;
    const newId = crypto.randomUUID();
    
    // Fallbacks and safe parsing
    const city = body.city || '';
    const district = body.district || '';
    const address = body.address || '';
    const type = body.type || '整層住家';
    const layout = body.layout || '1房1廳1衛';
    const area = parseFloat(body.area) || 0;
    const floor = body.floor || '1/1';
    const buildingAge = parseInt(body.buildingAge) || 0;
    const price = parseInt(body.price) || 0;
    const pricePerPyeong = area > 0 ? Math.round(price / area) : 0;
    const latitude = parseFloat(body.latitude) || 25.033;
    const longitude = parseFloat(body.longitude) || 121.564;
    const includesWater = body.includesWater ? 1 : 0;
    const includesElectricity = body.includesElectricity ? 1 : 0;
    const hasParking = body.hasParking ? 1 : 0;
    const genderRestriction = body.genderRestriction || 'none';
    const equipments = Array.isArray(body.equipments) ? body.equipments.join(',') : '';
    const features = Array.isArray(body.features) ? body.features.join(',') : '';
    const transports = Array.isArray(body.transports) ? body.transports.join(',') : '';
    const hasElevator = body.hasElevator ? 1 : 0;
    const canCook = body.canCook ? 1 : 0;
    const hasBalcony = body.hasBalcony ? 1 : 0;
    const canMoveHuji = body.canMoveHuji ? 1 : 0;
    const canPet = body.canPet ? 1 : 0;
    const trashService = body.trashService ? 1 : 0;
    // approved defaults to 0

    await env.DB.prepare(
      `INSERT INTO rentals (
        id, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude,
        includesWater, includesElectricity, hasParking, genderRestriction, equipments, features, transports,
        hasElevator, canCook, hasBalcony, canMoveHuji, canPet, trashService, approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    ).bind(
      newId, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude,
      includesWater, includesElectricity, hasParking, genderRestriction, equipments, features, transports,
      hasElevator, canCook, hasBalcony, canMoveHuji, canPet, trashService
    ).run();

    return Response.json({ success: true, message: '提交成功，請等候管理員審核。' });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
