import { execSync } from 'child_process';
import fs from 'fs';

console.log("Fetching records from DB...");
const output = execSync('npx wrangler d1 execute rental_db --remote --json --command="SELECT id, latitude, longitude FROM rentals WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND latitude != 0 AND longitude != 0"', { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 50 });

const startIdx = output.indexOf('[');
if (startIdx === -1) {
  console.log("Could not find JSON output");
  process.exit(1);
}

const data = JSON.parse(output.slice(startIdx));
const records = data[0].results;

const coordCounts = new Map();
let updatesCount = 0;
let sql = '';

for (const item of records) {
  // Round to 5 decimal places to identify same coordinates more reliably
  const latStr = item.latitude.toFixed(5);
  const lngStr = item.longitude.toFixed(5);
  const coordKey = `${latStr},${lngStr}`;
  
  const count = coordCounts.get(coordKey) || 0;
  coordCounts.set(coordKey, count + 1);
  
  if (count > 0) {
    const angle = count * Math.PI / 4;
    const radius = 0.0001 + (Math.floor(count / 8) * 0.0001);
    const latOffset = Math.sin(angle) * radius;
    const lngOffset = Math.cos(angle) * radius;
    
    const newLat = item.latitude + latOffset;
    const newLng = item.longitude + lngOffset;
    
    sql += `UPDATE rentals SET latitude = ${newLat.toFixed(6)}, longitude = ${newLng.toFixed(6)} WHERE id = '${item.id}';\n`;
    updatesCount++;
  }
}

if (updatesCount > 0) {
  fs.writeFileSync('apply_spiral.sql', sql);
  console.log(`Generated ${updatesCount} updates. Applying...`);
  try {
      execSync("npx wrangler d1 execute rental_db --remote --file=apply_spiral.sql", { stdio: 'inherit' });
      console.log("Done!");
  } catch (err) {
      console.error("Failed to execute SQL:", err);
  }
} else {
  console.log("No duplicates found.");
}
