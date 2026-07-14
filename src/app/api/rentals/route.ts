import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getClientIp } from '@/lib/adminAccessLog';

export const runtime = 'edge';

export interface Env {
  DB: any;
  R2_CONTRACTS?: any;
  TURNSTILE_SECRET_KEY?: string;
}

function parseOptionalNumber(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildUtilityBilling(row: any): string {
  const electricityType = row.electricityBillingType || (row.includesElectricity ? 'included' : 'taipower');
  const waterType = row.waterBillingType || (row.includesWater ? 'included' : 'taiwater');

  const electricityText = electricityType === 'included'
    ? '電費包含在房租中'
    : electricityType === 'taipower'
      ? '電費依台電價格'
      : `電費其他標準：${row.electricityPricePerKwh ?? '未填'} 元/度${row.electricitySummerPricePerKwh ? `，夏季 ${row.electricitySummerPricePerKwh} 元/度` : ''}`;

  const waterText = waterType === 'included'
    ? '水費包含在房租中'
    : waterType === 'taiwater'
      ? '水費依台水價格'
      : `水費其他標準：${row.waterPricePerUnit ?? '未填'} 元/度${row.waterSummerPricePerUnit ? `，夏季 ${row.waterSummerPricePerUnit} 元/度` : ''}`;

  return `${electricityText}；${waterText}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const maxPrice = searchParams.get('maxPrice');
    const minPrice = searchParams.get('minPrice');
    const location = searchParams.get('location');
    const roomCount = searchParams.get('roomCount');
    const rooms = searchParams.get('rooms');
    const hasElevator = searchParams.get('hasElevator');
    const canPet = searchParams.get('canPet');
    const hasParking = searchParams.get('hasParking');
    const type = searchParams.get('type');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');
    const needsSubsidize = searchParams.get('needsSubsidize');
    const needsHuji = searchParams.get('needsHuji');
    const includesWater = searchParams.get('includesWater');
    const includesElectricity = searchParams.get('includesElectricity');
    const utilityBillingType = searchParams.get('utilityBillingType');
    const maxElectricityPriceSummer = searchParams.get('maxElectricityPriceSummer');
    const maxElectricityPriceNonSummer = searchParams.get('maxElectricityPriceNonSummer');
    const maxWaterPrice = searchParams.get('maxWaterPrice');
    const transports = searchParams.get('transports');
    const equipment = searchParams.get('equipment');
    const features = searchParams.get('features');
    const genderRestriction = searchParams.get('genderRestriction');

    const env = getRequestContext().env as unknown as Env;

    if (!env || !env.DB) {
      return NextResponse.json({ 
        success: false,
        total: 0, 
        data: [],
        error: "D1 Database not bound. Make sure DB is bound in Cloudflare Pages."
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

    if (city && !location) {
      conditions.push(`city = ?`);
      queryParams.push(city);
    }

    if (minPrice) {
      conditions.push(`price >= ?`);
      queryParams.push(parseInt(minPrice));
    }
    if (maxPrice) {
      conditions.push(`price <= ?`);
      queryParams.push(parseInt(maxPrice));
    }

    if (type) {
      conditions.push(`type = ?`);
      queryParams.push(type);
    }

    if (minArea) {
      conditions.push(`area >= ?`);
      queryParams.push(parseFloat(minArea));
    }

    if (maxArea) {
      conditions.push(`area <= ?`);
      queryParams.push(parseFloat(maxArea));
    }

    const requestedRoomCount = roomCount || rooms;
    if (requestedRoomCount) {
      if (requestedRoomCount === '4+') {
        conditions.push(`(layout LIKE '4房%' OR layout LIKE '5房%' OR layout LIKE '6房%')`);
      } else {
        conditions.push(`layout LIKE ?`);
        queryParams.push(`${requestedRoomCount}房%`);
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
    if (needsSubsidize === 'true') {
      conditions.push(`canSubsidize = 1`);
    }
    if (needsHuji === 'true') {
      conditions.push(`canMoveHuji = 1`);
    }
    if (includesWater === 'true') {
      conditions.push(`includesWater = 1`);
    }
    if (includesElectricity === 'true') {
      conditions.push(`includesElectricity = 1`);
    }

    if (utilityBillingType === 'official') {
      conditions.push(`(electricityBillingType = 'taipower' OR waterBillingType = 'taiwater')`);
    } else if (utilityBillingType === 'non-official') {
      conditions.push(`(electricityBillingType = 'custom' OR waterBillingType = 'custom')`);
    }

    if (maxElectricityPriceNonSummer) {
      conditions.push(`(electricityPricePerKwh IS NULL OR electricityPricePerKwh <= ?)`);
      queryParams.push(parseFloat(maxElectricityPriceNonSummer));
    }
    if (maxElectricityPriceSummer) {
      conditions.push(`(electricitySummerPricePerKwh IS NULL OR electricitySummerPricePerKwh <= ?)`);
      queryParams.push(parseFloat(maxElectricityPriceSummer));
    }
    if (maxWaterPrice) {
      conditions.push(`(waterPricePerUnit IS NULL OR waterPricePerUnit <= ?)`);
      queryParams.push(parseFloat(maxWaterPrice));
    }

    if (transports) {
      for (const item of transports.split(',').filter(Boolean)) {
        conditions.push(`transports LIKE ?`);
        queryParams.push(`%${item}%`);
      }
    }
    if (equipment) {
      for (const item of equipment.split(',').filter(Boolean)) {
        conditions.push(`equipments LIKE ?`);
        queryParams.push(`%${item}%`);
      }
    }
    if (features) {
      for (const item of features.split(',').filter(Boolean)) {
        conditions.push(`features LIKE ?`);
        queryParams.push(`%${item}%`);
      }
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

    function privacyOffset(id: string, base: number, axis: 'lat' | 'lng'): number {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
      }
      const seed = axis === 'lat' ? hash : (hash >> 16) ^ hash;
      const maxDeg = axis === 'lat' ? 0.00076 : 0.00085;
      const offset = ((seed & 0xffff) / 0xffff - 0.5) * 2 * maxDeg;
      return base + offset;
    }

    const { results } = await env.DB.prepare(queryStr).bind(...queryParams).all();

    const formattedResults = results.map((row: any) => ({
      ...row,
      lat: row.latitude  ? privacyOffset(String(row.id), row.latitude,  'lat') : null,
      lng: row.longitude ? privacyOffset(String(row.id), row.longitude, 'lng') : null,
      transportation: row.transports ? row.transports.split(',') : [],
      equipment: row.equipments ? row.equipments.split(',') : [],
      features: row.features ? row.features.split(',') : [],
      pricePerPing: row.pricePerPyeong,
      hasElevator: Boolean(row.hasElevator),
      hasBalcony: Boolean(row.hasBalcony),
      canCook: Boolean(row.canCook),
      canMoveHuji: Boolean(row.canMoveHuji),
      canPet: Boolean(row.canPet),
      trashService: Boolean(row.trashService),
      canSubsidize: Boolean(row.canSubsidize),
      agencyFeeCharged: Boolean(row.agencyFeeCharged),
      badLandlord: Boolean(row.badLandlord),
      electricityBillingType: row.electricityBillingType || (row.includesElectricity ? 'included' : 'taipower'),
      electricityPricePerKwh: row.electricityPricePerKwh,
      electricitySummerPricePerKwh: row.electricitySummerPricePerKwh,
      waterBillingType: row.waterBillingType || (row.includesWater ? 'included' : 'taiwater'),
      waterPricePerUnit: row.waterPricePerUnit,
      waterSummerPricePerUnit: row.waterSummerPricePerUnit,
      utilityBilling: buildUtilityBilling(row),
      genderRestriction: row.genderRestriction === 'none' ? '不限' : (row.genderRestriction === 'female' ? '限女' : '限男')
    }));

    return NextResponse.json(
      { success: true, data: formattedResults },
      { 
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: [], error: err?.message || 'Failed to fetch rentals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const env = getRequestContext().env as Env;
  try {
    const formData = await request.formData();
    
    // Validate Turnstile
    const turnstileResponse = formData.get('cf-turnstile-response');
    if (env.TURNSTILE_SECRET_KEY) {
      if (!turnstileResponse) {
        return NextResponse.json({ success: false, error: '缺少機器人驗證 (Missing CAPTCHA)' }, { status: 403 });
      }
      const ip = getClientIp(request);
      const verifyData = new URLSearchParams();
      verifyData.append('secret', env.TURNSTILE_SECRET_KEY);
      verifyData.append('response', turnstileResponse as string);
      if (ip) verifyData.append('remoteip', ip);

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: verifyData,
      });
      const verifyJson = await verifyRes.json() as any;
      if (!verifyJson.success) {
        return NextResponse.json({ success: false, error: '機器人驗證失敗 (CAPTCHA failed)' }, { status: 403 });
      }
    }

    const newId = crypto.randomUUID();
    
    const body = Object.fromEntries(formData.entries()) as any;
    
    // File upload
    let contractFilename = null;
    const contractFile = formData.get('contractFile') as File | null;
    if (contractFile && contractFile.size > 0) {
      const ext = contractFile.name.split('.').pop();
      contractFilename = `${newId}.${ext}`;
      const arrayBuffer = await contractFile.arrayBuffer();
      // @ts-ignore
      await env.R2_CONTRACTS.put(contractFilename, arrayBuffer, {
        httpMetadata: { contentType: contractFile.type }
      });
    }

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
    const electricityBillingType = body.electricityBillingType || (body.includesElectricity ? 'included' : 'taipower');
    const waterBillingType = body.waterBillingType || (body.includesWater ? 'included' : 'taiwater');
    const includesWater = waterBillingType === 'included' ? 1 : ((body.includesWater === 'on' || body.includesWater === 'true') ? 1 : 0);
    const includesElectricity = electricityBillingType === 'included' ? 1 : ((body.includesElectricity === 'on' || body.includesElectricity === 'true') ? 1 : 0);
    const electricityPricePerKwh = parseOptionalNumber(body.electricityPricePerKwh);
    const electricitySummerPricePerKwh = parseOptionalNumber(body.electricitySummerPricePerKwh);
    const waterPricePerUnit = parseOptionalNumber(body.waterPricePerUnit);
    const waterSummerPricePerUnit = parseOptionalNumber(body.waterSummerPricePerUnit);
    const hasParking = (body.hasParking === 'on' || body.hasParking === 'true') ? 1 : 0;
    const genderRestriction = body.genderRestriction || 'none';
    const equipments = formData.getAll('equipments').join(',') || '';
    const featuresArr = formData.getAll('features').map(f => String(f));
    if (body.hasManager === 'on' || body.hasManager === 'true') {
      featuresArr.push('有管理員');
    }
    if (body.managementFee && body.managementFee.trim() !== '') {
      featuresArr.push(`管理費:${body.managementFee}`);
    }
    const features = featuresArr.join(',') || '';
    const transports = formData.getAll('transports').join(',') || '';
    const hasElevator = (body.hasElevator === 'on' || body.hasElevator === 'true') ? 1 : 0;
    const canCook = (body.canCook === 'on' || body.canCook === 'true') ? 1 : 0;
    const hasBalcony = (body.hasBalcony === 'on' || body.hasBalcony === 'true') ? 1 : 0;
    const canMoveHuji = (body.canMoveHuji === 'on' || body.canMoveHuji === 'true') ? 1 : 0;
    const canPet = (body.canPet === 'on' || body.canPet === 'true') ? 1 : 0;
    const trashService = (body.trashService === 'on' || body.trashService === 'true') ? 1 : 0;
    const canSubsidize = (body.canSubsidize === 'on' || body.canSubsidize === 'true') ? 1 : 0;
    const posterRole = body.posterRole || 'landlord';
    const agencyFeeCharged = (body.agencyFeeCharged === 'on' || body.agencyFeeCharged === 'true') ? 1 : 0;
    
    // New fields
    const startDate = body.startDate || null;
    const leaseTerm = parseOptionalNumber(body.leaseTerm);
    const ghostStory = body.ghostStory || null;
    const badLandlord = (body.badLandlord === 'on' || body.badLandlord === 'true') ? 1 : 0;
    const evidenceLink = body.evidenceLink || null;
    const contactEmail = body.contactEmail || null;

    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO rentals (
          id, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude,
          includesWater, includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh,
          waterBillingType, waterPricePerUnit, waterSummerPricePerUnit,
          hasParking, genderRestriction, equipments, features, transports,
          hasElevator, canCook, hasBalcony, canMoveHuji, canPet, trashService, canSubsidize, approved, contractFile, posterRole, agencyFeeCharged,
          startDate, leaseTerm, ghostStory, badLandlord, evidenceLink, contactEmail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        newId, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude,
        includesWater, includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh,
        waterBillingType, waterPricePerUnit, waterSummerPricePerUnit,
        hasParking, genderRestriction, equipments, features, transports,
        hasElevator, canCook, hasBalcony, canMoveHuji, canPet, trashService, canSubsidize, contractFilename, posterRole, agencyFeeCharged,
        startDate, leaseTerm, ghostStory, badLandlord, evidenceLink, contactEmail
      ),
      env.DB.prepare(
        `INSERT INTO audit_logs (id, rentalId, action, role, ip) VALUES (?, ?, ?, ?, ?)`
      ).bind(crypto.randomUUID(), newId, 'create', 'user', getClientIp(request))
    ]);

    return NextResponse.json({ success: true, message: '提交成功，請等候管理員審核。' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
