-- Equipes do IEM Cologne Major 2026 que ainda nao existiam no catalogo.
-- Fontes:
-- https://www.hltv.org/major/invites
-- https://www.hltv.org/events/8301/iem-cologne-major-2026
-- Esta migration cadastra somente as organizacoes ausentes. Equipes ja
-- cadastradas, jogadores e lineups nao sao alterados.

WITH team_data (name, short_name, slug, country_code) AS (
  VALUES
    ('SINNERS', 'SINNERS', 'SINNERS', 'CZ'),
    ('FUT ESPORTS', 'FUT', 'FUT-ESPORTS', 'TR'),
    ('GAIMIN GLADIATORS', 'GG', 'GAIMIN-GLADIATORS', 'US'),
    ('THUNDER DOWNUNDER', 'THUNDER', 'THUNDER-DOWNUNDER', 'AU')
)
INSERT INTO teams (name, short_name, slug, country_id)
SELECT team_data.name, team_data.short_name, team_data.slug, countries.id
FROM team_data
JOIN countries ON countries.code = team_data.country_code
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM (
    VALUES
      ('GAMERLEGION'), ('BIG'), ('BETBOOM-TEAM'), ('B8-ESPORTS'),
      ('HEROIC'), ('SINNERS'), ('TEAM-SPIRIT'), ('ASTRALIS'),
      ('G2-ESPORTS'), ('FUT-ESPORTS'), ('MONTE'), ('TEAM-VITALITY'),
      ('NATUS-VINCERE'), ('PARIVISION'), ('AURORA-GAMING'),
      ('TEAM-FALCONS'), ('MOUZ'), ('M80'), ('NRG-ESPORTS'),
      ('SHARKS-ESPORTS'), ('GAIMIN-GLADIATORS'), ('MIBR'),
      ('TEAM-LIQUID'), ('9Z'), ('PAIN-GAMING'), ('LEGACY'),
      ('FURIA-ESPORTS'), ('TYLOO'), ('LYNN-VISION'),
      ('THUNDER-DOWNUNDER'), ('FLYQUEST'), ('THE-MONGOLZ')
  ) expected(slug)
  LEFT JOIN teams ON teams.slug = expected.slug
  WHERE teams.id IS NULL;

  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'Ainda faltam % equipes do IEM Cologne Major 2026', missing_count;
  END IF;
END
$$;
