import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export interface Env {
  DB: any;
  ADMIN_PASSWORD?: string;
  REMOVE_PASSWORD?: string;
  SUPER_ADMIN_PASSWORD?: string;
}

type Role = 'admin' | 'remove' | 'super' | null;

function getAuthRole(request: Request, env: Env | null): Role {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);

  if (env?.SUPER_ADMIN_PASSWORD && token === env.SUPER_ADMIN_PASSWORD) return 'super';
  if (env?.REMOVE_PASSWORD && token === env.REMOVE_PASSWORD) return 'remove';
  if (env?.ADMIN_PASSWORD && token === env.ADMIN_PASSWORD) return 'admin';
  return null;
}

export async function GET(request: Request) {
  const env = getRequestContext().env as unknown as Env;
  const role = getAuthRole(request, env);

  if (!role) {
    return Response.json({ success: false, error: 'Unauthorized (Invalid Password)' }, { status: 401 });
  }

  if (!env || !env.DB) {
    return Response.json({ success: false, error: 'DB not bound in Cloudflare Pages settings' }, { status: 500 });
  }

  try {
    const { results } = await env.DB.prepare(`SELECT * FROM rentals ORDER BY createdAt DESC`).all();
    return Response.json({ success: true, data: results });
  } catch (err: any) {
    return Response.json({ success: false, error: `DB Query Error: ${err.message}` }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const env = getRequestContext().env as unknown as Env;
  const role = getAuthRole(request, env);

  if (!role) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!env || !env.DB) {
    return Response.json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  try {
    const { id, action } = await request.json() as any;
    if (!id || !action) return Response.json({ success: false, error: 'ID and action are required' }, { status: 400 });

    let targetApprovedState = 0;

    if (action === 'approve') {
      if (role !== 'admin' && role !== 'super') {
         return Response.json({ success: false, error: 'Forbidden: Insufficient permissions to approve' }, { status: 403 });
      }
      targetApprovedState = 1;
    } else if (action === 'reject') {
      if (role !== 'admin' && role !== 'super') {
         return Response.json({ success: false, error: 'Forbidden: Insufficient permissions to reject' }, { status: 403 });
      }
      targetApprovedState = -1;
    } else if (action === 'remove') {
      if (role !== 'remove' && role !== 'super') {
         return Response.json({ success: false, error: 'Forbidden: Insufficient permissions to remove' }, { status: 403 });
      }
      targetApprovedState = -1;
    } else if (action === 'unarchive') {
      if (role !== 'admin' && role !== 'super') {
         return Response.json({ success: false, error: 'Forbidden: Insufficient permissions to unarchive' }, { status: 403 });
      }
      targetApprovedState = 0;
    } else {
      return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    await env.DB.prepare(`UPDATE rentals SET approved = ? WHERE id = ?`).bind(targetApprovedState, id).run();
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ success: false, error: `DB Query Error: ${err.message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const env = getRequestContext().env as unknown as Env;
  const role = getAuthRole(request, env);

  if (!role) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (role !== 'super') {
    return Response.json({ success: false, error: 'Forbidden: Insufficient permissions for hard delete' }, { status: 403 });
  }

  if (!env || !env.DB) {
    return Response.json({ success: false, error: 'DB not bound' }, { status: 500 });
  }

  try {
    const { id } = await request.json() as any;
    if (!id) return Response.json({ success: false, error: 'ID is required' }, { status: 400 });

    await env.DB.prepare(`DELETE FROM rentals WHERE id = ?`).bind(id).run();
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ success: false, error: `DB Query Error: ${err.message}` }, { status: 500 });
  }
}
