-- Corrige a fotografia final da The MongolZ em 2025.
-- controlez substituiu Senzu na lineup ativa e disputou a ultima competicao
-- oficial da equipe no ano, o StarLadder Budapest Major.
-- Fontes:
-- https://www.hltv.org/news/43072/the-mongolz-to-play-budapest-major-with-controlez
-- https://www.hltv.org/news/43221/starladder-reveals-budapest-major-rosters
-- https://www.hltv.org/news/43508/controlez-departs-the-mongolz
-- https://www.hltv.org/player/21398/controlez

INSERT INTO players (nickname, display_name, slug, country_id, career_status)
SELECT 'CONTROLEZ', 'UNUDELGER BAASANJARGAL', 'CONTROLEZ', countries.id, 'active'
FROM countries
WHERE countries.code = 'MN'
ON CONFLICT (slug) DO NOTHING;

DELETE FROM player_team_years pty
USING players, teams
WHERE pty.player_id = players.id
  AND pty.team_id = teams.id
  AND pty.year = 2025
  AND players.slug = 'SENZU'
  AND teams.slug = 'THE-MONGOLZ';

INSERT INTO player_team_years (
  player_id, team_id, year, overall,
  firepower, entrying, trading, opening, clutching, sniping, utility
)
SELECT players.id, teams.id, 2025, 50, 50, 50, 50, 50, 50, 50, 50
FROM players
CROSS JOIN teams
WHERE players.slug = 'CONTROLEZ'
  AND teams.slug = 'THE-MONGOLZ';

-- Senzu foi criado pela migration 027 exclusivamente para o vinculo acima.
-- Remove a identidade excedente depois da correcao, caso continue sem vinculos.
DELETE FROM players
WHERE slug = 'SENZU'
  AND NOT EXISTS (
    SELECT 1 FROM player_team_years WHERE player_id = players.id
  );

DO $$
DECLARE
  team_player_count integer;
  duplicate_player_count integer;
BEGIN
  SELECT count(*) INTO team_player_count
  FROM player_team_years pty
  JOIN teams ON teams.id = pty.team_id
  WHERE pty.year = 2025
    AND teams.slug = 'THE-MONGOLZ';

  SELECT count(*) INTO duplicate_player_count
  FROM (
    SELECT player_id
    FROM player_team_years
    WHERE year = 2025
    GROUP BY player_id
    HAVING count(*) > 1
  ) duplicate_players;

  IF team_player_count <> 5 THEN
    RAISE EXCEPTION 'The MongolZ possui % jogadores em 2025', team_player_count;
  END IF;
  IF duplicate_player_count <> 0 THEN
    RAISE EXCEPTION 'Existem % jogadores duplicados em 2025', duplicate_player_count;
  END IF;
END
$$;
