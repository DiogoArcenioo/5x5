-- Fotografia das lineups que fecharam 2020 para o Top 10 anual da HLTV.
-- Fonte do recorte: https://www.hltv.org/news/30896/top-10-teams-of-2020
-- Cada equipe possui exatamente cinco jogadores e cada jogador aparece em
-- apenas uma equipe no ano. Os atributos desta carga são substituídos pelos
-- valores anuais Both Sides da HLTV na migration seguinte.

INSERT INTO teams (name, short_name, slug, country_id)
SELECT 'HEROIC', 'HEROIC', 'HEROIC', countries.id
FROM countries
WHERE countries.code = 'DK'
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    country_id = EXCLUDED.country_id,
    updated_at = now();

WITH player_data (nickname, display_name, slug, country_code, career_status) AS (
  VALUES
    ('MISUTAAA', 'KÉVIN RABIER', 'MISUTAAA', 'FR', 'inactive'),
    ('SYRSON', 'FLORIAN RISCHE', 'SYRSON', 'DE', 'active'),
    ('K1TO', 'NILS GRUHNE', 'K1TO', 'DE', 'active'),
    ('STAVN', 'MARTIN LUND', 'STAVN', 'DK', 'active'),
    ('TESES', 'RENÉ MADSEN', 'TESES', 'DK', 'active'),
    ('NIKO', 'JOHANNES MAGET', 'NIKO-DK', 'DK', 'inactive'),
    ('B0RUP', 'JOHANNES BORUP', 'BORUP', 'DK', 'active'),
    ('GRIM', 'MICHAEL WINCE', 'GRIM', 'US', 'active')
)
INSERT INTO players (nickname, display_name, slug, country_id, career_status)
SELECT player_data.nickname, player_data.display_name, player_data.slug,
       countries.id, player_data.career_status
FROM player_data
JOIN countries ON countries.code = player_data.country_code
ON CONFLICT (slug) DO UPDATE
SET nickname = EXCLUDED.nickname,
    display_name = EXCLUDED.display_name,
    country_id = EXCLUDED.country_id,
    career_status = EXCLUDED.career_status,
    updated_at = now();

DELETE FROM player_team_years WHERE year = 2020;

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('ASTRALIS', 'DEVICE'),
    ('ASTRALIS', 'DUPREEH'),
    ('ASTRALIS', 'GLA1VE'),
    ('ASTRALIS', 'XYP9X'),
    ('ASTRALIS', 'MAGISK'),

    ('NATUS-VINCERE', 'S1MPLE'),
    ('NATUS-VINCERE', 'ELECTRONIC'),
    ('NATUS-VINCERE', 'FLAMIE'),
    ('NATUS-VINCERE', 'BOOMBL4'),
    ('NATUS-VINCERE', 'PERFECTO'),

    ('TEAM-VITALITY', 'ZYWOO'),
    ('TEAM-VITALITY', 'APEX'),
    ('TEAM-VITALITY', 'SHOX'),
    ('TEAM-VITALITY', 'RPK'),
    ('TEAM-VITALITY', 'MISUTAAA'),

    ('BIG', 'TABSEN'),
    ('BIG', 'TIZIAN'),
    ('BIG', 'SYRSON'),
    ('BIG', 'XANTARES'),
    ('BIG', 'K1TO'),

    ('G2-ESPORTS', 'HUNTER'),
    ('G2-ESPORTS', 'NEXA'),
    ('G2-ESPORTS', 'KENNYS'),
    ('G2-ESPORTS', 'NIKO'),
    ('G2-ESPORTS', 'AMANEK'),

    ('HEROIC', 'CADIAN'),
    ('HEROIC', 'STAVN'),
    ('HEROIC', 'TESES'),
    ('HEROIC', 'NIKO-DK'),
    ('HEROIC', 'BORUP'),

    ('TEAM-LIQUID', 'ELIGE'),
    ('TEAM-LIQUID', 'NAF'),
    ('TEAM-LIQUID', 'STEWIE2K'),
    ('TEAM-LIQUID', 'TWISTZZ'),
    ('TEAM-LIQUID', 'GRIM'),

    ('FURIA-ESPORTS', 'ART'),
    ('FURIA-ESPORTS', 'KSCERATO'),
    ('FURIA-ESPORTS', 'YUURIH'),
    ('FURIA-ESPORTS', 'VINI'),
    ('FURIA-ESPORTS', 'HEN1'),

    ('FNATIC', 'JW'),
    ('FNATIC', 'KRIMZ'),
    ('FNATIC', 'FLUSHA'),
    ('FNATIC', 'GOLDEN'),
    ('FNATIC', 'BROLLAN'),

    ('FAZE-CLAN', 'RAIN'),
    ('FAZE-CLAN', 'COLDZERA'),
    ('FAZE-CLAN', 'BROKY'),
    ('FAZE-CLAN', 'KJAERBYE'),
    ('FAZE-CLAN', 'OLOFMEISTER')
)
INSERT INTO player_team_years (
  player_id, team_id, year, overall,
  firepower, entrying, trading, opening, clutching, sniping, utility
)
SELECT players.id, teams.id, 2020, 50, 50, 50, 50, 50, 50, 50, 50
FROM lineup_data
JOIN players ON players.slug = lineup_data.player_slug
JOIN teams ON teams.slug = lineup_data.team_slug;

DO $$
DECLARE
  link_count integer;
  invalid_team_count integer;
  duplicate_player_count integer;
BEGIN
  SELECT count(*) INTO link_count
  FROM player_team_years
  WHERE year = 2020;

  SELECT count(*) INTO invalid_team_count
  FROM (
    SELECT team_id
    FROM player_team_years
    WHERE year = 2020
    GROUP BY team_id
    HAVING count(*) <> 5
  ) invalid_teams;

  SELECT count(*) INTO duplicate_player_count
  FROM (
    SELECT player_id
    FROM player_team_years
    WHERE year = 2020
    GROUP BY player_id
    HAVING count(*) <> 1
  ) duplicate_players;

  IF link_count <> 50 THEN
    RAISE EXCEPTION 'Quantidade inesperada de vinculos em 2020: %', link_count;
  END IF;
  IF invalid_team_count <> 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2020 sem exatamente cinco jogadores', invalid_team_count;
  END IF;
  IF duplicate_player_count <> 0 THEN
    RAISE EXCEPTION 'Existem % jogadores duplicados em 2020', duplicate_player_count;
  END IF;
END
$$;
