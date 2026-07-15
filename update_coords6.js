const fs = require('fs');
const { execSync } = require('child_process');

const data = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));
const records = data[0].results;
const updates = [];

const coords = {
  '中華路二段': { lat: 24.1480, lon: 120.6796 },
  '三民路三段': { lat: 24.1524, lon: 120.6844 }
};

for (let i = 0; i < records.length; i++) {
  const rec = records[i];
  let addr = rec.address;
  if (addr.startsWith('北區')) addr = addr.substring(2);
  const match = addr.match(/(.+路.+段|.+街|.+路)/);
  if (match) {
    const street = match[1];
    if (coords[street]) {
      const lat = coords[street].lat + (Math.random() - 0.5) * 0.0005;
      const lon = coords[street].lon + (Math.random() - 0.5) * 0.0005;
      updates.push(`UPDATE rentals SET latitude = ${lat}, longitude = ${lon} WHERE id = '${rec.id}';`);
    }
  }
}

fs.writeFileSync('update_coords6.sql', updates.join('\n'));
console.log(`Generated ${updates.length} updates!`);

if (updates.length > 0) {
  execSync('npx wrangler d1 execute rental_db --remote --file=update_coords6.sql', { stdio: 'inherit' });
}
