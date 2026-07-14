-- Organizacoes participantes dos Majors de Katowice e Berlim em 2019
-- que ainda nao existiam no catalogo.
--
-- MOUSESPORTS nao e recriada: o registro MOUZ ja representa a mesma
-- organizacao, preservando um unico historico para o time.

INSERT INTO countries (code, name, region_id)
SELECT 'HR', 'CROÁCIA', regions.id
FROM regions
WHERE regions.code = 'EUROPE'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  region_id = EXCLUDED.region_id;

WITH team_data (name, short_name, slug, country_code) AS (
  VALUES
    ('ENCE', 'ENCE', 'ENCE', 'FI'),
    ('TEAM VITALITY', 'VIT', 'TEAM-VITALITY', 'FR'),
    ('GRAYHOUND GAMING', 'GH', 'GRAYHOUND-GAMING', 'AU'),
    ('NRG ESPORTS', 'NRG', 'NRG-ESPORTS', 'US'),
    ('FURIA ESPORTS', 'FURIA', 'FURIA-ESPORTS', 'BR'),
    ('VICI GAMING', 'VICI', 'VICI-GAMING', 'CN'),
    ('FORZE', 'FORZE', 'FORZE', 'RU'),
    ('SYMAN GAMING', 'SYMAN', 'SYMAN-GAMING', 'KZ'),
    ('CR4ZY', 'CR4ZY', 'CR4ZY', 'HR'),
    ('DREAMEATERS', 'DE', 'DREAMEATERS', 'RU'),
    ('INTZ ESPORTS', 'INTZ', 'INTZ-ESPORTS', 'BR')
)
INSERT INTO teams (name, short_name, slug, country_id)
SELECT
  team_data.name,
  team_data.short_name,
  team_data.slug,
  countries.id
FROM team_data
JOIN countries ON countries.code = team_data.country_code
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  country_id = EXCLUDED.country_id,
  updated_at = now();

DO $$
DECLARE
  seeded_team_count integer;
  mouz_count integer;
BEGIN
  SELECT count(*) INTO seeded_team_count
  FROM teams
  WHERE slug IN (
    'ENCE', 'TEAM-VITALITY', 'GRAYHOUND-GAMING', 'NRG-ESPORTS',
    'FURIA-ESPORTS', 'VICI-GAMING', 'FORZE', 'SYMAN-GAMING',
    'CR4ZY', 'DREAMEATERS', 'INTZ-ESPORTS'
  );

  SELECT count(*) INTO mouz_count
  FROM teams
  WHERE slug = 'MOUZ';

  IF seeded_team_count <> 11 THEN
    RAISE EXCEPTION 'Quantidade inesperada de equipes novas de 2019: %', seeded_team_count;
  END IF;

  IF mouz_count <> 1 THEN
    RAISE EXCEPTION 'O registro unico da MOUZ nao foi preservado';
  END IF;
END
$$;
