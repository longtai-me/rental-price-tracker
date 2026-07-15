import re

with open('src/app/submit/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''          // If still fails, try just city + district
          if (!data || data.length === 0) {
            const fallbackQuery3 = `${selectedCity}${district}`;
            if (fallbackQuery3 !== query) {
              data = await fetchGeocode(fallbackQuery3);
            }
          }
        }
        }

        if (data && data.length > 0) {''', '''          // If still fails, try just city + district
          if (!data || data.length === 0) {
            const fallbackQuery3 = `${selectedCity}${district}`;
            if (fallbackQuery3 !== query) {
              data = await fetchGeocode(fallbackQuery3);
            }
          }
        }

        if (data && data.length > 0) {''')

with open('src/app/submit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

