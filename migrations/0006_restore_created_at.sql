CREATE TABLE rentals_fixed (
  id TEXT PRIMARY KEY,
  posterRole TEXT DEFAULT 'user',
  approved BOOLEAN DEFAULT 0,
  verificationStatus TEXT DEFAULT 'unverified',
  
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  
  propertyType TEXT NOT NULL,
  type TEXT NOT NULL,
  rooms INTEGER DEFAULT 0,
  livingRooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area REAL NOT NULL,
  floor TEXT,
  totalFloors INTEGER,
  buildingAge INTEGER,
  
  price INTEGER NOT NULL,
  pricePerPyeong INTEGER,
  managementFee INTEGER,
  agencyFeeCharged BOOLEAN DEFAULT 0,
  
  includesWater BOOLEAN DEFAULT 0,
  waterBillingType TEXT DEFAULT 'taiwater',
  waterPricePerUnit REAL,
  waterSummerPricePerUnit REAL,
  includesElectricity BOOLEAN DEFAULT 0,
  electricityBillingType TEXT DEFAULT 'taipower',
  electricityPricePerKwh REAL,
  electricitySummerPricePerKwh REAL,
  
  hasElevator BOOLEAN DEFAULT 0,
  hasParking BOOLEAN DEFAULT 0,
  hasBalcony BOOLEAN DEFAULT 0,
  hasManager BOOLEAN DEFAULT 0,
  trashService BOOLEAN DEFAULT 0,
  
  genderRestriction TEXT DEFAULT 'none',
  canCook BOOLEAN DEFAULT 0,
  canPet BOOLEAN DEFAULT 0,
  canMoveHuji BOOLEAN DEFAULT 0,
  canSubsidize BOOLEAN DEFAULT 0,
  
  equipments TEXT,
  features TEXT,
  transports TEXT,
  
  ghostStory BOOLEAN DEFAULT 0,
  badLandlord BOOLEAN DEFAULT 0,
  evidenceLink TEXT,
  
  startDate TEXT,
  leaseTerm TEXT,
  contactEmail TEXT,
  contractFile TEXT,
  
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO rentals_fixed (
  id, posterRole, approved, verificationStatus, city, district, address, latitude, longitude,
  propertyType, type, rooms, livingRooms, bathrooms, area, floor, totalFloors, buildingAge,
  price, pricePerPyeong, managementFee, agencyFeeCharged,
  includesWater, waterBillingType, waterPricePerUnit, waterSummerPricePerUnit,
  includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh,
  hasElevator, hasParking, hasBalcony, hasManager, trashService,
  genderRestriction, canCook, canPet, canMoveHuji, canSubsidize,
  equipments, features, transports,
  ghostStory, badLandlord, evidenceLink, startDate, leaseTerm, contactEmail, contractFile
)
SELECT 
  id, posterRole, approved, verificationStatus, city, district, address, latitude, longitude,
  propertyType, type, rooms, livingRooms, bathrooms, area, floor, totalFloors, buildingAge,
  price, pricePerPyeong, managementFee, agencyFeeCharged,
  includesWater, waterBillingType, waterPricePerUnit, waterSummerPricePerUnit,
  includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh,
  hasElevator, hasParking, hasBalcony, hasManager, trashService,
  genderRestriction, canCook, canPet, canMoveHuji, canSubsidize,
  equipments, features, transports,
  ghostStory, badLandlord, evidenceLink, startDate, leaseTerm, contactEmail, contractFile
FROM rentals;

DROP TABLE rentals;
ALTER TABLE rentals_fixed RENAME TO rentals;
