import json
import urllib.request
import urllib.parse
import time
import os

with open('db_dump.json', 'r') as f:
    content = f.read()

# Extract JSON
start_idx = content.find('[')
if start_idx != -1:
    content = content[start_idx:]

data = json.loads(content)
records = data[0]['results']
print(f"Found {len(records)} records")

sql_statements = []

for rec in records:
    id_str = rec['id']
    address = rec['address']
    
    # query Nominatim
    query = f"台中市北區{address}"
    # remove complex floor strings to improve success rate
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
                print(f"Success: {query} -> {lat}, {lon}")
                sql_statements.append(f"UPDATE rentals SET latitude = {lat}, longitude = {lon} WHERE id = '{id_str}';")
            else:
                print(f"Failed to geocode: {query}")
    except Exception as e:
        print(f"Request error for {query}: {e}")
        
    time.sleep(1.0)  # Respect Nominatim limits

with open('update_coords2.sql', 'w') as f:
    f.write('\n'.join(sql_statements))
    
print(f"Generated update_coords2.sql with {len(sql_statements)} updates.")
