import asyncio
import aiohttp

API_KEY = "AIzaSyAZqSGmFJ3t0pKD1x7BPVFB5eJ6Bi1Kmyo"

async def geocode_address(address, city):
    full_address = f"{city}{address}"
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={full_address}&key={API_KEY}"
    
    connector = aiohttp.TCPConnector(ssl=False)
    headers = {
        'Referer': 'http://localhost:3000/'
    }
    async with aiohttp.ClientSession(connector=connector, headers=headers) as session:
        try:
            async with session.get(url) as response:
                data = await response.json()
                print(f"Data with localhost:3000: {data['status']}")
        except Exception as e:
            print(f"Exception: {e}")

    headers = {
        'Referer': 'https://rental-price-tracker.vercel.app/'
    }
    async with aiohttp.ClientSession(connector=connector, headers=headers) as session:
        try:
            async with session.get(url) as response:
                data = await response.json()
                print(f"Data with vercel domain: {data['status']}")
                if data['status'] == 'OK':
                    print(data['results'][0]['geometry']['location'])
        except Exception as e:
            print(f"Exception: {e}")

asyncio.run(geocode_address("西屯區福上巷235弄16號", "台中市"))
