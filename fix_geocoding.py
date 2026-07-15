import json
import asyncio
import aiohttp

API_KEY = "AIzaSyAnrQt0LTUggmOxxjU6x_kDEPsMYdi7Q6Q"
CONCURRENCY_LIMIT = 30

async def geocode_task(session, sem, record):
    address = record['city'] + record['address']
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}"
    
    async with sem:
        try:
            async with session.get(url, ssl=False) as response:
                data = await response.json()
                if data['status'] == 'OK':
                    location = data['results'][0]['geometry']['location']
                    return (record['id'], location['lat'], location['lng'])
                else:
                    return (record['id'], 0.0, 0.0)
        except Exception as e:
            print(f"Error for {address}: {e}")
            return (record['id'], 0.0, 0.0)

async def main():
    with open('batch3_needs_geocode.json', 'r', encoding='utf-8') as f:
        content = f.read()
        json_start = content.find('[')
        if json_start == -1:
            print("Could not find JSON array")
            return
        
        data = json.loads(content[json_start:])
            
    records = data[0]['results']
    print(f"Found {len(records)} records to geocode")

    sem = asyncio.Semaphore(CONCURRENCY_LIMIT)
    connector = aiohttp.TCPConnector(ssl=False)
    
    results = []
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [geocode_task(session, sem, r) for r in records]
        
        for i in range(0, len(tasks), 100):
            batch = tasks[i:i+100]
            batch_results = await asyncio.gather(*batch)
            results.extend(batch_results)
            print(f"Processed {len(results)} / {len(records)}")
            await asyncio.sleep(1) # Be nice to the API

    # Generate SQL file
    with open('update_batch3.sql', 'w', encoding='utf-8') as f:
        for r_id, lat, lng in results:
            if lat != 0.0 or lng != 0.0:
                f.write(f"UPDATE rentals SET latitude = {lat}, longitude = {lng}, approved = 1 WHERE id = '{r_id}';\n")
            else:
                f.write(f"UPDATE rentals SET approved = 1 WHERE id = '{r_id}';\n")

    print(f"Generated update_batch3.sql with updates.")

if __name__ == '__main__':
    asyncio.run(main())
