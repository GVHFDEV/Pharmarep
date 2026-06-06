-- 1. Update adoption_curve constraint with new values
-- First clear old values that would violate new constraint
UPDATE hcps SET adoption_curve = NULL WHERE adoption_curve IS NOT NULL;

ALTER TABLE hcps DROP CONSTRAINT IF EXISTS hcps_adoption_curve_check;
ALTER TABLE hcps ADD CONSTRAINT hcps_adoption_curve_check CHECK (adoption_curve IN (
  'Ciente', 'Interessado', 'Avaliando', 'Prescrevendo', 'Preferindo', 'Influenciador'
));

-- 2. Replace single office_hours with per-day schedule (JSONB)
-- Format: {"seg": {"start": "08:00", "end": "17:00"}, "ter": {"start": "09:00", "end": "18:00"}}
ALTER TABLE hcps ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT NULL;
ALTER TABLE hcps DROP COLUMN IF EXISTS office_hours_start;
ALTER TABLE hcps DROP COLUMN IF EXISTS office_hours_end;

-- 3. HCO changes: remove crf + contact_person, add pharmacists array + whatsapp2
-- pharmacists format: [{"name": "João", "crf": "CRF-SP 12345"}, ...]
ALTER TABLE hcos DROP COLUMN IF EXISTS contact_person;
ALTER TABLE hcos DROP COLUMN IF EXISTS crf;
ALTER TABLE hcos ADD COLUMN IF NOT EXISTS pharmacists JSONB DEFAULT '[]'::jsonb;
ALTER TABLE hcos ADD COLUMN IF NOT EXISTS whatsapp2 TEXT;

-- Drop old unique constraint on crf
DROP INDEX IF EXISTS hcos_user_id_crf_key;
