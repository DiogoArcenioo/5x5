-- Fotografia das lineups que fecharam 2019.
-- Fonte principal: ranking historico da HLTV em 30/12/2019.
-- https://www.hltv.org/ranking/teams/2019/december/30
--
-- COMPLEXITY usa o quinteto anunciado em 06/11/2019:
-- https://www.hltv.org/news/28328/complexity-sign-k0nfig-poizon
--
-- CLOUD9, TYLOO, VEGA SQUADRON, AVANGAR, GRAYHOUND e NRG nao tinham
-- um quinteto completo sob a organizacao no ultimo snapshot do ano e
-- permanecem sem lineup de 2019. Cada jogador fica em apenas um time.
-- As skills dos novos jogadores sao os atributos Both Sides dos perfis HLTV.

WITH player_data (
  nickname, display_name, slug, country_code,
  firepower, entrying, trading, opening, clutching, sniping, utility
) AS (
  VALUES
    ('FROZEN', 'DAVID ČERŇANSKÝ', 'FROZEN', 'SK', 86, 36, 49, 56, 60, 4, 62),
    ('ALEX', 'ALEX MCMEEKIN', 'ALEX', 'GB', 68, 46, 23, 61, 36, 3, 55),
    ('ZYWOO', 'MATHIEU HERBAUT', 'ZYWOO', 'FR', 98, 42, 55, 88, 79, 87, 62),
    ('BROKY', 'HELVIJS SAUKANTS', 'BROKY', 'LV', 62, 42, 59, 37, 71, 89, 64),
    ('PLOPSKI', 'NICOLAS GONZALEZ ZAMORA', 'PLOPSKI', 'SE', 67, 55, 54, 51, 50, 0, 52),
    ('HUNTER-', 'NEMANJA KOVAČ', 'HUNTER', 'BA', 86, 47, 50, 59, 45, 0, 73),
    ('AMANEK', 'FRANÇOIS DELAUNAY', 'AMANEK', 'FR', 56, 39, 32, 40, 65, 16, 67),
    ('NEXA', 'NEMANJA ISAKOVIĆ', 'NEXA', 'RS', 59, 51, 54, 21, 61, 0, 60),
    ('AERIAL', 'JANI JUSSILA', 'AERIAL', 'FI', 71, 64, 53, 64, 37, 0, 48),
    ('XSEVEN', 'SAMI LAASANEN', 'XSEVEN', 'FI', 63, 31, 22, 47, 48, 2, 76),
    ('SERGEJ', 'JERE SALO', 'SERGEJ', 'FI', 79, 44, 51, 52, 55, 11, 43),
    ('FACECRACK', 'DMITRIY ALEKSEYEV', 'FACECRACK', 'RU', 68, 54, 17, 68, 28, 0, 30),
    ('ALMAZER', 'ALMAZ ASADULLIN', 'ALMAZER', 'RU', 57, 51, 36, 39, 43, 8, 37),
    ('FL1T', 'EVGENII LEBEDEV', 'FL1T', 'RU', 78, 30, 46, 46, 53, 3, 58),
    ('XSEPOWER', 'BOGDAN CHERNIKOV', 'XSEPOWER', 'RU', 65, 8, 21, 86, 76, 96, 55),
    ('JERRY', 'ANDREY MEKHRYAKOV', 'JERRY', 'RU', 59, 58, 29, 56, 38, 1, 54),
    ('ART', 'ANDREI PIOVEZAN', 'ART', 'BR', 64, 50, 10, 87, 28, 38, 58),
    ('YUURIH', 'YURI SANTOS', 'YUURIH', 'BR', 79, 33, 51, 41, 55, 1, 72),
    ('VINI', 'VINICIUS FIGUEIREDO', 'VINI', 'BR', 47, 55, 26, 42, 46, 0, 64),
    ('KSCERATO', 'KAIKE CERATO', 'KSCERATO', 'BR', 81, 22, 45, 40, 75, 2, 82),
    ('MEYERN', 'IGNACIO MEYER', 'MEYERN', 'AR', 60, 55, 67, 46, 62, 16, 47),
    ('EMI', 'LUKA VUKOVIĆ', 'EMI', 'RS', 34, 76, 19, 45, 32, 0, 82),
    ('LETN1', 'NESTOR TANIĆ', 'LETN1', 'RS', 52, 38, 32, 48, 47, 10, 58),
    ('OTTOND', 'OTTO SIHVO', 'OTTOND', 'FI', 72, 28, 51, 70, 59, 93, 48),
    ('SHIPZ', 'GEORGI GRIGOROV', 'SHIPZ', 'BG', 82, 37, 35, 69, 48, 10, 47),
    ('ESPIRANTO', 'ROKAS MILASAUSKAS', 'ESPIRANTO', 'LT', 81, 51, 40, 73, 39, 15, 29),
    ('SICO', 'SIMON WILLIAMS', 'SICO', 'NZ', 77, 22, 42, 59, 58, 85, 75),
    ('DEXTER', 'CHRISTOPHER NONG', 'DEXTER', 'AU', 77, 33, 25, 74, 40, 4, 80),
    ('INS', 'JOSHUA POTTER', 'INS', 'AU', 89, 42, 26, 69, 53, 4, 83),
    ('MALTA', 'LIAM SCHEMBRI', 'MALTA', 'AU', 68, 39, 18, 50, 46, 1, 59),
    ('DICKSTACY', 'OLLIE TIERNEY', 'DICKSTACY', 'AU', 56, 75, 20, 53, 39, 0, 59),
    ('IDISBALANCE', 'ARTEM EGOROV', 'IDISBALANCE', 'RU', 56, 25, 33, 72, 53, 93, 44),
    ('MAGIXX', 'BORIS VOROBIEV', 'MAGIXX', 'RU', 36, 66, 32, 36, 48, 3, 56),
    ('RAMZ1KBO$$', 'RAMAZAN BASHIZOV', 'RAMZ1KBOSS', 'KZ', 76, 10, 23, 87, 53, 91, 12),
    ('NEALAN', 'SANZHAR ISKHAKOV', 'NEALAN', 'KZ', 45, 41, 25, 53, 40, 0, 69),
    ('KEOZ', 'NICOLAS DGUS', 'KEOZ', 'BE', 52, 66, 35, 56, 34, 5, 55),
    ('PERFECTO', 'ILYA ZALUTSKIY', 'PERFECTO', 'RU', 35, 41, 45, 19, 68, 1, 71),
    ('XAND', 'ALEXANDRE ZIZI', 'XAND', 'BR', 81, 54, 41, 51, 46, 2, 44),
    ('YEL', 'GUSTAVO KNITTEL', 'YEL', 'BR', 48, 35, 25, 69, 54, 88, 59),
    ('CHELO', 'MARCELO CESPEDES', 'CHELO', 'BR', 64, 59, 25, 71, 46, 3, 45),
    ('SHZ', 'BRUNO MARTINELLI', 'SHZ', 'BR', 66, 42, 52, 33, 48, 0, 35),
    ('ADVENT', 'ZHUO LIANG', 'ADVENT', 'CN', 8, 70, 45, 16, 45, 0, 72),
    ('ZHOKING', 'WEIJIE ZHONG', 'ZHOKING', 'CN', 88, 84, 26, 87, 25, 0, 32),
    ('AUMAN', 'ZHIHONG LIU', 'AUMAN', 'CN', 75, 20, 16, 57, 49, 3, 85),
    ('KAZE', 'ANDREW KHONG', 'KAZE', 'MY', 78, 21, 43, 57, 79, 92, 59),
    ('JAMYOUNG', 'YI YANG', 'JAMYOUNG', 'CN', 87, 53, 54, 59, 63, 1, 56),
    ('FLARICH', 'VADIM KARETIN', 'FLARICH', 'BY', 60, 19, 54, 24, 77, 0, 49),
    ('NUKKYE', 'ŽYGIMANTAS CHMIELIAUSKAS', 'NUKKYE', 'LT', 75, 25, 43, 50, 60, 31, 55),
    ('SCOOBYXIE', 'ALEXANDER MARYNYCH', 'SCOOBYXIE', 'UA', 74, 23, 41, 37, 66, 5, 31),
    ('LACK1', 'VIKTOR BOLDYREV', 'LACK1', 'KZ', 55, 48, 21, 65, 39, 5, 46),
    ('EL1AN', 'ALEKSEI GUSEV', 'EL1AN', 'RU', 76, 6, 23, 79, 69, 95, 54),
    ('BLAMEF', 'BENJAMIN BREMER', 'BLAMEF', 'DK', 91, 11, 44, 73, 75, 0, 69),
    ('OBO', 'OWEN SCHLATTER', 'OBO', 'US', 72, 67, 45, 43, 38, 0, 46),
    ('POIZON', 'VALENTIN VASILEV', 'POIZON', 'BG', 79, 23, 45, 79, 67, 93, 61),
    ('CHEHOL', 'NIKITA SADOVSKY', 'CHEHOL', 'RU', 35, 57, 40, 42, 32, 0, 36),
    ('MINSE', 'VLADISLAV KUZMINYKH', 'MINSE', 'RU', 44, 19, 39, 31, 53, 5, 19),
    ('KAS9K', 'DENIS GRISHECHKIN', 'KAS9K', 'RU', 44, 11, 25, 58, 65, 93, 46),
    ('JACKPOT', 'VLADIMIR DYAKONOV', 'JACKPOT', 'RU', 30, 35, 29, 54, 39, 1, 75),
    ('QUANTIUM', 'SERGEY MALCHENKO', 'QUANTIUM', 'RU', 12, 49, 39, 33, 36, 0, 42)
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

DELETE FROM player_team_years WHERE year = 2019;

CREATE UNIQUE INDEX IF NOT EXISTS player_team_years_one_team_2019_idx
  ON player_team_years(player_id)
  WHERE year = 2019;

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('ASTRALIS', 'XYP9X'), ('ASTRALIS', 'DUPREEH'), ('ASTRALIS', 'GLA1VE'), ('ASTRALIS', 'DEVICE'), ('ASTRALIS', 'MAGISK'),
    ('MOUZ', 'KARRIGAN'), ('MOUZ', 'CHRISJ'), ('MOUZ', 'WOXIC'), ('MOUZ', 'FROZEN'), ('MOUZ', 'ROPZ'),
    ('FNATIC', 'FLUSHA'), ('FNATIC', 'JW'), ('FNATIC', 'KRIMZ'), ('FNATIC', 'GOLDEN'), ('FNATIC', 'BROLLAN'),
    ('TEAM-LIQUID', 'NITR0'), ('TEAM-LIQUID', 'NAF'), ('TEAM-LIQUID', 'ELIGE'), ('TEAM-LIQUID', 'STEWIE2K'), ('TEAM-LIQUID', 'TWISTZZ'),
    ('TEAM-VITALITY', 'SHOX'), ('TEAM-VITALITY', 'RPK'), ('TEAM-VITALITY', 'APEX'), ('TEAM-VITALITY', 'ALEX'), ('TEAM-VITALITY', 'ZYWOO'),
    ('FAZE-CLAN', 'OLOFMEISTER'), ('FAZE-CLAN', 'NIKO'), ('FAZE-CLAN', 'RAIN'), ('FAZE-CLAN', 'COLDZERA'), ('FAZE-CLAN', 'BROKY'),
    ('NATUS-VINCERE', 'GUARDIAN'), ('NATUS-VINCERE', 'FLAMIE'), ('NATUS-VINCERE', 'S1MPLE'), ('NATUS-VINCERE', 'ELECTRONIC'), ('NATUS-VINCERE', 'BOOMBL4'),
    ('NINJAS-IN-PYJAMAS', 'F0REST'), ('NINJAS-IN-PYJAMAS', 'TWIST'), ('NINJAS-IN-PYJAMAS', 'LEKR0'), ('NINJAS-IN-PYJAMAS', 'REZ'), ('NINJAS-IN-PYJAMAS', 'PLOPSKI'),
    ('G2-ESPORTS', 'JACKZ'), ('G2-ESPORTS', 'HUNTER'), ('G2-ESPORTS', 'KENNYS'), ('G2-ESPORTS', 'AMANEK'), ('G2-ESPORTS', 'NEXA'),
    ('ENCE', 'ALLU'), ('ENCE', 'AERIAL'), ('ENCE', 'SUNNY'), ('ENCE', 'XSEVEN'), ('ENCE', 'SERGEJ'),
    ('FORZE', 'FACECRACK'), ('FORZE', 'ALMAZER'), ('FORZE', 'FL1T'), ('FORZE', 'XSEPOWER'), ('FORZE', 'JERRY'),
    ('FURIA-ESPORTS', 'HEN1'), ('FURIA-ESPORTS', 'ART'), ('FURIA-ESPORTS', 'YUURIH'), ('FURIA-ESPORTS', 'VINI'), ('FURIA-ESPORTS', 'KSCERATO'),
    ('MIBR', 'FALLEN'), ('MIBR', 'KNGV'), ('MIBR', 'FER'), ('MIBR', 'TACO'), ('MIBR', 'MEYERN'),
    ('CR4ZY', 'EMI'), ('CR4ZY', 'LETN1'), ('CR4ZY', 'OTTOND'), ('CR4ZY', 'SHIPZ'), ('CR4ZY', 'ESPIRANTO'),
    ('NORTH', 'CAJUNB'), ('NORTH', 'AIZY'), ('NORTH', 'KJAERBYE'), ('NORTH', 'JUGI'), ('NORTH', 'GADE'),
    ('RENEGADES', 'SICO'), ('RENEGADES', 'DEXTER'), ('RENEGADES', 'INS'), ('RENEGADES', 'MALTA'), ('RENEGADES', 'DICKSTACY'),
    ('BIG', 'TABSEN'), ('BIG', 'TIZIAN'), ('BIG', 'NEX'), ('BIG', 'XANTARES'), ('BIG', 'SMOOYA'),
    ('TEAM-SPIRIT', 'CHOPPER'), ('TEAM-SPIRIT', 'MIR'), ('TEAM-SPIRIT', 'SDY'), ('TEAM-SPIRIT', 'IDISBALANCE'), ('TEAM-SPIRIT', 'MAGIXX'),
    ('SYMAN-GAMING', 'RAMZ1KBOSS'), ('SYMAN-GAMING', 'NEALAN'), ('SYMAN-GAMING', 'KEOZ'), ('SYMAN-GAMING', 'N0RB3R7'), ('SYMAN-GAMING', 'PERFECTO'),
    ('INTZ-ESPORTS', 'BOLTZ'), ('INTZ-ESPORTS', 'XAND'), ('INTZ-ESPORTS', 'YEL'), ('INTZ-ESPORTS', 'CHELO'), ('INTZ-ESPORTS', 'SHZ'),
    ('VICI-GAMING', 'ADVENT'), ('VICI-GAMING', 'ZHOKING'), ('VICI-GAMING', 'AUMAN'), ('VICI-GAMING', 'KAZE'), ('VICI-GAMING', 'JAMYOUNG'),
    ('HELLRAISERS', 'ANGE1'), ('HELLRAISERS', 'CRUSH'), ('HELLRAISERS', 'FLARICH'), ('HELLRAISERS', 'NUKKYE'), ('HELLRAISERS', 'SCOOBYXIE'),
    ('WINSTRIKE-TEAM', 'BONDIK'), ('WINSTRIKE-TEAM', 'HOBBIT'), ('WINSTRIKE-TEAM', 'KRIZZEN'), ('WINSTRIKE-TEAM', 'LACK1'), ('WINSTRIKE-TEAM', 'EL1AN'),
    ('COMPLEXITY-GAMING', 'BLAMEF'), ('COMPLEXITY-GAMING', 'RUSH'), ('COMPLEXITY-GAMING', 'K0NFIG'), ('COMPLEXITY-GAMING', 'OBO'), ('COMPLEXITY-GAMING', 'POIZON'),
    ('DREAMEATERS', 'CHEHOL'), ('DREAMEATERS', 'MINSE'), ('DREAMEATERS', 'KAS9K'), ('DREAMEATERS', 'JACKPOT'), ('DREAMEATERS', 'QUANTIUM')
)
INSERT INTO player_team_years (player_id, team_id, year)
SELECT players.id, teams.id, 2019
FROM lineup_data
JOIN players ON players.slug = lineup_data.player_slug
JOIN teams ON teams.slug = lineup_data.team_slug;

DO $$
DECLARE
  invalid_team_count integer;
  duplicate_player_count integer;
  excluded_team_link_count integer;
  link_count integer;
BEGIN
  SELECT count(*) INTO invalid_team_count
  FROM (
    SELECT teams.id
    FROM teams
    LEFT JOIN player_team_years
      ON player_team_years.team_id = teams.id
      AND player_team_years.year = 2019
    WHERE teams.slug IN (
      'ASTRALIS', 'MOUZ', 'FNATIC', 'TEAM-LIQUID', 'TEAM-VITALITY',
      'FAZE-CLAN', 'NATUS-VINCERE', 'NINJAS-IN-PYJAMAS', 'G2-ESPORTS',
      'ENCE', 'FORZE', 'FURIA-ESPORTS', 'MIBR', 'CR4ZY', 'NORTH',
      'RENEGADES', 'BIG', 'TEAM-SPIRIT', 'SYMAN-GAMING', 'INTZ-ESPORTS',
      'VICI-GAMING', 'HELLRAISERS', 'WINSTRIKE-TEAM',
      'COMPLEXITY-GAMING', 'DREAMEATERS'
    )
    GROUP BY teams.id
    HAVING count(player_team_years.id) <> 5
  ) invalid_teams;

  SELECT count(*) INTO duplicate_player_count
  FROM (
    SELECT player_id
    FROM player_team_years
    WHERE year = 2019
    GROUP BY player_id
    HAVING count(*) > 1
  ) duplicate_players;

  SELECT count(*) INTO excluded_team_link_count
  FROM player_team_years
  JOIN teams ON teams.id = player_team_years.team_id
  WHERE player_team_years.year = 2019
    AND teams.slug IN (
      'CLOUD9', 'TYLOO', 'VEGA-SQUADRON', 'AVANGAR',
      'GRAYHOUND-GAMING', 'NRG-ESPORTS'
    );

  SELECT count(*) INTO link_count
  FROM player_team_years
  WHERE year = 2019;

  IF invalid_team_count > 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2019 sem exatamente cinco jogadores', invalid_team_count;
  END IF;
  IF duplicate_player_count > 0 THEN
    RAISE EXCEPTION 'Existem % jogadores vinculados a mais de um time em 2019', duplicate_player_count;
  END IF;
  IF excluded_team_link_count > 0 THEN
    RAISE EXCEPTION 'Uma organizacao sem quinteto final recebeu vinculo em 2019';
  END IF;
  IF link_count <> 125 THEN
    RAISE EXCEPTION 'Quantidade inesperada de vinculos em 2019: %', link_count;
  END IF;
END
$$;
