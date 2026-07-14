const fs = require('fs');
const readline = require('readline');
const path = require('path');

/**
 * 內政部實價登錄 CSV 檔案解析腳本範例
 * 實價登錄檔案通常為 BIG5 或 UTF-8 編碼的 CSV。
 * 第一列通常為英文欄位，第二列為中文欄位，第三列開始為資料。
 */

async function parseCSV(filePath) {
  const results = [];
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  
  for await (const line of rl) {
    lineCount++;
    // Skip headers (Assuming first 2 rows are headers)
    if (lineCount <= 2) continue;

    const cols = line.split(',');
    
    // 範例欄位映射 (需依照實際內政部 CSV 格式調整)
    // 假設 0: 鄉鎮市區, 1: 交易標的, 2: 土地區段位置建物門牌, ...
    if (cols.length >= 10) {
      const data = {
        district: cols[0].replace(/"/g, ''),
        type: cols[1].replace(/"/g, ''),
        address: cols[2].replace(/"/g, ''),
        area: parseFloat(cols[3]),
        price: parseInt(cols[4], 10),
        // ... 其他欄位
      };
      results.push(data);
    }
  }

  console.log(`Parsed ${results.length} records.`);
  
  // 可以將解析後的結果存入資料庫或 JSON
  const outputPath = path.join(__dirname, '../src/data/parsedData.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Saved to ${outputPath}`);
}

// 執行範例
// parseCSV('./lvr_landcsv/A_lvr_land_c.csv');
console.log("此為解析政府開放資料的範例腳本。需下載實價登錄 CSV 檔案並取消下方註解後執行。");
