-- 1. Restore columns to rentals table
ALTER TABLE rentals ADD COLUMN includesWater BOOLEAN DEFAULT 0;
ALTER TABLE rentals ADD COLUMN includesElectricity BOOLEAN DEFAULT 0;
ALTER TABLE rentals ADD COLUMN electricityBillingType TEXT DEFAULT 'taipower';
ALTER TABLE rentals ADD COLUMN electricityPricePerKwh REAL;
ALTER TABLE rentals ADD COLUMN electricitySummerPricePerKwh REAL;
ALTER TABLE rentals ADD COLUMN waterBillingType TEXT DEFAULT 'taiwater';
ALTER TABLE rentals ADD COLUMN waterPricePerUnit REAL;
ALTER TABLE rentals ADD COLUMN waterSummerPricePerUnit REAL;

ALTER TABLE rentals ADD COLUMN genderRestriction TEXT DEFAULT 'none';
ALTER TABLE rentals ADD COLUMN canCook BOOLEAN DEFAULT 0;
ALTER TABLE rentals ADD COLUMN canMoveHuji BOOLEAN DEFAULT 0;
ALTER TABLE rentals ADD COLUMN canPet BOOLEAN DEFAULT 0;
ALTER TABLE rentals ADD COLUMN canSubsidize BOOLEAN DEFAULT 0;

ALTER TABLE rentals ADD COLUMN hasParking BOOLEAN DEFAULT 0;
ALTER TABLE rentals ADD COLUMN hasElevator BOOLEAN DEFAULT 0;
ALTER TABLE rentals ADD COLUMN hasBalcony BOOLEAN DEFAULT 0;
ALTER TABLE rentals ADD COLUMN trashService BOOLEAN DEFAULT 0;

ALTER TABLE rentals ADD COLUMN features TEXT;
ALTER TABLE rentals ADD COLUMN transports TEXT;
ALTER TABLE rentals ADD COLUMN agencyFeeCharged BOOLEAN DEFAULT 0;

-- 2. Restore data from normalized tables
UPDATE rentals
SET 
  includesWater = (SELECT includesWater FROM rental_utilities WHERE rental_id = rentals.id),
  includesElectricity = (SELECT includesElectricity FROM rental_utilities WHERE rental_id = rentals.id),
  electricityBillingType = (SELECT electricityBillingType FROM rental_utilities WHERE rental_id = rentals.id),
  electricityPricePerKwh = (SELECT electricityPricePerKwh FROM rental_utilities WHERE rental_id = rentals.id),
  electricitySummerPricePerKwh = (SELECT electricitySummerPricePerKwh FROM rental_utilities WHERE rental_id = rentals.id),
  waterBillingType = (SELECT waterBillingType FROM rental_utilities WHERE rental_id = rentals.id),
  waterPricePerUnit = (SELECT waterPricePerUnit FROM rental_utilities WHERE rental_id = rentals.id),
  waterSummerPricePerUnit = (SELECT waterSummerPricePerUnit FROM rental_utilities WHERE rental_id = rentals.id)
WHERE EXISTS (SELECT 1 FROM rental_utilities WHERE rental_id = rentals.id);

UPDATE rentals
SET 
  genderRestriction = (SELECT genderRestriction FROM rental_rules WHERE rental_id = rentals.id),
  canCook = (SELECT canCook FROM rental_rules WHERE rental_id = rentals.id),
  canMoveHuji = (SELECT canMoveHuji FROM rental_rules WHERE rental_id = rentals.id),
  canPet = (SELECT canPet FROM rental_rules WHERE rental_id = rentals.id),
  canSubsidize = (SELECT canSubsidize FROM rental_rules WHERE rental_id = rentals.id)
WHERE EXISTS (SELECT 1 FROM rental_rules WHERE rental_id = rentals.id);

UPDATE rentals
SET 
  hasParking = (SELECT hasParking FROM rental_facilities WHERE rental_id = rentals.id),
  hasElevator = (SELECT hasElevator FROM rental_facilities WHERE rental_id = rentals.id),
  hasBalcony = (SELECT hasBalcony FROM rental_facilities WHERE rental_id = rentals.id),
  trashService = (SELECT trashService FROM rental_facilities WHERE rental_id = rentals.id)
WHERE EXISTS (SELECT 1 FROM rental_facilities WHERE rental_id = rentals.id);

UPDATE rentals
SET 
  features = (SELECT features FROM rental_extras WHERE rental_id = rentals.id),
  transports = (SELECT transports FROM rental_extras WHERE rental_id = rentals.id),
  agencyFeeCharged = (SELECT agencyFeeCharged FROM rental_extras WHERE rental_id = rentals.id)
WHERE EXISTS (SELECT 1 FROM rental_extras WHERE rental_id = rentals.id);

-- 3. Drop normalized tables
DROP TABLE IF EXISTS rental_utilities;
DROP TABLE IF EXISTS rental_rules;
DROP TABLE IF EXISTS rental_facilities;
DROP TABLE IF EXISTS rental_extras;

-- 4. Add new split columns
ALTER TABLE rentals ADD COLUMN totalFloors INTEGER;
ALTER TABLE rentals ADD COLUMN rooms INTEGER DEFAULT 0;
ALTER TABLE rentals ADD COLUMN livingRooms INTEGER DEFAULT 0;
ALTER TABLE rentals ADD COLUMN bathrooms INTEGER DEFAULT 0;

-- 5. Split floor data
-- "4/12" -> floor='4', totalFloors=12
UPDATE rentals
SET 
  totalFloors = CAST(SUBSTR(floor, INSTR(floor, '/') + 1) AS INTEGER),
  floor = SUBSTR(floor, 1, INSTR(floor, '/') - 1)
WHERE INSTR(floor, '/') > 0;

-- 6. Split layout data
-- "1房1廳1衛" -> rooms=1, livingRooms=1, bathrooms=1
UPDATE rentals
SET 
  rooms = CAST(SUBSTR(layout, 1, INSTR(layout, '房') - 1) AS INTEGER),
  livingRooms = CAST(SUBSTR(SUBSTR(layout, INSTR(layout, '房') + 1), 1, INSTR(SUBSTR(layout, INSTR(layout, '房') + 1), '廳') - 1) AS INTEGER),
  bathrooms = CAST(SUBSTR(SUBSTR(layout, INSTR(layout, '廳') + 1), 1, INSTR(SUBSTR(layout, INSTR(layout, '廳') + 1), '衛') - 1) AS INTEGER)
WHERE layout LIKE '%房%廳%衛';

-- Handle "X房Y廳Z衛" variations or just simple ones. If missing '廳', it skips. This basic parse handles standard format.

-- 7. Drop old layout column
ALTER TABLE rentals DROP COLUMN layout;
