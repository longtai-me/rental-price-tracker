const fs = require('fs');

const data = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));
const records = data[0].results;
const streets = new Set();

for (let i = 0; i < records.length; i++) {
  const rec = records[i];
  let addr = rec.address;
  if (addr.startsWith('北區')) addr = addr.substring(2);
  const match = addr.match(/(.+路.+段|.+街|.+路)/);
  if (match) streets.add(match[1]);
}
console.log(Array.from(streets));
