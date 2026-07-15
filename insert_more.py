import uuid
import sqlite3

records = [
    # Image 1
    ("中華路二段98之1號4樓", 13900, 9.16, "1房1廳1衛", "4/7", 34, 1, 0, "社會住宅代管", "有電梯", "公寓/華廈"),
    ("中華路二段46巷23弄8號2之2", 24000, 60.32, "3房2廳2衛", "4/5", 25, 0, 1, "一般包租", "冷氣", "公寓/華廈"),
    ("中華路二段179號3樓306室", 8700, 7.00, "1房0廳1衛", "3/5", 10, 0, 0, "一般包租", "冷氣", "透天厝"),
    ("中華路二段177號4樓405室", 9000, 7.00, "1房0廳1衛", "4/5", 10, 0, 0, "一般包租", "冷氣", "透天厝"),
    ("中華路二段98之13號4樓", 15000, 9.39, "1房0廳1衛", "4/7", 34, 1, 0, "社會住宅代管", "有電梯", "公寓/華廈"),
    # Image 2 (excluding 三民路三段203號)
    ("三民路三段302號之1", 8400, 9.55, "1房0廳1衛", "1/5", 37, 0, 0, "一般包租", "無", "公寓/華廈"),
    ("三民路三段302號3樓之1", 29000, 62.49, "3房2廳2衛", "3/14", 3, 1, 0, "社會住宅代管", "有電梯", "電梯大樓"),
    ("三民路三段329號13樓之9", 29000, 30.38, "2房2廳1衛", "13/14", 2, 1, 1, "社會住宅代管", "有電梯", "電梯大樓"),
    ("三民路三段77號4樓之1", 15000, 25.71, "2房1廳1衛", "4/7", 42, 1, 0, "社會住宅代管", "有電梯", "公寓/華廈"),
    ("三民路三段307號20樓", 11500, 5.05, "1房0廳1衛", "2/5", 5, 0, 0, "一般代管", "無", "透天厝"),
    ("三民路三段307號20樓", 10000, 4.64, "1房0廳1衛", "3/5", 5, 0, 0, "一般代管", "無", "透天厝"),
    ("三民路三段307號20樓", 11500, 5.05, "1房0廳1衛", "4/5", 5, 0, 0, "一般代管", "無", "透天厝"),
    ("三民路三段315巷23號6樓之2", 8500, 8.47, "1房0廳1衛", "6/7", 27, 1, 0, "社會住宅代管", "冷氣、熱水器", "電梯大樓"),
    ("三民路三段315巷23號6樓之4", 7000, 8.67, "1房0廳1衛", "6/7", 35, 1, 0, "社會住宅代管", "冷氣、熱水器", "電梯大樓"),
    ("三民路三段266號2樓之2", 7100, 6.77, "1房0廳1衛", "2/13", 45, 1, 0, "社會住宅包租", "冷氣、熱水器", "電梯大樓"),
    ("三民路三段89巷14號6樓", 16800, 23.95, "3房2廳2衛", "6/7", 42, 1, 0, "社會住宅包租", "無", "華廈"),
    ("三民路三段69號10樓之1", 10000, 25.71, "1房1廳1衛", "10/12", 42, 1, 0, "社會住宅代管", "無", "電梯大樓"),
    ("三民路三段260之24號", 16000, 21.63, "1房1廳1衛", "7/10", 44, 1, 0, "社會住宅代管", "冷氣、熱水器", "電梯大樓"),
]

sql_statements = []
for r in records:
    id_str = str(uuid.uuid4())
    address = r[0]
    price = r[1]
    area = r[2]
    layout = r[3]
    floor = r[4]
    buildingAge = r[5]
    hasElevator = r[6]
    hasParking = r[7]
    notes = r[8]
    equipment = r[9]
    type_str = r[10]
    
    pricePerPyeong = round(price / area) if area > 0 else 0
    latitude = 24.15
    longitude = 120.68

    sql = f"""INSERT INTO rentals (
        id, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude,
        includesWater, includesElectricity, hasParking, hasElevator, posterRole, approved, features, equipments, genderRestriction, transports, canCook, hasBalcony, canMoveHuji, canPet, trashService
    ) VALUES (
        '{id_str}', '台中市', '北區', '{address}', '{type_str}', '{layout}', {area}, '{floor}', {buildingAge}, {price}, {pricePerPyeong}, {latitude}, {longitude},
        0, 0, {hasParking}, {hasElevator}, 'government', 1, '{notes}', '{equipment}', 'none', '', 0, 0, 0, 0, 0
    );"""
    sql_statements.append(sql)

with open('insert_more.sql', 'w') as f:
    f.write('\n'.join(sql_statements))

print("Generated insert_more.sql")
