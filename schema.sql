DROP TABLE IF EXISTS rentals;

CREATE TABLE rentals (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL,
  layout TEXT NOT NULL,
  area REAL NOT NULL,
  floor TEXT NOT NULL,
  buildingAge INTEGER NOT NULL,
  price INTEGER NOT NULL,
  pricePerPyeong INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  includesWater BOOLEAN NOT NULL,
  includesElectricity BOOLEAN NOT NULL,
  hasParking BOOLEAN NOT NULL,
  genderRestriction TEXT NOT NULL,
  equipments TEXT NOT NULL,
  features TEXT NOT NULL,
  transports TEXT NOT NULL,
  hasElevator BOOLEAN NOT NULL,
  canCook BOOLEAN NOT NULL,
  hasBalcony BOOLEAN NOT NULL,
  canMoveHuji BOOLEAN NOT NULL,
  canPet BOOLEAN NOT NULL,
  trashService BOOLEAN NOT NULL
);

INSERT INTO rentals (id, city, district, address, type, layout, area, floor, buildingAge, price, pricePerPyeong, latitude, longitude, includesWater, includesElectricity, hasParking, genderRestriction, equipments, features, transports, hasElevator, canCook, hasBalcony, canMoveHuji, canPet, trashService) VALUES
('1', '台北市', '大安區', '忠孝東路四段...', '整層住家', '3房2廳2衛', 35.5, '5/12', 15, 45000, 1267, 25.041, 121.545, 0, 0, 1, 'none', '冷氣,熱水器,天然瓦斯,冰箱,洗衣機,網路,第四台', '有陽台,代收垃圾,可開伙', '捷運,公車', 1, 1, 1, 1, 0, 1),
('2', '新北市', '板橋區', '文化路一段...', '獨立套房', '1房1衛', 8.2, '3/5', 8, 12000, 1463, 25.014, 121.462, 1, 0, 0, 'female', '冷氣,熱水器,電磁爐,冰箱,洗衣機,網路', '代收垃圾', '捷運,公車', 0, 0, 0, 0, 0, 1),
('3', '台中市', '西屯區', '台灣大道三段...', '整層住家', '2房1廳1衛', 22.0, '15/20', 3, 28000, 1272, 24.162, 120.647, 0, 0, 1, 'none', '冷氣,熱水器,天然瓦斯,沙發,雙人床', '有陽台,代收垃圾,可開伙,可養寵物', '公車,客運', 1, 1, 1, 1, 1, 1),
('4', '高雄市', '左營區', '博愛二路...', '分租套房', '1房1衛', 6.5, '2/4', 25, 6500, 1000, 22.665, 120.302, 1, 0, 0, 'male', '冷氣,熱水器,單人床,桌椅', '可養寵物', '捷運,公車', 0, 0, 0, 0, 1, 0),
('5', '台北市', '信義區', '信義路五段...', '整層住家', '4房2廳3衛', 55.0, '10/25', 5, 85000, 1545, 25.033, 121.564, 0, 0, 1, 'none', '冷氣,熱水器,天然瓦斯,冰箱,洗衣機,網路,第四台', '有陽台,代收垃圾,可開伙', '捷運,公車', 1, 1, 1, 1, 0, 1),
('6', '桃園市', '中壢區', '中北路...', '獨立套房', '1房1衛', 7.0, '4/6', 12, 8500, 1214, 24.954, 121.238, 1, 0, 0, 'none', '冷氣,熱水器,冰箱,洗衣機', '', '火車,公車', 0, 0, 0, 0, 0, 0);
