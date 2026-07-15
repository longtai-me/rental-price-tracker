const fs = require('fs');
const { execSync } = require('child_process');

async function run() {
  const data = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));
  const records = data[0].results;
  const updates = [];
  
  console.log(`Found ${records.length} records to geocode...`);
  
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    let addr = rec.address;
    if (addr.startsWith('北區')) {
        addr = addr.substring(2);
    }
    
    // Original attempt with house number
    let query = "台中市北區" + addr.split('樓')[0].split('(')[0];
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=tw`;
      const res = await fetch(url, { headers: { 'User-Agent': 'RentalPriceTrackerBot/1.0' } });
      const json = await res.json();
      
      if (json && json.length > 0) {
        updates.push(`UPDATE rentals SET latitude = ${json[0].lat}, longitude = ${json[0].lon} WHERE id = '${rec.id}';`);
        console.log(`[${i+1}/${records.length}] Success: ${query} -> ${json[0].lat}, ${json[0].lon}`);
      } else {
        // Fallback: try JUST the street name (e.g. 台中市北區中華路二段)
        const streetMatch = query.match(/(.+路.+段|.+街|.+路)/);
        if (streetMatch) {
            const fallbackQuery = streetMatch[1]; // just the street part
            const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&limit=1&countrycodes=tw`;
            const fallbackRes = await fetch(fallbackUrl, { headers: { 'User-Agent': 'RentalPriceTrackerBot/1.0' } });
            const fallbackJson = await fallbackRes.json();
            if (fallbackJson && fallbackJson.length > 0) {
                // To avoid them being completely identical, add a tiny bit of random jitter, 
                // though the frontend spiral offset will also handle it.
                const lat = parseFloat(fallbackJson[0].lat) + (Math.random() - 0.5) * 0.0005;
                const lon = parseFloat(fallbackJson[0].lon) + (Math.random() - 0.5) * 0.0005;
                updates.push(`UPDATE rentals SET latitude = ${lat}, longitude = ${lon} WHERE id = '${rec.id}';`);
                console.log(`[${i+1}/${records.length}] Success (Street Fallback): ${fallbackQuery} -> ${lat}, ${lon}`);
            } else {
                console.log(`[${i+1}/${records.length}] Failed (Even with Street Fallback): ${query}`);
            }
        } else {
            console.log(`[${i+1}/${records.length}] Failed: ${query}`);
        }
      }
    } catch (e) {
      console.log(`[${i+1}/${records.length}] Error: ${query}`);
    }
    
    // Sleep 1s
    await new Promise(r => setTimeout(r, 1000));
  }
  
  fs.writeFileSync('update_coords5.sql', updates.join('\n'));
  console.log(`Generated ${updates.length} updates!`);
  
  // Execute SQL
  if (updates.length > 0) {
    execSync('npx wrangler d1 execute rental_db --remote --file=update_coords5.sql', { stdio: 'inherit' });
  }
}

run();
