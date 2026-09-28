ALTER TABLE app_user
ADD COLUMN IF NOT EXISTS membership_points INTEGER NOT NULL DEFAULT 0;

ALTER TABLE app_user
ADD CONSTRAINT membership_points_non_negative
CHECK (membership_points >= 0);