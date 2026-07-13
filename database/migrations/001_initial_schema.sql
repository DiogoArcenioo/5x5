CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE regions (
  id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(20) NOT NULL UNIQUE,
  name varchar(80) NOT NULL
);

CREATE TABLE countries (
  code char(2) PRIMARY KEY,
  name varchar(100) NOT NULL,
  region_id smallint REFERENCES regions(id),
  flag_asset_url text
);

CREATE TABLE seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(30) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  year smallint NOT NULL CHECK (year BETWEEN 1999 AND 2200),
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  game_version varchar(20) NOT NULL CHECK (game_version IN ('CS', 'CSGO', 'CS2', 'MIXED')),
  is_draft_enabled boolean NOT NULL DEFAULT false,
  CHECK (ends_on >= starts_on)
);

CREATE INDEX seasons_year_idx ON seasons(year);

CREATE TABLE people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name varchar(120) NOT NULL,
  legal_name varchar(160),
  birth_date date,
  nationality_code char(2) REFERENCES countries(code),
  secondary_nationality_code char(2) REFERENCES countries(code),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE players (
  id uuid PRIMARY KEY REFERENCES people(id) ON DELETE CASCADE,
  nickname varchar(60) NOT NULL,
  slug varchar(80) NOT NULL UNIQUE,
  debut_date date,
  retirement_date date,
  career_status varchar(20) NOT NULL CHECK (career_status IN ('active', 'inactive', 'retired')),
  portrait_url text,
  silhouette_url text,
  CHECK (retirement_date IS NULL OR debut_date IS NULL OR retirement_date >= debut_date)
);

CREATE TABLE player_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  alias varchar(100) NOT NULL,
  normalized_alias varchar(100) NOT NULL,
  alias_type varchar(20) NOT NULL CHECK (alias_type IN ('nickname', 'real_name', 'former_nick')),
  UNIQUE (player_id, normalized_alias)
);

CREATE INDEX player_aliases_normalized_idx ON player_aliases(normalized_alias);

CREATE TABLE coaches (
  id uuid PRIMARY KEY REFERENCES people(id) ON DELETE CASCADE,
  coach_since date,
  career_status varchar(20) NOT NULL CHECK (career_status IN ('active', 'inactive', 'retired'))
);

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  short_name varchar(20),
  slug varchar(140) NOT NULL UNIQUE,
  country_code char(2) REFERENCES countries(code),
  founded_on date,
  disbanded_on date,
  logo_url text,
  CHECK (disbanded_on IS NULL OR founded_on IS NULL OR disbanded_on >= founded_on)
);

CREATE TABLE player_team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  starts_on date NOT NULL,
  ends_on date,
  roster_status varchar(20) NOT NULL CHECK (roster_status IN ('starter', 'substitute', 'benched', 'loan')),
  source_url text,
  notes text,
  UNIQUE (player_id, team_id, starts_on),
  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);

CREATE INDEX player_memberships_player_dates_idx ON player_team_memberships(player_id, starts_on, ends_on);
CREATE INDEX player_memberships_team_dates_idx ON player_team_memberships(team_id, starts_on, ends_on);

CREATE TABLE coach_team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES coaches(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  starts_on date NOT NULL,
  ends_on date,
  role_label varchar(40) NOT NULL CHECK (role_label IN ('coach', 'assistant_coach', 'analyst')),
  UNIQUE (coach_id, team_id, starts_on, role_label),
  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);

CREATE TABLE player_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  season_id uuid NOT NULL REFERENCES seasons(id),
  membership_id uuid NOT NULL REFERENCES player_team_memberships(id),
  version_label varchar(160) NOT NULL,
  reference_date date NOT NULL,
  is_draft_eligible boolean NOT NULL DEFAULT true,
  data_quality varchar(20) NOT NULL DEFAULT 'estimated' CHECK (data_quality IN ('estimated', 'partial', 'verified')),
  notes text,
  UNIQUE (membership_id, season_id)
);

CREATE INDEX player_versions_season_eligible_idx ON player_versions(season_id, is_draft_eligible);

CREATE TABLE coach_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES coaches(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  season_id uuid NOT NULL REFERENCES seasons(id),
  membership_id uuid NOT NULL REFERENCES coach_team_memberships(id),
  leadership_rating smallint CHECK (leadership_rating BETWEEN 0 AND 100),
  tactical_rating smallint CHECK (tactical_rating BETWEEN 0 AND 100),
  development_rating smallint CHECK (development_rating BETWEEN 0 AND 100),
  mental_rating smallint CHECK (mental_rating BETWEEN 0 AND 100),
  form_rating smallint CHECK (form_rating BETWEEN 0 AND 100),
  UNIQUE (membership_id, season_id)
);

CREATE TABLE roles (
  id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(30) NOT NULL UNIQUE,
  name varchar(60) NOT NULL,
  category varchar(30) NOT NULL CHECK (category IN ('leadership', 'weapon', 'tactical', 'position')),
  is_assignable boolean NOT NULL DEFAULT true
);

CREATE TABLE player_version_roles (
  player_version_id uuid NOT NULL REFERENCES player_versions(id) ON DELETE CASCADE,
  role_id smallint NOT NULL REFERENCES roles(id),
  proficiency smallint NOT NULL CHECK (proficiency BETWEEN 0 AND 100),
  priority smallint NOT NULL DEFAULT 1 CHECK (priority > 0),
  is_primary boolean NOT NULL DEFAULT false,
  PRIMARY KEY (player_version_id, role_id)
);

CREATE TABLE maps (
  id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(30) NOT NULL UNIQUE,
  name varchar(60) NOT NULL,
  active_from date,
  active_until date,
  is_active boolean NOT NULL DEFAULT true,
  CHECK (active_until IS NULL OR active_from IS NULL OR active_until >= active_from)
);

CREATE TABLE season_map_pool (
  season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  map_id smallint NOT NULL REFERENCES maps(id),
  starts_on date,
  ends_on date,
  PRIMARY KEY (season_id, map_id),
  CHECK (ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on)
);

CREATE TABLE player_version_map_ratings (
  player_version_id uuid NOT NULL REFERENCES player_versions(id) ON DELETE CASCADE,
  map_id smallint NOT NULL REFERENCES maps(id),
  performance_rating smallint CHECK (performance_rating BETWEEN 0 AND 100),
  experience_rating smallint CHECK (experience_rating BETWEEN 0 AND 100),
  sample_size_maps smallint NOT NULL DEFAULT 0 CHECK (sample_size_maps >= 0),
  source_type varchar(20) NOT NULL CHECK (source_type IN ('manual', 'calculated', 'imported')),
  confidence numeric(4,3) CHECK (confidence BETWEEN 0 AND 1),
  PRIMARY KEY (player_version_id, map_id)
);

CREATE TABLE lineups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id),
  season_id uuid NOT NULL REFERENCES seasons(id),
  name varchar(140) NOT NULL,
  starts_on date NOT NULL,
  ends_on date,
  coach_version_id uuid REFERENCES coach_versions(id),
  is_canonical boolean NOT NULL DEFAULT true,
  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);

CREATE TABLE lineup_members (
  lineup_id uuid NOT NULL REFERENCES lineups(id) ON DELETE CASCADE,
  player_version_id uuid NOT NULL REFERENCES player_versions(id),
  default_role_id smallint REFERENCES roles(id),
  roster_status varchar(20) NOT NULL CHECK (roster_status IN ('starter', 'substitute', 'benched')),
  joined_on date,
  left_on date,
  PRIMARY KEY (lineup_id, player_version_id),
  CHECK (left_on IS NULL OR joined_on IS NULL OR left_on >= joined_on)
);

CREATE TABLE tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(160) NOT NULL,
  organizer varchar(120),
  tournament_type varchar(30) NOT NULL CHECK (tournament_type IN ('major', 'premier', 'regional', 'qualifier', 'other')),
  is_major_series boolean NOT NULL DEFAULT false
);

CREATE TABLE tournament_editions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id),
  season_id uuid NOT NULL REFERENCES seasons(id),
  name varchar(180) NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  location_country_code char(2) REFERENCES countries(code),
  game_version varchar(20) NOT NULL CHECK (game_version IN ('CS', 'CSGO', 'CS2')),
  is_major boolean NOT NULL DEFAULT false,
  format_config jsonb,
  tier varchar(20),
  CHECK (ends_on >= starts_on)
);

CREATE TABLE tournament_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id uuid NOT NULL REFERENCES tournament_editions(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  lineup_id uuid REFERENCES lineups(id),
  final_placement smallint CHECK (final_placement > 0),
  stage_reached varchar(50),
  matches_won smallint CHECK (matches_won >= 0),
  matches_lost smallint CHECK (matches_lost >= 0),
  prize_money numeric(14,2) CHECK (prize_money >= 0),
  UNIQUE (edition_id, team_id)
);

CREATE TABLE tournament_roster_members (
  entry_id uuid NOT NULL REFERENCES tournament_entries(id) ON DELETE CASCADE,
  player_version_id uuid NOT NULL REFERENCES player_versions(id),
  registration_status varchar(20) NOT NULL CHECK (registration_status IN ('starter', 'substitute', 'emergency')),
  maps_played smallint NOT NULL DEFAULT 0 CHECK (maps_played >= 0),
  PRIMARY KEY (entry_id, player_version_id)
);

CREATE TABLE data_providers (
  id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(30) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  base_url text,
  usage_status varchar(30) NOT NULL CHECK (usage_status IN ('licensed', 'manual', 'restricted', 'internal')),
  license_notes text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE player_external_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  provider_id smallint NOT NULL REFERENCES data_providers(id),
  external_player_id varchar(100) NOT NULL,
  profile_url text,
  verified_at timestamptz,
  UNIQUE (provider_id, external_player_id),
  UNIQUE (provider_id, player_id)
);

CREATE TABLE player_performance_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id),
  provider_id smallint NOT NULL REFERENCES data_providers(id),
  season_id uuid REFERENCES seasons(id),
  player_version_id uuid REFERENCES player_versions(id),
  period_type varchar(30) NOT NULL CHECK (period_type IN ('calendar_year', 'year_to_date', 'rolling_3_months', 'team_stint', 'event', 'custom')),
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  is_partial boolean NOT NULL,
  game_version varchar(20) NOT NULL CHECK (game_version IN ('CS', 'CSGO', 'CS2', 'MIXED')),
  team_scope varchar(20) NOT NULL CHECK (team_scope IN ('all_teams', 'single_team')),
  team_id uuid REFERENCES teams(id),
  maps_played integer NOT NULL CHECK (maps_played >= 0),
  rounds_played integer CHECK (rounds_played >= 0),
  rating_system varchar(30),
  source_url text,
  source_filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at timestamptz NOT NULL DEFAULT now(),
  source_payload_hash varchar(64),
  supersedes_period_id uuid REFERENCES player_performance_periods(id),
  data_quality varchar(20) NOT NULL DEFAULT 'partial' CHECK (data_quality IN ('estimated', 'partial', 'verified')),
  CHECK (ends_on >= starts_on),
  CHECK ((team_scope = 'single_team' AND team_id IS NOT NULL) OR (team_scope = 'all_teams' AND team_id IS NULL))
);

CREATE INDEX performance_periods_player_dates_idx ON player_performance_periods(player_id, starts_on, ends_on);
CREATE INDEX performance_periods_season_idx ON player_performance_periods(season_id);

CREATE TABLE player_source_attribute_scores (
  performance_period_id uuid PRIMARY KEY REFERENCES player_performance_periods(id) ON DELETE CASCADE,
  rating numeric(5,3) CHECK (rating >= 0),
  firepower smallint CHECK (firepower BETWEEN 0 AND 100),
  entrying smallint CHECK (entrying BETWEEN 0 AND 100),
  trading smallint CHECK (trading BETWEEN 0 AND 100),
  opening smallint CHECK (opening BETWEEN 0 AND 100),
  clutching smallint CHECK (clutching BETWEEN 0 AND 100),
  sniping smallint CHECK (sniping BETWEEN 0 AND 100),
  utility smallint CHECK (utility BETWEEN 0 AND 100),
  metric_set_version varchar(30) NOT NULL,
  source_calculated boolean NOT NULL DEFAULT true
);

CREATE TABLE performance_metric_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id smallint NOT NULL REFERENCES data_providers(id),
  code varchar(60) NOT NULL,
  display_name varchar(100) NOT NULL,
  metric_family varchar(40) NOT NULL,
  unit varchar(20) NOT NULL,
  minimum_value numeric(12,4),
  maximum_value numeric(12,4),
  introduced_on date,
  retired_on date,
  description text,
  UNIQUE (provider_id, code),
  CHECK (maximum_value IS NULL OR minimum_value IS NULL OR maximum_value >= minimum_value),
  CHECK (retired_on IS NULL OR introduced_on IS NULL OR retired_on >= introduced_on)
);

CREATE TABLE player_performance_metric_values (
  performance_period_id uuid NOT NULL REFERENCES player_performance_periods(id) ON DELETE CASCADE,
  metric_definition_id uuid NOT NULL REFERENCES performance_metric_definitions(id),
  numeric_value numeric(14,5),
  text_value varchar(100),
  percentile numeric(5,2) CHECK (percentile BETWEEN 0 AND 100),
  sample_size integer CHECK (sample_size >= 0),
  raw_display_value varchar(50),
  PRIMARY KEY (performance_period_id, metric_definition_id),
  CHECK (numeric_value IS NOT NULL OR text_value IS NOT NULL)
);

CREATE TABLE player_version_game_ratings (
  player_version_id uuid PRIMARY KEY REFERENCES player_versions(id) ON DELETE CASCADE,
  game_overall smallint CHECK (game_overall BETWEEN 0 AND 100),
  aim smallint CHECK (aim BETWEEN 0 AND 100),
  impact smallint CHECK (impact BETWEEN 0 AND 100),
  consistency smallint CHECK (consistency BETWEEN 0 AND 100),
  clutch smallint CHECK (clutch BETWEEN 0 AND 100),
  experience smallint CHECK (experience BETWEEN 0 AND 100),
  leadership smallint CHECK (leadership BETWEEN 0 AND 100),
  awp smallint CHECK (awp BETWEEN 0 AND 100),
  entry smallint CHECK (entry BETWEEN 0 AND 100),
  support smallint CHECK (support BETWEEN 0 AND 100),
  season_form smallint CHECK (season_form BETWEEN 0 AND 100),
  source_period_id uuid REFERENCES player_performance_periods(id),
  rating_model_version varchar(30) NOT NULL,
  calculation_method varchar(20) NOT NULL CHECK (calculation_method IN ('manual', 'source_based', 'hybrid', 'calculated')),
  calculated_at timestamptz NOT NULL DEFAULT now(),
  manual_adjustment smallint NOT NULL DEFAULT 0 CHECK (manual_adjustment BETWEEN -100 AND 100),
  adjustment_reason text
);

CREATE TABLE app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(50) UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  game_type varchar(30) NOT NULL CHECK (game_type IN ('major_draft', 'guess_player')),
  status varchar(20) NOT NULL CHECK (status IN ('created', 'active', 'completed', 'abandoned')),
  random_seed bigint NOT NULL,
  rules_version varchar(30) NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE major_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES game_sessions(id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES seasons(id),
  draft_status varchar(20) NOT NULL CHECK (draft_status IN ('selecting', 'locked', 'simulated')),
  coach_version_id uuid REFERENCES coach_versions(id),
  team_name varchar(100),
  locked_at timestamptz
);

CREATE TABLE major_draft_members (
  draft_id uuid NOT NULL REFERENCES major_drafts(id) ON DELETE CASCADE,
  player_version_id uuid NOT NULL REFERENCES player_versions(id),
  slot_number smallint NOT NULL CHECK (slot_number BETWEEN 1 AND 5),
  assigned_role_id smallint REFERENCES roles(id),
  is_captain boolean NOT NULL DEFAULT false,
  PRIMARY KEY (draft_id, player_version_id),
  UNIQUE (draft_id, slot_number)
);

CREATE TABLE simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES major_drafts(id),
  seed bigint NOT NULL,
  engine_version varchar(30) NOT NULL,
  rules_snapshot jsonb NOT NULL,
  input_snapshot jsonb NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  final_placement smallint CHECK (final_placement > 0),
  mvp_player_id uuid REFERENCES players(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE simulation_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  source_team_id uuid REFERENCES teams(id),
  name varchar(120) NOT NULL,
  is_user_team boolean NOT NULL,
  strength_snapshot numeric(6,3) NOT NULL,
  roster_snapshot jsonb NOT NULL
);

CREATE TABLE simulation_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  stage varchar(50) NOT NULL,
  team_a_id uuid NOT NULL REFERENCES simulation_teams(id),
  team_b_id uuid NOT NULL REFERENCES simulation_teams(id),
  best_of smallint NOT NULL CHECK (best_of IN (1, 3, 5)),
  winner_team_id uuid REFERENCES simulation_teams(id),
  team_a_score smallint CHECK (team_a_score >= 0),
  team_b_score smallint CHECK (team_b_score >= 0),
  sequence_number smallint NOT NULL CHECK (sequence_number > 0),
  CHECK (team_a_id <> team_b_id),
  UNIQUE (simulation_id, sequence_number)
);

CREATE TABLE simulation_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES simulation_matches(id) ON DELETE CASCADE,
  map_id smallint NOT NULL REFERENCES maps(id),
  map_number smallint NOT NULL CHECK (map_number > 0),
  team_a_rounds smallint NOT NULL CHECK (team_a_rounds >= 0),
  team_b_rounds smallint NOT NULL CHECK (team_b_rounds >= 0),
  winner_team_id uuid REFERENCES simulation_teams(id),
  went_to_overtime boolean NOT NULL DEFAULT false,
  UNIQUE (match_id, map_number)
);

CREATE TABLE simulation_player_stats (
  simulation_map_id uuid NOT NULL REFERENCES simulation_maps(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id),
  simulation_team_id uuid NOT NULL REFERENCES simulation_teams(id),
  kills smallint NOT NULL CHECK (kills >= 0),
  deaths smallint NOT NULL CHECK (deaths >= 0),
  assists smallint NOT NULL CHECK (assists >= 0),
  clutches smallint NOT NULL DEFAULT 0 CHECK (clutches >= 0),
  headshots smallint CHECK (headshots >= 0),
  performance_rating numeric(5,2) NOT NULL CHECK (performance_rating >= 0),
  is_map_mvp boolean NOT NULL DEFAULT false,
  PRIMARY KEY (simulation_map_id, player_id)
);

CREATE TABLE hint_types (
  id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(40) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  score_cost smallint NOT NULL CHECK (score_cost >= 0),
  resolver_key varchar(80) NOT NULL,
  display_order smallint NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE guess_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES game_sessions(id) ON DELETE CASCADE,
  target_player_id uuid NOT NULL REFERENCES players(id),
  target_season_id uuid REFERENCES seasons(id),
  initial_score smallint NOT NULL CHECK (initial_score >= 0),
  current_score smallint NOT NULL CHECK (current_score >= 0),
  guess_count smallint NOT NULL DEFAULT 0 CHECK (guess_count >= 0),
  won boolean,
  target_snapshot jsonb NOT NULL
);

CREATE TABLE guess_game_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guess_game_id uuid NOT NULL REFERENCES guess_games(id) ON DELETE CASCADE,
  hint_type_id smallint NOT NULL REFERENCES hint_types(id),
  score_cost_applied smallint NOT NULL CHECK (score_cost_applied >= 0),
  hint_payload jsonb NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guess_game_id, hint_type_id)
);

CREATE TABLE guess_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guess_game_id uuid NOT NULL REFERENCES guess_games(id) ON DELETE CASCADE,
  guessed_player_id uuid REFERENCES players(id),
  raw_guess varchar(120) NOT NULL,
  is_correct boolean NOT NULL,
  score_penalty smallint NOT NULL DEFAULT 0 CHECK (score_penalty >= 0),
  attempted_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO roles (code, name, category) VALUES
  ('igl', 'IGL', 'leadership'),
  ('awper', 'AWPer', 'weapon'),
  ('entry', 'Entry', 'tactical'),
  ('lurker', 'Lurker', 'tactical'),
  ('rifler', 'Rifler', 'weapon'),
  ('support', 'Support', 'tactical'),
  ('anchor', 'Anchor', 'position'),
  ('rotator', 'Rotator', 'position')
ON CONFLICT (code) DO NOTHING;

INSERT INTO data_providers (code, name, base_url, usage_status, license_notes)
VALUES (
  'hltv',
  'HLTV.org',
  'https://www.hltv.org',
  'restricted',
  'Do not automate collection without explicit permission or a valid license.'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO hint_types (code, name, score_cost, resolver_key, display_order) VALUES
  ('nationality', 'Nacionalidade', 5, 'player.nationality', 10),
  ('region', 'Região', 5, 'player.region', 20),
  ('age', 'Idade', 8, 'player.age', 30),
  ('debut_year', 'Ano de estreia', 8, 'player.debut_year', 40),
  ('roles', 'Funções', 10, 'player.roles', 50),
  ('former_teams', 'Times em que jogou', 12, 'player.former_teams', 60),
  ('teammates', 'Jogadores com quem atuou', 15, 'player.teammates', 70),
  ('major_appearances', 'Majors disputados', 10, 'player.major_appearances', 80),
  ('major_wins', 'Majors vencidos', 12, 'player.major_wins', 90),
  ('best_major_placement', 'Melhor colocação em Major', 10, 'player.best_major_placement', 100),
  ('career_status', 'Status da carreira', 5, 'player.career_status', 110),
  ('blurred_image', 'Foto desfocada', 15, 'player.blurred_image', 120),
  ('silhouette', 'Silhueta', 20, 'player.silhouette', 130)
ON CONFLICT (code) DO NOTHING;
