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

try {
  const files = walk('.vercel/output/static/_worker.js/__next-on-pages-dist__');
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Replace import "async_hooks" with import "node:async_hooks"
    if (content.includes('"async_hooks"')) {
      content = content.replace(/from\s*["']async_hooks["']/g, 'from "node:async_hooks"');
      content = content.replace(/require\(\s*["']async_hooks["']\s*\)/g, 'require("node:async_hooks")');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`Patched ${file}`);
    }
  }
  console.log("Successfully patched async_hooks to node:async_hooks");
} catch (e) {
  console.error("Error patching async_hooks:", e);
}
