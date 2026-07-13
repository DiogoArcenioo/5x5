CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(50),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_users
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN username TYPE varchar(50),
  ADD COLUMN IF NOT EXISTS username_normalized varchar(50),
  ADD COLUMN IF NOT EXISTS email varchar(254),
  ADD COLUMN IF NOT EXISTS email_normalized varchar(254),
  ADD COLUMN IF NOT EXISTS password_hash text,
  ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE app_users
SET username_normalized = lower(username)
WHERE username_normalized IS NULL;

ALTER TABLE app_users
  ALTER COLUMN username SET NOT NULL,
  ALTER COLUMN username_normalized SET NOT NULL,
  ALTER COLUMN password_hash SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS app_users_username_normalized_uidx
  ON app_users(username_normalized);
CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_normalized_uidx
  ON app_users(email_normalized)
  WHERE email_normalized IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_users_role_check') THEN
    ALTER TABLE app_users ADD CONSTRAINT app_users_role_check CHECK (role IN ('user', 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_users_status_check') THEN
    ALTER TABLE app_users ADD CONSTRAINT app_users_status_check CHECK (status IN ('active', 'disabled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_users_username_length_check') THEN
    ALTER TABLE app_users ADD CONSTRAINT app_users_username_length_check
      CHECK (char_length(username) BETWEEN 3 AND 50);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_active_idx ON user_sessions(token_hash, expires_at)
  WHERE revoked_at IS NULL;
