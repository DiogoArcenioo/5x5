CREATE TABLE app_users (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username varchar(50) NOT NULL,
  username_normalized varchar(50) NOT NULL UNIQUE,
  email varchar(254),
  email_normalized varchar(254) UNIQUE,
  password_hash text NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (char_length(username) BETWEEN 3 AND 50)
);

CREATE TABLE user_sessions (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id integer NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX user_sessions_user_idx ON user_sessions(user_id);
CREATE INDEX user_sessions_active_idx ON user_sessions(token_hash, expires_at)
  WHERE revoked_at IS NULL;
