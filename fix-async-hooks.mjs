import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if(file.endsWith('.js')) results.push(file);
    }
  });
  return results;
}

const mockContent = `
export class AsyncLocalStorage {
  getStore() { return undefined; }
  run(store, callback, ...args) { return callback(...args); }
}
export default { AsyncLocalStorage };
`;

try {
  const files = walk('.vercel/output/static/_worker.js');
  for (const file of files) {
    if (file.endsWith('mock_async_hooks.js')) continue;

    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    if (content.includes('"async_hooks"') || content.includes('"node:async_hooks"')) {
      content = content.replace(/from\s*["']node:async_hooks["']/g, 'from "./mock_async_hooks.js"');
      content = content.replace(/from\s*["']async_hooks["']/g, 'from "./mock_async_hooks.js"');
      
      content = content.replace(/require\(\s*["']node:async_hooks["']\s*\)/g, 'require("./mock_async_hooks.js")');
      content = content.replace(/require\(\s*["']async_hooks["']\s*\)/g, 'require("./mock_async_hooks.js")');

      content = content.replace(/import\(\s*["']node:async_hooks["']\s*\)/g, 'import("./mock_async_hooks.js")');
      content = content.replace(/import\(\s*["']async_hooks["']\s*\)/g, 'import("./mock_async_hooks.js")');
      
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      
      const dir = path.dirname(file);
      const mockPath = path.join(dir, 'mock_async_hooks.js');
      if (!fs.existsSync(mockPath)) {
        fs.writeFileSync(mockPath, mockContent);
      }
      
      console.log(`Patched ${file} and added mock_async_hooks.js`);
    }
  }
  console.log("Successfully patched async_hooks with local mock!");
} catch (e) {
  console.error("Error patching async_hooks:", e);
}
