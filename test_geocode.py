import asyncio
import aiohttp

API_KEY = "AIzaSyAZqSGmFJ3t0pKD1x7BPVFB5eJ6Bi1Kmyo"

async def geocode_address(address, city):
    full_address = f"{city}{address}"
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={full_address}&key={API_KEY}"
    
    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        try:
            async with session.get(url) as response:
                print(f"Status: {response.status}")
                data = await response.json()
                print(f"Data: {data}")
        except Exception as e:
            print(f"Exception: {e}")

asyncio.run(geocode_address("西屯區福上巷235弄16號", "台中市"))
