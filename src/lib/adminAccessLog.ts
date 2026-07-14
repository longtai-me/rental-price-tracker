export interface AdminLogEnv {
  DB?: any;
  EMAIL?: {
    send: (message: {
      to: string | string[];
      from: string | { email: string; name?: string };
      subject: string;
      html: string;
      text: string;
      replyTo?: string | string[];
    }) => Promise<{ messageId?: string }>;
  };
  ADMIN_ALERT_TO_EMAIL?: string;
  ADMIN_ALERT_FROM_EMAIL?: string;
  ADMIN_ALERT_FROM_NAME?: string;
  ADMIN_REQUEST_ALERT_THRESHOLD?: string;
}

const ALERT_WINDOW_HOURS = 1;
const DEFAULT_ALERT_THRESHOLD = 10;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );

  // 若使用者是透過 IPv6 連線，且 Cloudflare 有開啟 Pseudo IPv4 功能，這裡就能抓到 IPv4
  const pseudoIpv4 = request.headers.get('cf-pseudo-ipv4');
  if (pseudoIpv4 && pseudoIpv4 !== ip) {
    ip = `${ip} (IPv4: ${pseudoIpv4})`;
  }

  return ip;
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

function buildAdminAlertMessage(ip: string, path: string, count: number, threshold: number) {
  const subject = `[Rental Tracker] Admin request alert from ${ip}`;
  const text = [
    'Admin request threshold reached.',
    `IP: ${ip}`,
    `Path: ${path}`,
    `Requests in ${ALERT_WINDOW_HOURS} hour: ${count}`,
    `Configured threshold: ${threshold}`,
    `Triggered at: ${new Date().toISOString()}`,
  ].join('\n');
  const html = `
    <h1>Admin request threshold reached</h1>
    <p><strong>IP:</strong> ${ip}</p>
    <p><strong>Path:</strong> ${path}</p>
    <p><strong>Requests in ${ALERT_WINDOW_HOURS} hour:</strong> ${count}</p>
    <p><strong>Configured threshold:</strong> ${threshold}</p>
    <p><strong>Triggered at:</strong> ${new Date().toISOString()}</p>
  `;

  return { subject, text, html };
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
  if (!env.EMAIL || !env.ADMIN_ALERT_TO_EMAIL || !env.ADMIN_ALERT_FROM_EMAIL) return;

  const { subject, text, html } = buildAdminAlertMessage(ip, path, count, threshold);

  try {
    await env.EMAIL.send({
      to: env.ADMIN_ALERT_TO_EMAIL,
      from: {
        email: env.ADMIN_ALERT_FROM_EMAIL,
        name: env.ADMIN_ALERT_FROM_NAME || 'Rental Tracker Alert',
      },
      subject,
      html,
      text,
    });

    await env.DB.prepare(`UPDATE admin_access_logs SET notified = 1 WHERE id = ?`).bind(logId).run();
  } catch (error) {
    console.error('Failed to send admin alert email', error);
  }
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
