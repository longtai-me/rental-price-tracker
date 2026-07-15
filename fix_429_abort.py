import re

with open('src/app/submit/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Modify fetchGeocode to throw on 429
old_fetch = '''      const fetchGeocode = async (q: string) => {
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
      };'''

new_fetch = '''      const fetchGeocode = async (q: string) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=tw`,
          { headers: { 'User-Agent': 'rental-price-tracker/1.0' } }
        );
        if (res.status === 429) {
          throw new Error("RATE_LIMIT");
        }
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
      };'''

content = content.replace(old_fetch, new_fetch)

# Wait, if `fetch` itself is blocked by CORS because of 429, it throws a TypeError!
# When CORS blocks it, `res.ok` doesn't even exist, `fetch` throws a "Failed to fetch" TypeError.
# So we need to catch it and assume it might be a rate limit if it fails entirely.

