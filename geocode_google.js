const fs = require('fs');
const { execSync } = require('child_process');

async function run() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in environment variables.");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));
  const records = data[0].results;
  const updates = [];
  
  console.log(`Found ${records.length} records to geocode using Google Maps API...`);
  
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    let addr = rec.address;
    if (addr.startsWith('北區')) addr = addr.substring(2);
    
    // Exact address for Google Maps
    let query = "台中市北區" + addr.split('樓')[0].split('(')[0];
    
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.status === 'OK' && json.results && json.results.length > 0) {
        const location = json.results[0].geometry.location;
        updates.push(`UPDATE rentals SET latitude = ${location.lat}, longitude = ${location.lng} WHERE id = '${rec.id}';`);
        console.log(`[${i+1}/${records.length}] Success: ${query} -> ${location.lat}, ${location.lng}`);
      } else {
        console.log(`[${i+1}/${records.length}] Failed: ${query} - API returned ${json.status}`);
      }
    } catch (e) {
      console.log(`[${i+1}/${records.length}] Error: ${query} - ${e.message}`);
    }
  }
  
  fs.writeFileSync('update_coords_google.sql', updates.join('\n'));
  console.log(`Generated ${updates.length} updates!`);
  
  if (updates.length > 0) {
    console.log("Executing SQL...");
    execSync('npx wrangler d1 execute rental_db --remote --file=update_coords_google.sql', { stdio: 'inherit' });
    console.log("Done!");
  }
}

run();
