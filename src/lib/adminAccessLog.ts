export interface AdminLogEnv {
  DB?: any;
  DEVELOPER_WEBHOOK_URL?: string;
  ADMIN_REQUEST_ALERT_THRESHOLD?: string;
}

const ALERT_WINDOW_HOURS = 1;
const DEFAULT_ALERT_THRESHOLD = 10;

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

async function ensureAdminAccessLogTable(env: AdminLogEnv) {
  if (!env.DB) return;

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_access_logs (
      id TEXT PRIMARY KEY,
      ip TEXT NOT NULL,
      path TEXT NOT NULL,
      method TEXT NOT NULL,
      userAgent TEXT,
      requestCount INTEGER DEFAULT 1,
      notified BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

async function maybeNotifyDeveloper(env: AdminLogEnv, ip: string, path: string, count: number, logId: string) {
  const threshold = Number.parseInt(env.ADMIN_REQUEST_ALERT_THRESHOLD || '', 10) || DEFAULT_ALERT_THRESHOLD;
  if (count < threshold) return;

  const { results } = await env.DB.prepare(`
    SELECT id
    FROM admin_access_logs
    WHERE ip = ?
      AND notified = 1
      AND createdAt >= datetime('now', ?)
    LIMIT 1
  `).bind(ip, `-${ALERT_WINDOW_HOURS} hour`).all();

  if (results.length > 0) return;

  if (env.DEVELOPER_WEBHOOK_URL) {
    try {
      await fetch(env.DEVELOPER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin_request_threshold',
          message: `Admin request threshold reached: ${count} requests from ${ip} within ${ALERT_WINDOW_HOURS} hour.`,
          ip,
          path,
          count,
          windowHours: ALERT_WINDOW_HOURS,
          threshold,
          createdAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to notify developer', error);
    }
  }

  await env.DB.prepare(`UPDATE admin_access_logs SET notified = 1 WHERE id = ?`).bind(logId).run();
}

export async function recordAdminRequest(request: Request, env: AdminLogEnv | null, path: string) {
  if (!env?.DB) return;

  try {
    await ensureAdminAccessLogTable(env);

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    const id = crypto.randomUUID();

    await env.DB.prepare(`
      INSERT INTO admin_access_logs (id, ip, path, method, userAgent)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, ip, path, request.method, userAgent).run();

    const { results } = await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM admin_access_logs
      WHERE ip = ?
        AND createdAt >= datetime('now', ?)
    `).bind(ip, `-${ALERT_WINDOW_HOURS} hour`).all();

    const count = Number(results[0]?.count || 0);
    await maybeNotifyDeveloper(env, ip, path, count, id);
  } catch (error) {
    console.error('Failed to record admin access log', error);
  }
}
