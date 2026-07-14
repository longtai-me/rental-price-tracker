import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export interface Env {
  DB: any;
}

function verifyAuth(request: Request) {
  // If we are in local dev and no password is set, allow it for ease of development.
  // In a real app, you'd want to enforce it locally too.
  const authHeader = request.headers.get('Authorization');
  const expectedPassword = process.env.ADMIN_PASSWORD;
  
  if (expectedPassword && authHeader !== `Bearer ${expectedPassword}`) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  if (!verifyAuth(request)) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const env = process.env.NODE_ENV === 'development' 
    ? null 
    : getRequestContext().env as unknown as Env;

  if (!env || !env.DB) {
    return Response.json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  try {
    const { results } = await env.DB.prepare(`SELECT * FROM rentals WHERE approved = 0 ORDER BY createdAt DESC`).all();
    return Response.json({ success: true, data: results });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!verifyAuth(request)) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const env = process.env.NODE_ENV === 'development' 
    ? null 
    : getRequestContext().env as unknown as Env;

  if (!env || !env.DB) {
    return Response.json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  try {
    const { id } = await request.json() as any;
    if (!id) return Response.json({ success: false, error: 'ID is required' }, { status: 400 });

    await env.DB.prepare(`UPDATE rentals SET approved = 1 WHERE id = ?`).bind(id).run();
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!verifyAuth(request)) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const env = process.env.NODE_ENV === 'development' 
    ? null 
    : getRequestContext().env as unknown as Env;

  if (!env || !env.DB) {
    return Response.json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  try {
    const { id } = await request.json() as any;
    if (!id) return Response.json({ success: false, error: 'ID is required' }, { status: 400 });

    await env.DB.prepare(`DELETE FROM rentals WHERE id = ?`).bind(id).run();
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
