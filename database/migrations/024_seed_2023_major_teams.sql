-- Equipes do BLAST.tv Paris Major 2023 que ainda nao existiam no catalogo.
-- Fonte: https://www.hltv.org/news/36194/blast-paris-major-teams-schedule-talent-prizes
-- Esta migration cadastra somente as organizacoes; jogadores e lineups ficam
-- para a proxima carga anual.

WITH team_data (name, short_name, slug, country_code) AS (
  VALUES
    ('INTO THE BREACH', 'ITB', 'INTO-THE-BREACH', 'GB'),
    ('9INE', '9INE', '9INE', 'PL'),
    ('MONTE', 'MONTE', 'MONTE', 'UA'),
    ('APEKS', 'APEKS', 'APEKS', 'NO'),
    ('THE MONGOLZ', 'MONGOLZ', 'THE-MONGOLZ', 'MN'),
    ('FLUXO', 'FLUXO', 'FLUXO', 'BR')
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
      ('HEROIC'), ('NATUS-VINCERE'), ('FNATIC'), ('INTO-THE-BREACH'),
      ('TEAM-VITALITY'), ('FURIA-ESPORTS'), ('9INE'),
      ('BAD-NEWS-EAGLES'), ('G2-ESPORTS'), ('OG'),
      ('NINJAS-IN-PYJAMAS'), ('FORZE'), ('PAIN-GAMING'), ('MONTE'),
      ('GAMERLEGION'), ('APEKS'), ('FAZE-CLAN'), ('TEAM-LIQUID'),
      ('ENCE'), ('MOUZ'), ('COMPLEXITY-GAMING'), ('THE-MONGOLZ'),
      ('GRAYHOUND-GAMING'), ('FLUXO')
  ) expected(slug)
  LEFT JOIN teams ON teams.slug = expected.slug
  WHERE teams.id IS NULL;

  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'Ainda faltam % equipes do Major de Paris 2023', missing_count;
  END IF;
END
$$;
