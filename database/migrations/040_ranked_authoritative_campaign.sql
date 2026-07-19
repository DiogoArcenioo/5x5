ALTER TABLE ranked_runs
  ADD COLUMN IF NOT EXISTS campaign jsonb,
  ADD COLUMN IF NOT EXISTS campaign_revision integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_ranked_runs_active_campaign
  ON ranked_runs (user_id, cycle_id, status)
  WHERE status = 'in_progress';
