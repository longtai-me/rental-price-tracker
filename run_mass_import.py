import pandas as pd
import uuid
import glob
import math
import requests
import os
import json
import asyncio
import aiohttp
from collections import defaultdict

API_KEY = "AIzaSyAZqSGmFJ3t0pKD1x7BPVFB5eJ6Bi1Kmyo"

def map_property_type(raw_type):
    if not isinstance(raw_type, str): return '其他'
    if '公寓' in raw_type: return '公寓'
    elif '大樓' in raw_type or '電梯' in raw_type or '華廈' in raw_type: return '電梯大樓'
    elif '透天' in raw_type: return '透天厝'
    return '其他'

def map_room_type(raw_type, prop_type):
    if not isinstance(raw_type, str): return '其他'
    if '車位' in raw_type or '車位' in prop_type: return '車位'
    if '整棟' in raw_type or '住家' in raw_type: return '整層住家'
    elif '獨立' in raw_type: return '獨立套房'
    elif '分租' in raw_type: return '分租套房'
    elif '雅房' in raw_type: return '雅房'
    elif '套房' in raw_type: return '獨立套房'
    return '其他'

async def geocode_address(session, address, city):
    full_address = f"{city}{address}"
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={full_address}&key={API_KEY}"
    try:
        async with session.get(url) as response:
            data = await response.json()
            if data['status'] == 'OK' and len(data['results']) > 0:
                location = data['results'][0]['geometry']['location']
                return location['lat'], location['lng']
    except Exception as e:
        pass
    return 0.0, 0.0

async def main():
    files = glob.glob('/Users/longtaijiang/Downloads/download*/*_lvr_land_c.csv')
    records_by_city = defaultdict(list)
    
    for filename in files:
        df = pd.read_csv(filename, skiprows=[1], dtype=str)
        for _, row in df.iterrows():
            full_addr = str(row.get('土地位置建物門牌', '')).replace(' ', '')
            if not full_addr or full_addr == 'nan':
                continue
            
            full_addr = full_addr.replace('臺', '台')
            city = full_addr[:3] if len(full_addr) >= 3 and ('市' in full_addr[:3] or '縣' in full_addr[:3]) else '未知'
            district = row.get('鄉鎮市區', '')
            
            for full_width, half_width in zip("０１２３４５６７８９", "0123456789"):
                full_addr = full_addr.replace(full_width, half_width)

            address = full_addr[3:] if full_addr.startswith(city) else full_addr
            
            total_price = row.get('總額元')
            if pd.isna(total_price): continue
            try:
                price = int(total_price)
            except:
                continue
            
            area_sqm = row.get('建物總面積平方公尺', '0')
            try:
                area = round(float(area_sqm) * 0.3025, 2)
            except:
                area = 0.0
                
            pricePerPyeong = math.floor(price / area) if area > 0 else 0
            
            prop_type = row.get('建物型態', '')
            propertyType = map_property_type(prop_type)
            rent_type = row.get('出租型態', '')
            roomType = map_room_type(rent_type, prop_type)
            
            floor = f"{row.get('租賃層次', '1')}/{row.get('總樓層數', '1')}"
            layout = f"{row.get('建物現況格局-房', '0')}房{row.get('建物現況格局-廳', '0')}廳{row.get('建物現況格局-衛', '0')}衛"
            
            built = str(row.get('建築完成年月', ''))
            buildingAge = 0
            if built and built.isdigit() and len(built) >= 3:
                try:
                    buildingAge = max(0, 115 - int(built[:-4]))
                except:
                    pass
            
            record = {
                'city': city,
                'district': district,
                'address': address,
                'propertyType': propertyType,
                'type': roomType,
                'layout': layout,
                'area': area,
                'floor': floor,
                'buildingAge': buildingAge,
                'price': price,
                'pricePerPyeong': pricePerPyeong
            }
            records_by_city[city].append(record)

    sorted_cities = sorted(records_by_city.keys(), key=lambda x: (0 if '市' in x else 1, x))
    
    total_geocoded = 0
    GEOCODE_LIMIT = 100000
    
    completed_cities = []
    half_processed_cities = []
    unprocessed_cities = []
    
    sql_statements = []
    sql_statements.append("DELETE FROM rentals WHERE posterRole = 'government';")
    
    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        for city in sorted_cities:
            records = records_by_city[city]
            if total_geocoded >= GEOCODE_LIMIT:
                unprocessed_cities.append(city)
                for r in records:
                    r['lat'], r['lng'] = 0.0, 0.0
                    r['approved'] = 0
            else:
                start_geocoded = total_geocoded
                tasks = []
                for r in records:
                    tasks.append(geocode_address(session, r['address'], r['city']))
                
                coords = await asyncio.gather(*tasks)
                
                for r, (lat, lng) in zip(records, coords):
                    r['lat'], r['lng'] = lat, lng
                    r['approved'] = 1 if lat != 0.0 else 0
                    total_geocoded += 1
                
                if total_geocoded > GEOCODE_LIMIT and start_geocoded < GEOCODE_LIMIT:
                    half_processed_cities.append(city)
                else:
                    completed_cities.append(city)
            
            # Note: Removed requestCount and notified to match production schema
            for r in records:
                new_id = str(uuid.uuid4())
                sql = f"INSERT INTO rentals (id, city, district, address, propertyType, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude, includesWater, includesElectricity, hasParking, genderRestriction, posterRole, approved, equipments, features, transports, hasElevator, canCook, hasBalcony, canMoveHuji, canPet, trashService) VALUES ('{new_id}', '{r['city']}', '{r['district']}', '{r['address']}', '{r['propertyType']}', '{r['type']}', '{r['layout']}', {r['area']}, '{r['floor']}', {r['buildingAge']}, {r['price']}, {r['pricePerPyeong']}, {r['lat']}, {r['lng']}, 0, 0, 0, 'none', 'government', {r['approved']}, '', '', '', 0, 0, 0, 0, 0, 0);"
                sql_statements.append(sql)

    with open('mass_import.sql', 'w') as f:
        f.write('\n'.join(sql_statements))
        
    print(f"\n=============================")
    print(f"Total Geocoded: {total_geocoded}")
    print(f"Total Processed: {sum(len(r) for r in records_by_city.values())}")
    print(f"Completed Cities: {', '.join(completed_cities)}")
    print(f"Half Processed Cities: {', '.join(half_processed_cities)}")
    print(f"Unprocessed Cities: {', '.join(unprocessed_cities)}")
    print(f"Generated mass_import.sql with {len(sql_statements)-1} inserts")

if __name__ == '__main__':
    asyncio.run(main())
