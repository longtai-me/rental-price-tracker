CREATE TABLE rentals_new (
  -- 1. Meta
  id TEXT PRIMARY KEY,
  posterRole TEXT DEFAULT 'user',
  approved BOOLEAN DEFAULT 0,
  verificationStatus TEXT DEFAULT 'unverified',
  
  -- 2. Location
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  
  -- 3. Specs
  propertyType TEXT NOT NULL,
  type TEXT NOT NULL,
  rooms INTEGER DEFAULT 0,
  livingRooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area REAL NOT NULL,
  floor TEXT,
  totalFloors INTEGER,
  buildingAge INTEGER,
  
  -- 4. Pricing
  price INTEGER NOT NULL,
  pricePerPyeong INTEGER,
  managementFee INTEGER,
  agencyFeeCharged BOOLEAN DEFAULT 0,
  
  -- 5. Utilities
  includesWater BOOLEAN DEFAULT 0,
  waterBillingType TEXT DEFAULT 'taiwater',
  waterPricePerUnit REAL,
  waterSummerPricePerUnit REAL,
  includesElectricity BOOLEAN DEFAULT 0,
  electricityBillingType TEXT DEFAULT 'taipower',
  electricityPricePerKwh REAL,
  electricitySummerPricePerKwh REAL,
  
  -- 6. Facilities
  hasElevator BOOLEAN DEFAULT 0,
  hasParking BOOLEAN DEFAULT 0,
  hasBalcony BOOLEAN DEFAULT 0,
  hasManager BOOLEAN DEFAULT 0,
  trashService BOOLEAN DEFAULT 0,
  
  -- 7. Rules
  genderRestriction TEXT DEFAULT 'none',
  canCook BOOLEAN DEFAULT 0,
  canPet BOOLEAN DEFAULT 0,
  canMoveHuji BOOLEAN DEFAULT 0,
  canSubsidize BOOLEAN DEFAULT 0,
  
  -- 8. Details
  equipments TEXT,
  features TEXT,
  transports TEXT,
  
  -- 9. Warnings
  ghostStory BOOLEAN DEFAULT 0,
  badLandlord BOOLEAN DEFAULT 0,
  evidenceLink TEXT,
  
  -- 10. Contact/Contract
  startDate TEXT,
  leaseTerm TEXT,
  contactEmail TEXT,
  contractFile TEXT
);

INSERT INTO rentals_new (
  id, posterRole, approved, verificationStatus, city, district, address, latitude, longitude,
  propertyType, type, rooms, livingRooms, bathrooms, area, floor, totalFloors, buildingAge,
  price, pricePerPyeong, agencyFeeCharged,
  includesWater, waterBillingType, waterPricePerUnit, waterSummerPricePerUnit,
  includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh,
  hasElevator, hasParking, hasBalcony, trashService,
  genderRestriction, canCook, canPet, canMoveHuji, canSubsidize,
  equipments, features, transports,
  ghostStory, badLandlord, evidenceLink, startDate, leaseTerm, contactEmail, contractFile
)
SELECT 
  id, posterRole, approved, verificationStatus, city, district, address, latitude, longitude,
  propertyType, type, rooms, livingRooms, bathrooms, area, floor, totalFloors, buildingAge,
  price, pricePerPyeong, agencyFeeCharged,
  includesWater, waterBillingType, waterPricePerUnit, waterSummerPricePerUnit,
  includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh,
  hasElevator, hasParking, hasBalcony, trashService,
  genderRestriction, canCook, canPet, canMoveHuji, canSubsidize,
  equipments, features, transports,
  ghostStory, badLandlord, evidenceLink, startDate, leaseTerm, contactEmail, contractFile
FROM rentals;

-- Extract hasManager and managementFee from features
UPDATE rentals_new
SET 
  hasManager = CASE WHEN features LIKE '%有管理員%' THEN 1 ELSE 0 END,
  managementFee = CASE 
    WHEN features LIKE '%管理費:%' THEN 
      CAST(
        SUBSTR(
          SUBSTR(features, INSTR(features, '管理費:') + 4), 
          1, 
          CASE 
            WHEN INSTR(SUBSTR(features, INSTR(features, '管理費:') + 4), ',') > 0 
            THEN INSTR(SUBSTR(features, INSTR(features, '管理費:') + 4), ',') - 1
            ELSE LENGTH(features) 
          END
        ) AS INTEGER
      )
    ELSE NULL
  END;

-- Clean up features by removing '有管理員' and '管理費:xxx'
UPDATE rentals_new
SET features = REPLACE(
                 REPLACE(
                   REPLACE(
                     REPLACE(features, '有管理員,', ''), 
                   ',有管理員', ''), 
                 '有管理員', ''),
               ',,', ',')
WHERE features LIKE '%有管理員%';

UPDATE rentals_new
SET features = REPLACE(
                 features, 
                 '管理費:' || CAST(managementFee AS TEXT) || ',', 
                 ''
               )
WHERE managementFee IS NOT NULL AND features LIKE '%管理費:%,' ;

UPDATE rentals_new
SET features = REPLACE(
                 features, 
                 ',管理費:' || CAST(managementFee AS TEXT), 
                 ''
               )
WHERE managementFee IS NOT NULL AND features LIKE '%,管理費:%';

UPDATE rentals_new
SET features = REPLACE(
                 features, 
                 '管理費:' || CAST(managementFee AS TEXT), 
                 ''
               )
WHERE managementFee IS NOT NULL AND features LIKE '%管理費:%';

DROP TABLE rentals;
ALTER TABLE rentals_new RENAME TO rentals;
