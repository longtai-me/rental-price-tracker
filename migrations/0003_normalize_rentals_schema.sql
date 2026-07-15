CREATE TABLE IF NOT EXISTS rental_utilities (
  rental_id TEXT PRIMARY KEY,
  includesWater BOOLEAN,
  includesElectricity BOOLEAN,
  electricityBillingType TEXT,
  electricityPricePerKwh REAL,
  electricitySummerPricePerKwh REAL,
  waterBillingType TEXT,
  waterPricePerUnit REAL,
  waterSummerPricePerUnit REAL,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rental_rules (
  rental_id TEXT PRIMARY KEY,
  genderRestriction TEXT,
  canCook BOOLEAN,
  canMoveHuji BOOLEAN,
  canPet BOOLEAN,
  canSubsidize BOOLEAN,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rental_facilities (
  rental_id TEXT PRIMARY KEY,
  hasParking BOOLEAN,
  hasElevator BOOLEAN,
  hasBalcony BOOLEAN,
  trashService BOOLEAN,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rental_extras (
  rental_id TEXT PRIMARY KEY,
  features TEXT,
  transports TEXT,
  agencyFeeCharged BOOLEAN,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
);

-- Copy existing data from rentals into new tables
INSERT INTO rental_utilities (rental_id, includesWater, includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh, waterBillingType, waterPricePerUnit, waterSummerPricePerUnit)
SELECT id, includesWater, includesElectricity, electricityBillingType, electricityPricePerKwh, electricitySummerPricePerKwh, waterBillingType, waterPricePerUnit, waterSummerPricePerUnit FROM rentals;

INSERT INTO rental_rules (rental_id, genderRestriction, canCook, canMoveHuji, canPet, canSubsidize)
SELECT id, genderRestriction, canCook, canMoveHuji, canPet, canSubsidize FROM rentals;

INSERT INTO rental_facilities (rental_id, hasParking, hasElevator, hasBalcony, trashService)
SELECT id, hasParking, hasElevator, hasBalcony, trashService FROM rentals;

INSERT INTO rental_extras (rental_id, features, transports, agencyFeeCharged)
SELECT id, features, transports, agencyFeeCharged FROM rentals;

-- Drop columns from rentals
ALTER TABLE rentals DROP COLUMN includesWater;
ALTER TABLE rentals DROP COLUMN includesElectricity;
ALTER TABLE rentals DROP COLUMN electricityBillingType;
ALTER TABLE rentals DROP COLUMN electricityPricePerKwh;
ALTER TABLE rentals DROP COLUMN electricitySummerPricePerKwh;
ALTER TABLE rentals DROP COLUMN waterBillingType;
ALTER TABLE rentals DROP COLUMN waterPricePerUnit;
ALTER TABLE rentals DROP COLUMN waterSummerPricePerUnit;

ALTER TABLE rentals DROP COLUMN genderRestriction;
ALTER TABLE rentals DROP COLUMN canCook;
ALTER TABLE rentals DROP COLUMN canMoveHuji;
ALTER TABLE rentals DROP COLUMN canPet;
ALTER TABLE rentals DROP COLUMN canSubsidize;

ALTER TABLE rentals DROP COLUMN hasParking;
ALTER TABLE rentals DROP COLUMN hasElevator;
ALTER TABLE rentals DROP COLUMN hasBalcony;
ALTER TABLE rentals DROP COLUMN trashService;

ALTER TABLE rentals DROP COLUMN features;
ALTER TABLE rentals DROP COLUMN transports;
ALTER TABLE rentals DROP COLUMN agencyFeeCharged;
