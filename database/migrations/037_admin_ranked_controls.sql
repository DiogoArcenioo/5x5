ALTER TABLE app_users
  ADD COLUMN ranked_unlimited boolean NOT NULL DEFAULT false,
  ADD COLUMN ranked_points_adjustment integer NOT NULL DEFAULT 0,
  ADD COLUMN ranked_matches_adjustment integer NOT NULL DEFAULT 0,
  ADD COLUMN ranked_extra_attempts integer NOT NULL DEFAULT 0 CHECK (ranked_extra_attempts >= 0),
  ADD COLUMN ranked_extra_attempts_on date;

ALTER TABLE ranked_runs
  DROP CONSTRAINT IF EXISTS ranked_runs_one_per_day;

CREATE INDEX ranked_runs_user_day_idx ON ranked_runs (user_id, played_on, created_at DESC);

