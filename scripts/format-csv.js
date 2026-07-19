const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function uuidv4() {
  return crypto.randomUUID();
}

const baseDir = 'cvs比對';
const outputDir = path.join(baseDir, 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const dirs = fs.readdirSync(baseDir).filter(d => d.startsWith('download'));

const allRows = ['id,Address,Response_Address,Response_X,Response_Y'];

for (const dir of dirs) {
  const dirPath = path.join(baseDir, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('_lvr_land_c.csv'));
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 4) continue;
    const header = lines[0].split(',');
    const addressIdx = header.indexOf('土地位置建物門牌');
    if (addressIdx === -1) {
      console.log('skip (no address column):', filePath);
      continue;
    }
    for (let i = 3; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const address = cols[addressIdx] || '';
      allRows.push([uuidv4(), address, '', '', ''].join(','));
    }
  }
}

const maxRowsPerFile = 10000; // 不含 header
const totalDataRows = allRows.length - 1;
const fileCount = Math.ceil(totalDataRows / maxRowsPerFile);

for (let i = 0; i < fileCount; i++) {
  const start = i * maxRowsPerFile + 1;
  const end = Math.min((i + 1) * maxRowsPerFile + 1, allRows.length);
  const chunk = [allRows[0], ...allRows.slice(start, end)];
  const outPath = path.join(outputDir, `merged_${String(i + 1).padStart(2, '0')}.csv`);
  fs.writeFileSync(outPath, chunk.join('\n'), 'utf8');
  console.log('written:', outPath, 'rows:', chunk.length - 1);
}

console.log('total data rows:', totalDataRows, 'files:', fileCount);
