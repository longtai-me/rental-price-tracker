import pandas as pd
import uuid
import glob
import math

# Get all Price*.xls files in Downloads
files = glob.glob('/Users/longtaijiang/Downloads/Price*.xls')

sql_statements = []

# First, delete all government records to prevent duplication
sql_statements.append("DELETE FROM rentals WHERE posterRole = 'government';")

for filename in files:
    try:
        df = pd.read_excel(filename, skiprows=1)
        for _, row in df.iterrows():
            address = str(row.get('建物門牌', '')).replace(' ', '')
            
            # Skip empty addresses
            if not address or str(address) == 'nan':
                continue
            
            # Skip 203
            if '203號' in address or '２０３號' in address:
                continue

            # Standardize full width numbers to half width for easier reading
            for full_width, half_width in zip("０１２３４５６７８９", "0123456789"):
                address = address.replace(full_width, half_width)

            total_price_wan = row.get('總額(萬元/月)')
            if pd.isna(total_price_wan):
                continue
            
            price = int(float(total_price_wan) * 10000)
            area = float(row.get('總面積(坪)', 0))
            if pd.isna(area):
                area = 0
            
            pricePerPyeong = int(price / area) if area > 0 else 0
            
            layout = str(row.get('建物格局', ''))
            if pd.isna(layout):
                layout = ''
                
            floor_str = str(row.get('樓別/樓高', ''))
            if pd.isna(floor_str):
                floor_str = ''
            
            buildingAge = row.get('屋齡')
            buildingAge = int(buildingAge) if not pd.isna(buildingAge) else 0
            
            type_str = str(row.get('型態', ''))
            if pd.isna(type_str):
                type_str = ''
                
            equipments = str(row.get('附屬設備', ''))
            if pd.isna(equipments):
                equipments = ''
                
            notes = str(row.get('備註', ''))
            if pd.isna(notes):
                notes = ''
                
            service = str(row.get('住宅服務', ''))
            if not pd.isna(service) and service:
                notes += f" {service}"
                
            hasElevator = 1 if '有' in str(row.get('有無電梯', '')) else 0
            hasParking = 1 if '車位' in str(row.get('租賃標的', '')) or pd.notna(row.get('車位租賃總價')) else 0
            
            id_str = str(uuid.uuid4())
            latitude = 24.15
            longitude = 120.68

            sql = f"""INSERT INTO rentals (
                id, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude,
                includesWater, includesElectricity, hasParking, hasElevator, posterRole, approved, features, equipments, genderRestriction, transports, canCook, hasBalcony, canMoveHuji, canPet, trashService
            ) VALUES (
                '{id_str}', '台中市', '北區', '{address}', '{type_str}', '{layout}', {area}, '{floor_str}', {buildingAge}, {price}, {pricePerPyeong}, {latitude}, {longitude},
                0, 0, {hasParking}, {hasElevator}, 'government', 1, '{notes}', '{equipments}', 'none', '', 0, 0, 0, 0, 0
            );"""
            sql_statements.append(sql)
    except Exception as e:
        print(f"Error processing {filename}: {e}")

with open('import_all.sql', 'w') as f:
    f.write('\n'.join(sql_statements))

print(f"Generated import_all.sql with {len(sql_statements)-1} inserts")
