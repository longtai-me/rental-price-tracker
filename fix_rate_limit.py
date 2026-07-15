import re

with open('src/app/submit/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update fetchGeocode to handle HTTP errors and JSON parse errors
old_fetch = '''      const fetchGeocode = async (q: string) => {
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

new_fetch = '''      const fetchGeocode = async (q: string) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=tw`,
          { headers: { 'User-Agent': 'rental-price-tracker/1.0' } }
        );
        if (!res.ok) {
          console.error("Geocoding API error:", res.status);
          return [];
        }
        try {
          const text = await res.text();
          if (!text) return [];
          const results = JSON.parse(text) as any[];
          
          if (district && results.length > 0) {
            const matched = results.find(r => r.display_name && r.display_name.includes(district));
            if (matched) return [matched];
            return [];
          }
          
          return results.length > 0 ? [results[0]] : [];
        } catch (e) {
          console.error("Geocoding parse error:", e);
          return [];
        }
      };
      
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));'''

content = content.replace(old_fetch, new_fetch)

# 2. Add sleep to fallbacks
old_fallback = '''        // Fallback strategies for Taiwan addresses
        if (!data || data.length === 0) {
          const roadMatch = address.match(/(.+?(?:路|街|大道)(?:[一二三四五六七八九十0-9]+段)?)/);
          if (roadMatch) {
            // Try city + district + road
            const fallbackQuery1 = `${selectedCity}${district}${roadMatch[1]}`;
            if (fallbackQuery1 !== query) {
              data = await fetchGeocode(fallbackQuery1);
            }
            // Try city + road (Nominatim sometimes fails with district)
            if (!data || data.length === 0) {
              const fallbackQuery2 = `${selectedCity}${roadMatch[1]}`;
              if (fallbackQuery2 !== fallbackQuery1 && fallbackQuery2 !== query) {
                data = await fetchGeocode(fallbackQuery2);
              }
            }
          }
          // If still fails, try just city + district
          if (!data || data.length === 0) {
            const fallbackQuery3 = `${selectedCity}${district}`;
            if (fallbackQuery3 !== query) {
              data = await fetchGeocode(fallbackQuery3);
            }
          }
        }'''

new_fallback = '''        // Fallback strategies for Taiwan addresses
        if (!data || data.length === 0) {
          const roadMatch = address.match(/(.+?(?:路|街|大道)(?:[一二三四五六七八九十0-9]+段)?)/);
          if (roadMatch) {
            // Try city + district + road
            const fallbackQuery1 = `${selectedCity}${district}${roadMatch[1]}`;
            if (fallbackQuery1 !== query) {
              await sleep(1000); // Prevent rate limiting (max 1 req/sec)
              data = await fetchGeocode(fallbackQuery1);
            }
            // Try city + road (Nominatim sometimes fails with district)
            if (!data || data.length === 0) {
              const fallbackQuery2 = `${selectedCity}${roadMatch[1]}`;
              if (fallbackQuery2 !== fallbackQuery1 && fallbackQuery2 !== query) {
                await sleep(1000); // Prevent rate limiting
                data = await fetchGeocode(fallbackQuery2);
              }
            }
          }
          // If still fails, try just city + district
          if (!data || data.length === 0) {
            const fallbackQuery3 = `${selectedCity}${district}`;
            if (fallbackQuery3 !== query) {
              await sleep(1000); // Prevent rate limiting
              data = await fetchGeocode(fallbackQuery3);
            }
          }
        }'''

content = content.replace(old_fallback, new_fallback)

# 3. Change debounce from 600 to 1200
content = content.replace("geocodeTimerRef.current = setTimeout(async () => {", "geocodeTimerRef.current = setTimeout(async () => {")
content = content.replace("    }, 600);", "    }, 1500);")

with open('src/app/submit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

