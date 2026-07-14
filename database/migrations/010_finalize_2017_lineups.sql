-- Fotografia das lineups que fecharam 2017.
-- Fonte principal: ultimo ranking historico da HLTV no ano, em 25/12/2017.
-- https://www.hltv.org/ranking/teams/2017/december/25/8125
--
-- Cada jogador fica vinculado a exatamente uma equipe em 2017. IMMORTALS
-- terminou o ultimo registro de dezembro com apenas quatro nomes e PENTA
-- ja nao mantinha um elenco completo sob a organizacao; por isso ambas
-- permanecem sem lineup de 2017.

-- Cadastros necessarios para completar os quintetos de dezembro. As skills
-- sao globais no modelo atual (nao pertencem ao vinculo anual), entao estes
-- seis novos jogadores usam os atributos Both Sides de seus perfis na HLTV.
WITH player_data (
  nickname, display_name, slug, country_code, career_status,
  firepower, entrying, trading, opening, clutching, sniping, utility
) AS (
  VALUES
    ('GOLDEN', 'MAIKIL SELIM', 'GOLDEN', 'SE', 'inactive', 28, 47, 26, 35, 43, 1, 74),
    ('FRIBERG', 'ADAM FRIBERG', 'FRIBERG', 'SE', 'active', 44, 18, 12, 49, 34, 0, 45),
    ('XMS', 'ALEXANDRE FORTÉ', 'XMS', 'FR', 'inactive', 45, 72, 40, 43, 39, 1, 40),
    ('FEJTZ', 'KRISTJAN ALLSAAR', 'FEJTZ', 'EE', 'active', 75, 33, 65, 43, 51, 39, 41),
    ('FREDDIEB', 'FREDRIK BUÖ', 'FREDDIEB', 'SE', 'inactive', 66, 28, 19, 57, 47, 2, 59),
    ('HAMPUS', 'HAMPUS POSER', 'HAMPUS', 'SE', 'active', 70, 27, 17, 70, 41, 6, 62)
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
  player_data.career_status,
  round((
    player_data.firepower + player_data.entrying + player_data.trading +
    player_data.opening + player_data.clutching + player_data.sniping +
    player_data.utility
  ) / 7.0)::smallint,
  player_data.firepower,
  player_data.entrying,
  player_data.trading,
  player_data.opening,
  player_data.clutching,
  player_data.sniping,
  player_data.utility
FROM player_data
JOIN countries ON countries.code = player_data.country_code
ON CONFLICT (slug) DO NOTHING;

DELETE FROM player_team_years WHERE year = 2017;

CREATE UNIQUE INDEX IF NOT EXISTS player_team_years_one_team_2017_idx
  ON player_team_years(player_id)
  WHERE year = 2017;

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('SK-GAMING', 'FALLEN'),
    ('SK-GAMING', 'FER'),
    ('SK-GAMING', 'BOLTZ'),
    ('SK-GAMING', 'COLDZERA'),
    ('SK-GAMING', 'TACO'),
    ('FAZE-CLAN', 'KARRIGAN'),
    ('FAZE-CLAN', 'OLOFMEISTER'),
    ('FAZE-CLAN', 'GUARDIAN'),
    ('FAZE-CLAN', 'NIKO'),
    ('FAZE-CLAN', 'RAIN'),
    ('ASTRALIS', 'XYP9X'),
    ('ASTRALIS', 'DUPREEH'),
    ('ASTRALIS', 'GLA1VE'),
    ('ASTRALIS', 'DEVICE'),
    ('ASTRALIS', 'KJAERBYE'),
    ('CLOUD9', 'SKADOODLE'),
    ('CLOUD9', 'RUSH'),
    ('CLOUD9', 'TARIK'),
    ('CLOUD9', 'AUTIMATIC'),
    ('CLOUD9', 'STEWIE2K'),
    ('FNATIC', 'FLUSHA'),
    ('FNATIC', 'JW'),
    ('FNATIC', 'KRIMZ'),
    ('FNATIC', 'LEKR0'),
    ('FNATIC', 'GOLDEN'),
    ('G2-ESPORTS', 'SHOX'),
    ('G2-ESPORTS', 'KENNYS'),
    ('G2-ESPORTS', 'NBK'),
    ('G2-ESPORTS', 'APEX'),
    ('G2-ESPORTS', 'BODYY'),
    ('MOUZ', 'OSKAR'),
    ('MOUZ', 'CHRISJ'),
    ('MOUZ', 'SUNNY'),
    ('MOUZ', 'STYKO'),
    ('MOUZ', 'ROPZ'),
    ('NORTH', 'CAJUNB'),
    ('NORTH', 'MSL'),
    ('NORTH', 'AIZY'),
    ('NORTH', 'VALDE'),
    ('NORTH', 'K0NFIG'),
    ('VIRTUS-PRO', 'TAZ'),
    ('VIRTUS-PRO', 'NEO'),
    ('VIRTUS-PRO', 'PASHABICEPS'),
    ('VIRTUS-PRO', 'SNAX'),
    ('VIRTUS-PRO', 'BYALI'),
    ('OPTIC-GAMING', 'ALLU'),
    ('OPTIC-GAMING', 'FRIBERG'),
    ('OPTIC-GAMING', 'MIXWELL'),
    ('OPTIC-GAMING', 'HS'),
    ('OPTIC-GAMING', 'MAGISK'),
    ('GAMBIT', 'ADREN'),
    ('GAMBIT', 'DOSIA'),
    ('GAMBIT', 'MOU'),
    ('GAMBIT', 'HOBBIT'),
    ('GAMBIT', 'FITCH'),
    ('TEAM-ENVYUS', 'SIXER'),
    ('TEAM-ENVYUS', 'RPK'),
    ('TEAM-ENVYUS', 'SCREAM'),
    ('TEAM-ENVYUS', 'HAPPY'),
    ('TEAM-ENVYUS', 'XMS'),
    ('NATUS-VINCERE', 'EDWARD'),
    ('NATUS-VINCERE', 'ZEUS'),
    ('NATUS-VINCERE', 'FLAMIE'),
    ('NATUS-VINCERE', 'S1MPLE'),
    ('NATUS-VINCERE', 'ELECTRONIC'),
    ('TEAM-LIQUID', 'STEEL'),
    ('TEAM-LIQUID', 'NITR0'),
    ('TEAM-LIQUID', 'JDM64'),
    ('TEAM-LIQUID', 'ELIGE'),
    ('TEAM-LIQUID', 'TWISTZZ'),
    ('HELLRAISERS', 'ANGE1'),
    ('HELLRAISERS', 'FEJTZ'),
    ('HELLRAISERS', 'WOXIC'),
    ('HELLRAISERS', 'DEADFOX'),
    ('HELLRAISERS', 'ISSAA'),
    ('BIG', 'GOB-B'),
    ('BIG', 'LEGIJA'),
    ('BIG', 'TABSEN'),
    ('BIG', 'KEEV'),
    ('BIG', 'NEX'),
    ('VEGA-SQUADRON', 'CHOPPER'),
    ('VEGA-SQUADRON', 'JR'),
    ('VEGA-SQUADRON', 'KESHANDR'),
    ('VEGA-SQUADRON', 'MIR'),
    ('VEGA-SQUADRON', 'HUTJI'),
    ('GODSENT', 'TWIST'),
    ('GODSENT', 'DISCO-DOPLAN'),
    ('GODSENT', 'FREDDIEB'),
    ('GODSENT', 'HAMPUS'),
    ('GODSENT', 'BROLLAN'),
    ('FLIPSID3-TACTICS', 'MARKELOFF'),
    ('FLIPSID3-TACTICS', 'B1AD3'),
    ('FLIPSID3-TACTICS', 'SEIZED'),
    ('FLIPSID3-TACTICS', 'WORLDEDIT'),
    ('FLIPSID3-TACTICS', 'WAYLANDER')
)
INSERT INTO player_team_years (player_id, team_id, year)
SELECT players.id, teams.id, 2017
FROM lineup_data
JOIN players ON players.slug = lineup_data.player_slug
JOIN teams ON teams.slug = lineup_data.team_slug;

DO $$
DECLARE
  invalid_team_count integer;
  duplicate_player_count integer;
  incomplete_source_team_count integer;
  link_count integer;
BEGIN
  SELECT count(*) INTO invalid_team_count
  FROM (
    SELECT teams.id
    FROM teams
    LEFT JOIN player_team_years
      ON player_team_years.team_id = teams.id
      AND player_team_years.year = 2017
    WHERE teams.slug IN (
      'SK-GAMING', 'FAZE-CLAN', 'ASTRALIS', 'CLOUD9', 'FNATIC',
      'G2-ESPORTS', 'MOUZ', 'NORTH', 'VIRTUS-PRO', 'OPTIC-GAMING',
      'GAMBIT', 'TEAM-ENVYUS', 'NATUS-VINCERE', 'TEAM-LIQUID',
      'HELLRAISERS', 'BIG', 'VEGA-SQUADRON', 'GODSENT',
      'FLIPSID3-TACTICS'
    )
    GROUP BY teams.id
    HAVING count(player_team_years.id) <> 5
  ) invalid_teams;

  SELECT count(*) INTO duplicate_player_count
  FROM (
    SELECT player_id
    FROM player_team_years
    WHERE year = 2017
    GROUP BY player_id
    HAVING count(*) > 1
  ) duplicate_players;

  SELECT count(*) INTO incomplete_source_team_count
  FROM player_team_years
  JOIN teams ON teams.id = player_team_years.team_id
  WHERE player_team_years.year = 2017
    AND teams.slug IN ('IMMORTALS', 'PENTA-SPORTS');

  SELECT count(*) INTO link_count
  FROM player_team_years
  WHERE year = 2017;

  IF invalid_team_count > 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2017 sem exatamente cinco jogadores', invalid_team_count;
  END IF;
  IF duplicate_player_count > 0 THEN
    RAISE EXCEPTION 'Existem % jogadores vinculados a mais de um time em 2017', duplicate_player_count;
  END IF;
  IF incomplete_source_team_count > 0 THEN
    RAISE EXCEPTION 'IMMORTALS ou PENTA recebeu vinculo indevido em 2017';
  END IF;
  IF link_count <> 95 THEN
    RAISE EXCEPTION 'Quantidade inesperada de vinculos em 2017: %', link_count;
  END IF;
END
$$;
