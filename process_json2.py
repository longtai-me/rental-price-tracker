import json
import urllib.request
import urllib.parse
import time
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

with open('db_dump.json', 'r') as f:
    content = f.read()

start_idx = content.find('[')
if start_idx != -1:
    content = content[start_idx:]

data = json.loads(content)
records = data[0]['results']

sql_statements = []

for rec in records:
    id_str = rec['id']
    address = rec['address']
    
    query = f"台中市北區{address}"
    query = query.split('樓')[0]
    query = query.split('(')[0]
    
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&limit=1&countrycodes=tw"
    req = urllib.request.Request(url, headers={'User-Agent': 'RentalPriceTrackerBot/1.0'})
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            if res_data and len(res_data) > 0:
                lat = res_data[0]['lat']
                lon = res_data[0]['lon']
                sql_statements.append(f"UPDATE rentals SET latitude = {lat}, longitude = {lon} WHERE id = '{id_str}';")
            else:
                pass
    except Exception as e:
        pass
        
    time.sleep(1.0)

with open('update_coords3.sql', 'w') as f:
    f.write('\n'.join(sql_statements))
    
print(f"Generated update_coords3.sql with {len(sql_statements)} updates.")
