var g={},f=(R,N,D)=>(g.__chunk_414=(M,h,p)=>{"use strict";p.d(h,{U:()=>I,r:()=>T});let o=1,_=10;function T(n){let e=n.headers.get("x-forwarded-for"),r=e?e.split(",")[0].trim():n.headers.get("cf-connecting-ip")||n.headers.get("x-real-ip")||"unknown",t=n.headers.get("cf-pseudo-ipv4");return t&&t!==r&&(r=`${r} (IPv4: ${t})`),r}async function m(n,e,r,t,d){let a=Number.parseInt(n.ADMIN_REQUEST_ALERT_THRESHOLD||"",10)||_;if(t<a)return;let{results:i}=await n.DB.prepare(`
    SELECT id
    FROM admin_access_logs
    WHERE ip = ?
      AND notified = 1
      AND createdAt >= datetime('now', ?)
    LIMIT 1
  `).bind(e,`-${o} hour`).all();if(i.length>0||!n.EMAIL||!n.ADMIN_ALERT_TO_EMAIL||!n.ADMIN_ALERT_FROM_EMAIL)return;let{subject:E,text:c,html:L}=function(s,u,A,l){return{subject:`[Rental Tracker] Admin request alert from ${s}`,text:["Admin request threshold reached.",`IP: ${s}`,`Path: ${u}`,`Requests in ${o} hour: ${A}`,`Configured threshold: ${l}`,`Triggered at: ${new Date().toISOString()}`].join(`
`),html:`
    <h1>Admin request threshold reached</h1>
    <p><strong>IP:</strong> ${s}</p>
    <p><strong>Path:</strong> ${u}</p>
    <p><strong>Requests in ${o} hour:</strong> ${A}</p>
    <p><strong>Configured threshold:</strong> ${l}</p>
    <p><strong>Triggered at:</strong> ${new Date().toISOString()}</p>
  `}}(e,r,t,a);try{await n.EMAIL.send({to:n.ADMIN_ALERT_TO_EMAIL,from:{email:n.ADMIN_ALERT_FROM_EMAIL,name:n.ADMIN_ALERT_FROM_NAME||"Rental Tracker Alert"},subject:E,html:L,text:c}),await n.DB.prepare("UPDATE admin_access_logs SET notified = 1 WHERE id = ?").bind(d).run()}catch(s){console.error("Failed to send admin alert email",s)}}async function I(n,e,r){if(e?.DB)try{await async function(c){c.DB&&await c.DB.prepare(`
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
  `).run()}(e);let t=T(n),d=n.headers.get("user-agent")||"",a=crypto.randomUUID();await e.DB.prepare(`
      INSERT INTO admin_access_logs (id, ip, path, method, userAgent)
      VALUES (?, ?, ?, ?, ?)
    `).bind(a,t,r,n.method,d).run();let{results:i}=await e.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM admin_access_logs
      WHERE ip = ?
        AND createdAt >= datetime('now', ?)
    `).bind(t,`-${o} hour`).all(),E=Number(i[0]?.count||0);await m(e,t,r,E,a)}catch(t){console.error("Failed to record admin access log",t)}}},g);export{f as __getNamedExports};
