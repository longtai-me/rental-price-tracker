ALTER TABLE rentals ADD COLUMN electricityBillingType TEXT DEFAULT 'taipower';
ALTER TABLE rentals ADD COLUMN electricityPricePerKwh REAL;
ALTER TABLE rentals ADD COLUMN electricitySummerPricePerKwh REAL;
ALTER TABLE rentals ADD COLUMN waterBillingType TEXT DEFAULT 'taiwater';
ALTER TABLE rentals ADD COLUMN waterPricePerUnit REAL;
ALTER TABLE rentals ADD COLUMN waterSummerPricePerUnit REAL;

UPDATE rentals
SET electricityBillingType = CASE WHEN includesElectricity = 1 THEN 'included' ELSE 'taipower' END,
    waterBillingType = CASE WHEN includesWater = 1 THEN 'included' ELSE 'taiwater' END;

CREATE TABLE IF NOT EXISTS admin_access_logs (
  id TEXT PRIMARY KEY,
  ip TEXT NOT NULL,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  userAgent TEXT,
  requestCount INTEGER DEFAULT 1,
  notified BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
