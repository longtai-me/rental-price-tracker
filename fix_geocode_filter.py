import re

with open('src/app/submit/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_fetch = '''      const fetchGeocode = async (q: string) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=tw`,
          { headers: { 'User-Agent': 'rental-price-tracker/1.0' } }
        );
        return await res.json() as any[];
      };'''

new_fetch = '''      const fetchGeocode = async (q: string) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=tw`,
          { headers: { 'User-Agent': 'rental-price-tracker/1.0' } }
        );
        const results = await res.json() as any[];
        
        if (district && results.length > 0) {
          const matched = results.find(r => r.display_name && r.display_name.includes(district));
          if (matched) return [matched];
          return [];
        }
        
        return results.length > 0 ? [results[0]] : [];
      };'''

content = content.replace(old_fetch, new_fetch)

with open('src/app/submit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

