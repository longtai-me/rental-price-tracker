import re

with open('src/app/submit/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Current logic:
# let data = await fetchGeocode(query);
# if (!data || data.length === 0) {
#   const roadMatch = address.match(/(.+?[路街大道段])/);
#   if (roadMatch) {
#     const fallbackQuery = `${selectedCity}${district}${roadMatch[1]}`;
#     if (fallbackQuery !== query) {
#       data = await fetchGeocode(fallbackQuery);
#     }
#   }
# }

new_logic = '''        let data = await fetchGeocode(query);
        
        // Fallback strategies for Taiwan addresses
        if (!data || data.length === 0) {
          const roadMatch = address.match(/(.+?[路街大道段])/);
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

# Replace the fallback logic
content = re.sub(
    r'let data = await fetchGeocode\(query\);\s*// Fallback.*?if \(!data \|\| data\.length === 0\) \{.*?const roadMatch = address\.match.*?\n.*?\n.*?\n.*?\n.*?\n\s*\}\n\s*\}',
    new_logic,
    content,
    flags=re.DOTALL
)

with open('src/app/submit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

