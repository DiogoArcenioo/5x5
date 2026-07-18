CREATE TABLE ranked_cycles (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  played_on date NOT NULL,
  version integer NOT NULL,
  field jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ranked_cycles_day_version_unique UNIQUE (played_on, version),
  CONSTRAINT ranked_cycles_field_is_array CHECK (jsonb_typeof(field) = 'array')
);

CREATE INDEX ranked_cycles_active_idx
  ON ranked_cycles (played_on, version DESC);

ALTER TABLE ranked_runs
  ADD COLUMN cycle_id integer REFERENCES ranked_cycles(id) ON DELETE RESTRICT;

CREATE INDEX ranked_runs_cycle_user_idx
  ON ranked_runs (cycle_id, user_id, created_at DESC);
