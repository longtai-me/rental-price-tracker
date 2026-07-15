import urllib.request
import urllib.parse
import json
import time
import subprocess
import os

print("Fetching records from DB...")
cmd = ['npx', 'wrangler', 'd1', 'execute', 'rental_db', '--remote', '--json', '--command', "SELECT id, address FROM rentals WHERE posterRole = 'government'"]
result = subprocess.run(cmd, capture_output=True, text=True)

if result.returncode != 0:
    print("Error fetching from DB:", result.stderr)
    exit(1)

try:
    output = result.stdout
    # Wrangler might output some log lines before the JSON array. We need to extract the JSON array.
    start_idx = output.find('[')
    if start_idx == -1:
        print("Could not find JSON output")
        exit(1)
    
    # parse the JSON
    import json
    data = json.loads(output[start_idx:])
    
    records = data[0]['results']
    print(f"Found {len(records)} records")
except Exception as e:
    print("Failed to parse json:", e)
    print("Raw stdout:", result.stdout)
    exit(1)

sql_statements = []

for rec in records:
    id_str = rec['id']
    address = rec['address']
    
    # query Nominatim
    query = f"台中市北區{address}"
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&limit=1&countrycodes=tw"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'RentalPriceTrackerBot/1.0'})
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            if res_data and len(res_data) > 0:
                lat = res_data[0]['lat']
                lon = res_data[0]['lon']
                print(f"Success: {address} -> {lat}, {lon}")
                sql_statements.append(f"UPDATE rentals SET latitude = {lat}, longitude = {lon} WHERE id = '{id_str}';")
            else:
                print(f"Failed to geocode: {address}")
    except Exception as e:
        print(f"Request error for {address}: {e}")
        
    time.sleep(1.2)  # Respect Nominatim limits

with open('update_coords.sql', 'w') as f:
    f.write('\n'.join(sql_statements))
    
print(f"Generated update_coords.sql with {len(sql_statements)} updates.")
