ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS teams_active_idx ON teams(active);
