-- Lineups de fechamento de 2018 para as equipes adicionadas no seed 007.
-- Snapshot das equipes: ranking HLTV de 31/12/2018.
-- https://www.hltv.org/ranking/teams/2018/december/31/5378
-- Skills: atributos HLTV individuais filtrados de 2018-01-01 a 2018-12-31,
-- Both Sides. O overall e a media arredondada das sete skills.
--
-- Equipes sem uma formacao completa e exclusiva no fechamento do ano
-- (100 THIEVES, FLASH GAMING, MISFITS GAMING, QBF e SPROUT) permanecem
-- sem vinculos para evitar duplicar jogadores ou inventar uma quinta vaga.

WITH player_data (
  nickname, display_name, slug, country_code,
  firepower, entrying, trading, opening, clutching, sniping, utility
) AS (
  VALUES
    ('FALLEN', 'GABRIEL TOLEDO', 'FALLEN', 'BR', 53, 25, 26, 38, 51, 93, 70),
    ('TARIK', 'TARIK CELIK', 'TARIK', 'US', 75, 53, 42, 70, 55, 9, 53),
    ('FER', 'FERNANDO ALVARENGA', 'FER', 'BR', 79, 46, 13, 85, 29, 1, 46),
    ('COLDZERA', 'MARCELO DAVID', 'COLDZERA', 'BR', 87, 17, 53, 30, 69, 24, 52),
    ('TACO', 'EPITACIO DE MELO', 'TACO', 'BR', 24, 33, 12, 58, 53, 6, 48),
    ('GET_RIGHT', 'CHRISTOPHER ALESUND', 'GET-RIGHT', 'SE', 42, 25, 13, 42, 49, 0, 67),
    ('DENNIS', 'DENNIS EDMAN', 'DENNIS', 'SE', 65, 30, 34, 52, 42, 12, 56),
    ('LEKR0', 'JONAS OLOFSSON', 'LEKR0', 'SE', 59, 37, 28, 50, 60, 10, 44),
    ('REZ', 'FREDRIK STERNER', 'REZ', 'SE', 66, 45, 21, 62, 49, 7, 57),
    ('BUSTER', 'TIMUR TULEPOV', 'BUSTER', 'KZ', 70, 26, 16, 56, 66, 18, 15),
    ('QIKERT', 'ALEKSEI GOLUBEV', 'QIKERT', 'KZ', 86, 47, 46, 68, 44, 1, 60),
    ('JAME', 'DZHAMI ALI', 'JAME', 'KZ', 65, 20, 22, 63, 77, 95, 47),
    ('JKS', 'JUSTIN SAVAGE', 'JKS', 'AU', 74, 24, 51, 21, 82, 9, 75),
    ('AZR', 'AARON WARD', 'AZR', 'AU', 50, 64, 59, 42, 33, 0, 65),
    ('GRATISFACTION', 'SEAN KAIWAI', 'GRATISFACTION', 'NZ', 78, 27, 37, 54, 70, 94, 65),
    ('N0THING', 'JORDAN GILBERT', 'N0THING', 'US', 44, 42, 38, 56, 20, 3, 77),
    ('SHAHZAM', 'SHAHZEB KHAN', 'SHAHZAM', 'US', 68, 23, 47, 54, 62, 94, 52),
    ('STANISLAW', 'PETER JARGUZ', 'STANISLAW', 'CA', 48, 56, 23, 44, 49, 3, 82),
    ('HIKO', 'SPENCER MARTIN', 'HIKO', 'US', 36, 44, 67, 27, 73, 0, 68),
    ('TENZKI', 'JESPER PLOUGMANN', 'TENZKI', 'DK', 59, 50, 40, 48, 53, 0, 56),
    ('MSL', 'MATHIAS LAURIDSEN', 'MSL', 'DK', 39, 80, 24, 69, 30, 19, 68),
    ('SICK', 'HUNTER MIMS', 'SICK', 'US', 73, 47, 67, 55, 58, 9, 34),
    ('VICE', 'DANIEL KIM', 'VICE', 'US', 62, 84, 67, 43, 42, 0, 50),
    ('ATTACKER', 'YUANZHANG SHENG', 'ATTACKER', 'CN', 91, 32, 59, 50, 58, 2, 16),
    ('XCCURATE', 'KEVIN SUSANTO', 'XCCURATE', 'ID', 62, 49, 56, 39, 81, 93, 53),
    ('DIMAONESHOT', 'DMITRIY BANDURKA', 'DIMAONESHOT', 'RU', 61, 88, 27, 83, 37, 0, 50),
    ('SDY', 'VIKTOR ORUDZHEV', 'SDY', 'UA', 77, 53, 66, 50, 72, 2, 40),
    ('WORLDEDIT', 'GEORGI YASKIN', 'WORLDEDIT', 'RU', 75, 18, 35, 39, 53, 91, 49),
    ('BOOMBL4', 'KIRILL MIKHAILOV', 'BOOMBL4', 'RU', 84, 36, 32, 62, 52, 2, 55),
    ('F0REST', 'PATRIK LINDBERG', 'F0REST', 'SE', 68, 28, 50, 51, 51, 11, 39),
    ('FITCH', 'BEKTIYAR BAHYTOV', 'FITCH', 'KZ', 58, 51, 15, 79, 25, 1, 64),
    ('KRIZZEN', 'AIDYN TURLYBEKOV', 'KRIZZEN', 'KZ', 53, 60, 32, 48, 34, 0, 40),
    ('JKAEM', 'JOAKIM MYRBOSTAD', 'JKAEM', 'NO', 77, 80, 58, 72, 53, 0, 32),
    ('LIAZZ', 'JAY TREGILLGAS', 'LIAZZ', 'AU', 87, 40, 55, 42, 58, 0, 69),
    ('DEPHH', 'RORY JACKSON', 'DEPHH', 'GB', 72, 69, 27, 72, 37, 24, 73),
    ('RICKEH', 'RICARDO MULHOLLAND', 'RICKEH', 'AU', 67, 41, 22, 68, 62, 60, 67),
    ('BNTET', 'HANSEL FERDINAND', 'BNTET', 'ID', 81, 42, 81, 31, 83, 1, 82),
    ('SOMEBODY', 'HAOWEN XU', 'SOMEBODY', 'CN', 79, 70, 34, 72, 45, 8, 49),
    ('DAVCOST', 'VADIM VASILYEV', 'DAVCOST', 'RU', 55, 23, 33, 37, 62, 94, 49),
    ('COLDYY1', 'PAVLO VEKLENKO', 'COLDYY1', 'UA', 79, 34, 67, 37, 59, 5, 52),
    ('MAJ3R', 'ENGIN KÜPELI', 'MAJ3R', 'TR', 39, 18, 18, 53, 52, 20, 81),
    ('CALYX', 'BUĞRA ARKIN', 'CALYX', 'TR', 72, 43, 48, 40, 70, 8, 48),
    ('S0TF1K', 'DMITRY FOROSTYANKO', 'S0TF1K', 'RU', 38, 68, 31, 37, 44, 6, 83),
    ('WAYLANDER', 'JAN RAHKONEN', 'WAYLANDER', 'FI', 56, 12, 9, 64, 44, 3, 40),
    ('KVIK', 'AURIMAS KVAKŠYS', 'KVIK', 'LT', 63, 49, 50, 49, 34, 6, 37),
    ('N0RB3R7', 'DAVID DANIELYAN', 'N0RB3R7', 'RU', 91, 37, 14, 84, 54, 17, 16),
    ('SUMMER', 'YULUN CAI', 'SUMMER', 'CN', 71, 41, 23, 49, 59, 47, 73),
    ('YAM', 'YAMAN ERGENEKON', 'YAM', 'AU', 83, 40, 29, 72, 61, 91, 57),
    ('PAZ', 'AHMET KARAHOCA', 'PAZ', 'TR', 62, 60, 48, 45, 44, 13, 37),
    ('NGIN', 'ENGIN KOR', 'NGIN', 'TR', 9, 42, 38, 19, 53, 2, 62)
)
INSERT INTO players (
  nickname, display_name, slug, country_id, career_status, overall,
  firepower, entrying, trading, opening, clutching, sniping, utility
)
SELECT
  player_data.nickname,
  player_data.display_name,
  player_data.slug,
  countries.id,
  'active',
  round((
    player_data.firepower + player_data.entrying + player_data.trading +
    player_data.opening + player_data.clutching + player_data.sniping +
    player_data.utility
  )::numeric / 7)::smallint,
  player_data.firepower,
  player_data.entrying,
  player_data.trading,
  player_data.opening,
  player_data.clutching,
  player_data.sniping,
  player_data.utility
FROM player_data
JOIN countries ON countries.code = player_data.country_code
ON CONFLICT (slug) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  display_name = EXCLUDED.display_name,
  country_id = EXCLUDED.country_id,
  overall = EXCLUDED.overall,
  firepower = EXCLUDED.firepower,
  entrying = EXCLUDED.entrying,
  trading = EXCLUDED.trading,
  opening = EXCLUDED.opening,
  clutching = EXCLUDED.clutching,
  sniping = EXCLUDED.sniping,
  utility = EXCLUDED.utility,
  updated_at = now();

DELETE FROM player_team_years
WHERE year = 2018
  AND (
    team_id IN (
      SELECT id
      FROM teams
      WHERE slug IN ('MIBR', 'NINJAS-IN-PYJAMAS', 'AVANGAR', 'RENEGADES', 'COMPLEXITY-GAMING', 'ROGUE', 'TYLOO', 'TEAM-SPIRIT', 'WINSTRIKE-TEAM', 'SPACE-SOLDIERS')
    )
    OR player_id IN (
      SELECT id
      FROM players
      WHERE slug IN ('FALLEN', 'TARIK', 'FER', 'COLDZERA', 'TACO', 'GET-RIGHT', 'DENNIS', 'LEKR0', 'REZ', 'BUSTER', 'QIKERT', 'JAME', 'JKS', 'AZR', 'GRATISFACTION', 'N0THING', 'SHAHZAM', 'STANISLAW', 'HIKO', 'TENZKI', 'MSL', 'SICK', 'VICE', 'ATTACKER', 'XCCURATE', 'DIMAONESHOT', 'SDY', 'WORLDEDIT', 'BOOMBL4', 'F0REST', 'FITCH', 'KRIZZEN', 'JKAEM', 'LIAZZ', 'DEPHH', 'RICKEH', 'BNTET', 'SOMEBODY', 'DAVCOST', 'COLDYY1', 'MAJ3R', 'CALYX', 'S0TF1K', 'WAYLANDER', 'KVIK', 'N0RB3R7', 'SUMMER', 'YAM', 'PAZ', 'NGIN')
    )
  );

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('MIBR', 'FALLEN'),
    ('MIBR', 'TARIK'),
    ('MIBR', 'FER'),
    ('MIBR', 'COLDZERA'),
    ('MIBR', 'TACO'),
    ('NINJAS-IN-PYJAMAS', 'GET-RIGHT'),
    ('NINJAS-IN-PYJAMAS', 'DENNIS'),
    ('NINJAS-IN-PYJAMAS', 'LEKR0'),
    ('NINJAS-IN-PYJAMAS', 'REZ'),
    ('AVANGAR', 'BUSTER'),
    ('AVANGAR', 'QIKERT'),
    ('AVANGAR', 'JAME'),
    ('RENEGADES', 'JKS'),
    ('RENEGADES', 'AZR'),
    ('RENEGADES', 'GRATISFACTION'),
    ('COMPLEXITY-GAMING', 'N0THING'),
    ('COMPLEXITY-GAMING', 'SHAHZAM'),
    ('COMPLEXITY-GAMING', 'STANISLAW'),
    ('ROGUE', 'HIKO'),
    ('ROGUE', 'TENZKI'),
    ('ROGUE', 'MSL'),
    ('ROGUE', 'SICK'),
    ('ROGUE', 'VICE'),
    ('TYLOO', 'ATTACKER'),
    ('TYLOO', 'XCCURATE'),
    ('TEAM-SPIRIT', 'DIMAONESHOT'),
    ('TEAM-SPIRIT', 'SDY'),
    ('WINSTRIKE-TEAM', 'WORLDEDIT'),
    ('WINSTRIKE-TEAM', 'BOOMBL4'),
    ('NINJAS-IN-PYJAMAS', 'F0REST'),
    ('AVANGAR', 'FITCH'),
    ('AVANGAR', 'KRIZZEN'),
    ('RENEGADES', 'JKAEM'),
    ('RENEGADES', 'LIAZZ'),
    ('COMPLEXITY-GAMING', 'DEPHH'),
    ('COMPLEXITY-GAMING', 'RICKEH'),
    ('TYLOO', 'BNTET'),
    ('TYLOO', 'SOMEBODY'),
    ('TEAM-SPIRIT', 'DAVCOST'),
    ('TEAM-SPIRIT', 'COLDYY1'),
    ('SPACE-SOLDIERS', 'MAJ3R'),
    ('SPACE-SOLDIERS', 'CALYX'),
    ('TEAM-SPIRIT', 'S0TF1K'),
    ('WINSTRIKE-TEAM', 'WAYLANDER'),
    ('WINSTRIKE-TEAM', 'KVIK'),
    ('WINSTRIKE-TEAM', 'N0RB3R7'),
    ('TYLOO', 'SUMMER'),
    ('SPACE-SOLDIERS', 'YAM'),
    ('SPACE-SOLDIERS', 'PAZ'),
    ('SPACE-SOLDIERS', 'NGIN')
)
INSERT INTO player_team_years (player_id, team_id, year)
SELECT players.id, teams.id, 2018
FROM lineup_data
JOIN players ON players.slug = lineup_data.player_slug
JOIN teams ON teams.slug = lineup_data.team_slug
ON CONFLICT (player_id, team_id, year) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS player_team_years_one_team_2018_idx
  ON player_team_years(player_id)
  WHERE year = 2018;

DO $$
DECLARE
  invalid_team_count integer;
  duplicate_player_count integer;
BEGIN
  SELECT count(*) INTO invalid_team_count
  FROM (
    SELECT teams.id
    FROM teams
    LEFT JOIN player_team_years
      ON player_team_years.team_id = teams.id
      AND player_team_years.year = 2018
    WHERE teams.slug IN ('MIBR', 'NINJAS-IN-PYJAMAS', 'AVANGAR', 'RENEGADES', 'COMPLEXITY-GAMING', 'ROGUE', 'TYLOO', 'TEAM-SPIRIT', 'WINSTRIKE-TEAM', 'SPACE-SOLDIERS')
    GROUP BY teams.id
    HAVING count(player_team_years.id) <> 5
  ) invalid_teams;

  SELECT count(*) INTO duplicate_player_count
  FROM (
    SELECT player_id
    FROM player_team_years
    WHERE year = 2018
    GROUP BY player_id
    HAVING count(*) > 1
  ) duplicate_players;

  IF invalid_team_count > 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2018 sem exatamente cinco jogadores', invalid_team_count;
  END IF;

  IF duplicate_player_count > 0 THEN
    RAISE EXCEPTION 'Existem % jogadores vinculados a mais de um time em 2018', duplicate_player_count;
  END IF;
END
$$;

