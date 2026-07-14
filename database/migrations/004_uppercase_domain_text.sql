UPDATE regions
SET code = upper(code),
    name = upper(name);

UPDATE countries
SET code = upper(code),
    name = upper(name);

UPDATE teams
SET name = upper(name),
    short_name = upper(short_name),
    slug = upper(slug);

UPDATE players
SET nickname = upper(nickname),
    display_name = upper(display_name),
    slug = upper(slug);

ALTER TABLE regions
  ADD CONSTRAINT regions_uppercase_check
  CHECK (code = upper(code) AND name = upper(name));

ALTER TABLE countries
  ADD CONSTRAINT countries_uppercase_check
  CHECK (code = upper(code) AND name = upper(name));

ALTER TABLE teams
  ADD CONSTRAINT teams_uppercase_check
  CHECK (
    name = upper(name)
    AND (short_name IS NULL OR short_name = upper(short_name))
    AND slug = upper(slug)
  );

ALTER TABLE players
  ADD CONSTRAINT players_uppercase_check
  CHECK (
    nickname = upper(nickname)
    AND display_name = upper(display_name)
    AND slug = upper(slug)
  );
