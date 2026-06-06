-- Add schedule fields and expand potential range for HCPs
ALTER TABLE hcps ADD COLUMN IF NOT EXISTS weekdays TEXT[] DEFAULT NULL;
ALTER TABLE hcps ADD COLUMN IF NOT EXISTS office_hours_start TEXT DEFAULT NULL;
ALTER TABLE hcps ADD COLUMN IF NOT EXISTS office_hours_end TEXT DEFAULT NULL;

-- Update potential constraint to allow 1-6
ALTER TABLE hcps DROP CONSTRAINT IF EXISTS hcps_potential_check;
ALTER TABLE hcps ADD CONSTRAINT hcps_potential_check CHECK (potential >= 1 AND potential <= 6);
