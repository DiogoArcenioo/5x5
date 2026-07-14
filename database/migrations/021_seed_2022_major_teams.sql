-- Equipes dos dois Majors de 2022 que ainda nao existiam no catalogo.
-- Fontes:
-- https://www.hltv.org/news/33743/pgl-major-antwerp-viewers-guide
-- https://www.hltv.org/news/34919/iem-rio-major-viewers-guide
-- A uniao dos eventos possui 32 equipes unicas. Esta migration cadastra
-- somente as organizacoes; jogadores e lineups ficam para a proxima carga.

WITH team_data (name, short_name, slug, country_code) AS (
  VALUES
    ('IMPERIAL ESPORTS', 'IMPERIAL', 'IMPERIAL', 'BR'),
    ('BAD NEWS EAGLES', 'BNE', 'BAD-NEWS-EAGLES', 'XK'),
    ('OUTSIDERS', 'OUTSIDERS', 'OUTSIDERS', 'RU'),
    ('9Z TEAM', '9Z', '9Z', 'AR'),
    ('ETERNAL FIRE', 'EF', 'ETERNAL-FIRE', 'TR'),
    ('IHC ESPORTS', 'IHC', 'IHC', 'MN'),
    ('OG', 'OG', 'OG', 'DK'),
    ('GAMERLEGION', 'GL', 'GAMERLEGION', 'DE'),
    ('00NATION', '00N', '00NATION', 'BR')
)
INSERT INTO teams (name, short_name, slug, country_id)
SELECT team_data.name, team_data.short_name, team_data.slug, countries.id
FROM team_data
JOIN countries ON countries.code = team_data.country_code
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    country_id = EXCLUDED.country_id,
    updated_at = now();

DO $$
DECLARE missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM (
    VALUES
      ('FAZE-CLAN'), ('NATUS-VINCERE'), ('CLOUD9'), ('HEROIC'),
      ('NINJAS-IN-PYJAMAS'), ('FURIA-ESPORTS'), ('BIG'),
      ('COPENHAGEN-FLAMES'), ('G2-ESPORTS'), ('ENCE'), ('ASTRALIS'),
      ('TEAM-VITALITY'), ('MIBR'), ('FORZE'), ('IMPERIAL'),
      ('BAD-NEWS-EAGLES'), ('OUTSIDERS'), ('TEAM-LIQUID'),
      ('COMPLEXITY-GAMING'), ('9Z'), ('TEAM-SPIRIT'),
      ('ETERNAL-FIRE'), ('IHC'), ('RENEGADES'), ('SPROUT'), ('MOUZ'),
      ('OG'), ('EVIL-GENIUSES'), ('FNATIC'), ('GAMERLEGION'),
      ('00NATION'), ('GRAYHOUND-GAMING')
  ) expected(slug)
  LEFT JOIN teams ON teams.slug = expected.slug
  WHERE teams.id IS NULL;

  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'Ainda faltam % equipes dos Majors de 2022', missing_count;
  END IF;
END
$$;
