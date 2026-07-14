CREATE TABLE regions (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(20) NOT NULL UNIQUE,
  name varchar(80) NOT NULL
);

CREATE TABLE countries (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code char(2) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  region_id integer NOT NULL REFERENCES regions(id)
);

CREATE INDEX countries_region_idx ON countries(region_id);

CREATE TABLE teams (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(120) NOT NULL,
  short_name varchar(20),
  slug varchar(140) NOT NULL UNIQUE,
  country_id integer REFERENCES countries(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX teams_country_idx ON teams(country_id);

CREATE TABLE players (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nickname varchar(60) NOT NULL,
  display_name varchar(120) NOT NULL,
  slug varchar(80) NOT NULL UNIQUE,
  country_id integer REFERENCES countries(id),
  birth_date date,
  career_status varchar(20) NOT NULL DEFAULT 'active'
    CHECK (career_status IN ('active', 'inactive', 'retired')),
  overall smallint NOT NULL CHECK (overall BETWEEN 0 AND 100),
  firepower smallint NOT NULL CHECK (firepower BETWEEN 0 AND 100),
  entrying smallint NOT NULL CHECK (entrying BETWEEN 0 AND 100),
  trading smallint NOT NULL CHECK (trading BETWEEN 0 AND 100),
  opening smallint NOT NULL CHECK (opening BETWEEN 0 AND 100),
  clutching smallint NOT NULL CHECK (clutching BETWEEN 0 AND 100),
  sniping smallint NOT NULL CHECK (sniping BETWEEN 0 AND 100),
  utility smallint NOT NULL CHECK (utility BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX players_country_idx ON players(country_id);
CREATE INDEX players_overall_idx ON players(overall DESC);

CREATE TABLE player_team_years (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  player_id integer NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id integer NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  year smallint NOT NULL CHECK (year BETWEEN 2017 AND 2026),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, team_id, year)
);

CREATE INDEX player_team_years_team_year_idx ON player_team_years(team_id, year);
CREATE INDEX player_team_years_player_year_idx ON player_team_years(player_id, year);
