import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { recordAdminRequest, getClientIp } from '@/lib/adminAccessLog';

export const runtime = 'edge';

export interface Env {
  DB: any;
  ADMIN_PASSWORD?: string;
  REMOVE_PASSWORD?: string;
  SUPER_ADMIN_PASSWORD?: string;
  EDIT_PASSWORD?: string;
  EMAIL?: any;
  ADMIN_ALERT_TO_EMAIL?: string;
  ADMIN_ALERT_FROM_EMAIL?: string;
  ADMIN_ALERT_FROM_NAME?: string;
  ADMIN_REQUEST_ALERT_THRESHOLD?: string;
}

type Role = 'admin' | 'remove' | 'super' | 'edit' | null;

function getAuthRole(request: Request, env: Env | null): Role {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);

  if (env?.SUPER_ADMIN_PASSWORD && token === env.SUPER_ADMIN_PASSWORD) return 'super';
  if (env?.REMOVE_PASSWORD && token === env.REMOVE_PASSWORD) return 'remove';
  if (env?.EDIT_PASSWORD && token === env.EDIT_PASSWORD) return 'edit';
  if (env?.ADMIN_PASSWORD && token === env.ADMIN_PASSWORD) return 'admin';
  return null;
}

export async function GET(request: Request) {
  const env = getRequestContext().env as unknown as Env;
  await recordAdminRequest(request, env, '/api/admin/rentals');
  const role = getAuthRole(request, env);

  if (!role) {
    return NextResponse.json({ success: false, error: 'Unauthorized (Invalid Password)' }, { status: 401 });
  }

  if (!env || !env.DB) {
    return NextResponse.json({ success: false, error: 'DB not bound in Cloudflare Pages settings' }, { status: 500 });
  }

  try {
    const { results } = await env.DB.prepare(`SELECT * FROM rentals ORDER BY createdAt DESC`).all();
    const formattedResults = results.map((row: any) => ({
      ...row,
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
      electricityBillingType: row.electricityBillingType || (row.includesElectricity ? 'included' : 'taipower'),
      electricityPricePerKwh: row.electricityPricePerKwh,
      electricitySummerPricePerKwh: row.electricitySummerPricePerKwh,
      waterBillingType: row.waterBillingType || (row.includesWater ? 'included' : 'taiwater'),
      waterPricePerUnit: row.waterPricePerUnit,
      waterSummerPricePerUnit: row.waterSummerPricePerUnit,
      genderRestriction: row.genderRestriction === 'none' ? '不限' : (row.genderRestriction === 'female' ? '限女' : '限男')
    }));
    return NextResponse.json({ success: true, data: formattedResults });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `DB Query Error: ${err.message}` }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const env = getRequestContext().env as unknown as Env;
  await recordAdminRequest(request, env, '/api/admin/rentals');
  const role = getAuthRole(request, env);

  if (!role) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!env || !env.DB) {
    return NextResponse.json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  try {
    const { id, action } = await request.json() as any;
    if (!id || !action) return NextResponse.json({ success: false, error: 'ID and action are required' }, { status: 400 });

    let targetApprovedState = 0;

    if (action === 'approve') {
      if (role !== 'admin' && role !== 'super') {
         return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to approve' }, { status: 403 });
      }
      targetApprovedState = 1;
    } else if (action === 'reject') {
      if (role !== 'admin' && role !== 'super') {
         return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to reject' }, { status: 403 });
      }
      targetApprovedState = -1;
    } else if (action === 'remove') {
      if (role !== 'remove' && role !== 'super') {
         return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to remove' }, { status: 403 });
      }
      targetApprovedState = -1;
    } else if (action === 'unarchive') {
      if (role !== 'admin' && role !== 'super') {
         return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to unarchive' }, { status: 403 });
      }
      targetApprovedState = 0;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    await env.DB.prepare(`UPDATE rentals SET approved = ? WHERE id = ?`).bind(targetApprovedState, id).run();

    const ip = getClientIp(request);
    await env.DB.prepare(
      `INSERT INTO audit_logs (id, rentalId, action, role, ip) VALUES (?, ?, ?, ?, ?)`
    ).bind(crypto.randomUUID(), id, action, role, ip).run();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `DB Query Error: ${err.message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const env = getRequestContext().env as unknown as Env;
  await recordAdminRequest(request, env, '/api/admin/rentals');
  const role = getAuthRole(request, env);

  if (!role) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (role !== 'super') {
    return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions for hard delete' }, { status: 403 });
  }

  if (!env || !env.DB) {
    return NextResponse.json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  try {
    const { id } = await request.json() as any;
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO deleted_rentals (
          id, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude,
          includesWater, includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh,
          waterBillingType, waterPricePerUnit, waterSummerPricePerUnit,
          hasParking, genderRestriction, equipments, features, transports,
          hasElevator, canCook, hasBalcony, canMoveHuji, canPet, trashService, canSubsidize, approved, contractFile, posterRole, agencyFeeCharged, createdAt
        )
        SELECT 
          id, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude,
          includesWater, includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh,
          waterBillingType, waterPricePerUnit, waterSummerPricePerUnit,
          hasParking, genderRestriction, equipments, features, transports,
          hasElevator, canCook, hasBalcony, canMoveHuji, canPet, trashService, canSubsidize, approved, contractFile, posterRole, agencyFeeCharged, createdAt
        FROM rentals WHERE id = ?
      `).bind(id),
      env.DB.prepare(`DELETE FROM rentals WHERE id = ?`).bind(id),
      env.DB.prepare(`INSERT INTO audit_logs (id, rentalId, action, role, ip) VALUES (?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), id, 'delete', role, getClientIp(request))
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `DB Query Error: ${err.message}` }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const env = getRequestContext().env as unknown as Env;
  await recordAdminRequest(request, env, '/api/admin/rentals');
  const role = getAuthRole(request, env);

  if (!role) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (role !== 'edit' && role !== 'super') {
    return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to edit' }, { status: 403 });
  }

  if (!env || !env.DB) {
    return NextResponse.json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  try {
    const data = await request.json() as any;
    const { id, ...updateFields } = data;
    
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    const fieldsToUpdate = [];
    const valuesToBind = [];

    const allowedKeys = [
      'city', 'district', 'address', 'type', 'layout', 'area', 'floor', 'buildingAge', 'price', 
      'pricePerPyeong', 'includesWater', 'includesElectricity', 'hasParking', 'genderRestriction',
      'electricityBillingType', 'electricityPricePerKwh', 'electricitySummerPricePerKwh',
      'waterBillingType', 'waterPricePerUnit', 'waterSummerPricePerUnit',
      'equipments', 'features', 'transports', 'hasElevator', 'canCook', 'hasBalcony', 'canMoveHuji',
      'canPet', 'trashService', 'canSubsidize', 'posterRole', 'agencyFeeCharged',
      'latitude', 'longitude', 'startDate', 'leaseTerm', 'ghostStory',
      'badLandlord', 'evidenceLink'
    ];

    if (updateFields.pricePerPing !== undefined) {
      updateFields.pricePerPyeong = updateFields.pricePerPing;
    }
    if (Array.isArray(updateFields.equipment)) {
      updateFields.equipments = updateFields.equipment.join(',');
    }
    if (Array.isArray(updateFields.features)) {
      updateFields.features = updateFields.features.join(',');
    }
    if (Array.isArray(updateFields.transportation)) {
      updateFields.transports = updateFields.transportation.join(',');
    }
    if (updateFields.genderRestriction === '限女') updateFields.genderRestriction = 'female';
    else if (updateFields.genderRestriction === '限男') updateFields.genderRestriction = 'male';
    else if (updateFields.genderRestriction === '不限') updateFields.genderRestriction = 'none';

    const optionalNumberKeys = [
      'electricityPricePerKwh',
      'electricitySummerPricePerKwh',
      'waterPricePerUnit',
      'waterSummerPricePerUnit',
    ];
    for (const key of optionalNumberKeys) {
      if (updateFields[key] === '') updateFields[key] = null;
    }

    for (const key of allowedKeys) {
      if (updateFields[key] !== undefined) {
        fieldsToUpdate.push(`${key} = ?`);
        const val = updateFields[key];
        valuesToBind.push(typeof val === 'boolean' ? (val ? 1 : 0) : val);
      }
    }

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    valuesToBind.push(id);

    const ip = getClientIp(request);
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE rentals SET ${fieldsToUpdate.join(', ')} WHERE id = ?`
      ).bind(...valuesToBind),
      env.DB.prepare(
        `INSERT INTO audit_logs (id, rentalId, action, role, ip, details) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(crypto.randomUUID(), id, 'edit', role, ip, JSON.stringify(updateFields))
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `DB Update Error: ${err.message}` }, { status: 500 });
  }
}
