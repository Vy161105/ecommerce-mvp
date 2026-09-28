ALTER TABLE app_user
ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(20) NOT NULL DEFAULT 'STANDARD';

UPDATE app_user
SET membership_tier =
  CASE
    WHEN membership_points >= 100 THEN 'MEMBER'
    ELSE 'STANDARD'
  END;

ALTER TABLE app_user
DROP CONSTRAINT IF EXISTS membership_tier_valid;

ALTER TABLE app_user
ADD CONSTRAINT membership_tier_valid
CHECK (membership_tier IN ('STANDARD', 'MEMBER'));
