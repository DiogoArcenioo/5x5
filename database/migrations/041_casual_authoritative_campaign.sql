CREATE TABLE IF NOT EXISTS casual_runs (
  id uuid PRIMARY KEY,
  status varchar(20) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed')),
  campaign jsonb NOT NULL,
  campaign_revision integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_casual_runs_expires_at ON casual_runs (expires_at);
