-- Equipes participantes do PGL Major Stockholm 2021 que ainda nao existiam.
-- Fonte: https://www.hltv.org/news/32617/pgl-major-stockholm-viewers-guide
-- Esta migration cadastra somente as organizacoes; lineups ficam para uma
-- carga anual posterior.

WITH team_data (name, short_name, slug, country_code) AS (
  VALUES
    ('COPENHAGEN FLAMES', 'CPHF', 'COPENHAGEN-FLAMES', 'DK'),
    ('ENTROPIQ', 'ENTROPIQ', 'ENTROPIQ', 'RU'),
    ('MOVISTAR RIDERS', 'MR', 'MOVISTAR-RIDERS', 'ES'),
    ('PAIN GAMING', 'PAIN', 'PAIN-GAMING', 'BR'),
    ('SHARKS ESPORTS', 'SHARKS', 'SHARKS-ESPORTS', 'BR'),
    ('EVIL GENIUSES', 'EG', 'EVIL-GENIUSES', 'US')
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
      ('NATUS-VINCERE'), ('GAMBIT'), ('NINJAS-IN-PYJAMAS'),
      ('TEAM-VITALITY'), ('G2-ESPORTS'), ('FURIA-ESPORTS'),
      ('TEAM-LIQUID'), ('EVIL-GENIUSES'), ('TEAM-SPIRIT'),
      ('VIRTUS-PRO'), ('ENTROPIQ'), ('ASTRALIS'), ('ENCE'), ('BIG'),
      ('MOVISTAR-RIDERS'), ('HEROIC'), ('MOUZ'), ('FAZE-CLAN'),
      ('COPENHAGEN-FLAMES'), ('PAIN-GAMING'), ('GODSENT'),
      ('RENEGADES'), ('SHARKS-ESPORTS'), ('TYLOO')
  ) expected(slug)
  LEFT JOIN teams ON teams.slug = expected.slug
  WHERE teams.id IS NULL;

  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'Ainda faltam % equipes do Major de Stockholm 2021', missing_count;
  END IF;
END
$$;
