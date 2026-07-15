import uuid
import sqlite3

records = [
    ("三民路三段203號7樓之4", 7000, 10.66, "1房0廳1衛", "7/12", 32, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號7樓之3", 7000, 10.66, "1房0廳1衛", "7/12", 32, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號4樓之1", 6000, 8.96, "1房0廳1衛", "4/12", 32, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號7樓之1", 6000, 8.96, "1房0廳1衛", "7/12", 31, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號6樓之4", 9400, 10.66, "1房1廳1衛", "6/12", 31, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號10樓之4", 7400, 10.44, "1房1廳1衛", "10/12", 31, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號7樓之6", 7500, 10.76, "1房0廳1衛", "7/12", 31, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號7樓之3", 7000, 10.66, "1房0廳1衛", "7/12", 31, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號7樓之4", 7000, 10.66, "1房0廳1衛", "7/12", 31, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號4樓之1", 6000, 8.96, "1房0廳1衛", "4/12", 31, 1, "社會住宅包租", "冷氣、熱水器"),
    ("三民路三段203號7樓之1", 6000, 8.96, "1房0廳1衛", "7/12", 30, 1, "社會住宅代管", "冷氣、熱水器"),
    ("三民路三段203號7樓之5", 6900, 10.33, "1房0廳1衛", "7/12", 30, 0, "社會住宅代管", "冷氣、熱水器"),
    ("三民路三段203號7樓之6", 7500, 10.76, "1房0廳1衛", "7/12", 30, 0, "社會住宅代管", ""),
    ("三民路三段203號4樓之6", 7000, 10.76, "1房0廳1衛", "4/12", 30, 1, "社會住宅代管", ""),
]

# user explicit coordinate from previous conversation
latitude = 24.16604
longitude = 120.68232

sql_statements = []

for address, price, area, layout, floor, age, has_manager, remark, equipments in records:
    id_str = str(uuid.uuid4())
    price_per_pyeong = round(price / area)
    
    features = []
    if has_manager:
        features.append('有管理員')
    features_str = ','.join(features)
    
    evidence_link = "https://lvr.land.moi.gov.tw/" # 实价登录

    stmt = f"""
    INSERT INTO rentals (
        id, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude,
        includesWater, includesElectricity, electricityBillingType,
        waterBillingType,
        hasParking, genderRestriction, equipments, features, transports,
        hasElevator, canCook, hasBalcony, canMoveHuji, canPet, trashService, canSubsidize, approved, posterRole, agencyFeeCharged,
        evidenceLink, verificationStatus
    ) VALUES (
        '{id_str}', '台中市', '北區', '{address}', '電梯大樓', '{layout}', {area}, '{floor}', {age}, {price}, {price_per_pyeong}, {latitude}, {longitude},
        0, 0, 'taipower',
        'taiwater',
        0, 'none', '{equipments}', '{features_str}', '',
        1, 0, 0, 1, 0, 0, 1, 1, 'government', 0,
        '{evidence_link}', 'verified'
    );
    """
    sql_statements.append(stmt)

with open('insert_lvr.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements))

