import fs from 'fs';
import path from 'path';

const binPath = 'node_modules/.bin/next-on-pages';

if (fs.existsSync(binPath)) {
  const wrapper = `#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('--- WRAPPER: Running next-on-pages ---');
const realBin = path.resolve(__dirname, '../@cloudflare/next-on-pages/bin/index.js');
const result = spawnSync('node', [realBin, ...process.argv.slice(2)], { stdio: 'inherit' });

if (result.status === 0) {
  console.log('--- WRAPPER: Running fix-async-hooks.mjs ---');
  spawnSync('node', [path.resolve(process.cwd(), 'fix-async-hooks.mjs')], { stdio: 'inherit' });
}
process.exit(result.status || 0);
`;

  fs.writeFileSync(binPath, wrapper);
  fs.chmodSync(binPath, '755');
  console.log('Injected next-on-pages wrapper!');
}
