-- Snapshot completo das lineups que fecharam 2018.
-- Fonte das equipes: ranking historico da HLTV em 31/12/2018.
-- https://www.hltv.org/ranking/teams/2018/december/31/5378
-- Atributos: paginas individuais da HLTV filtradas entre 2018-01-01 e
-- 2018-12-31, Both Sides.
--
-- Para manter cinco jogadores exclusivos por equipe, foram usadas as
-- ultimas formacoes completas. No caso da ENVY, SEMPHIS ocupa a vaga do
-- emprestado KARRIGAN, que permanece na FAZE. Organizacoes sem elenco
-- completo/exclusivo no fim do ano permanecem sem lineup de 2018.

WITH player_data (
  nickname, display_name, slug, country_code,
  firepower, entrying, trading, opening, clutching, sniping, utility
) AS (
  VALUES
    ('XYP9X', 'ANDREAS HØJSLETH', 'XYP9X', 'DK', 63, 23, 30, 28, 82, 0, 80),
    ('DUPREEH', 'PETER RASMUSSEN', 'DUPREEH', 'DK', 82, 56, 17, 75, 32, 10, 35),
    ('GLA1VE', 'LUKAS ROSSANDER', 'GLA1VE', 'DK', 66, 44, 15, 45, 53, 3, 93),
    ('DEVICE', 'NICOLAI REEDTZ', 'DEVICE', 'DK', 92, 14, 17, 73, 48, 92, 59),
    ('MAGISK', 'EMIL REIF', 'MAGISK', 'DK', 76, 38, 32, 61, 35, 1, 52),
    ('EDWARD', 'IOANN SUKHARIEV', 'EDWARD', 'UA', 35, 50, 32, 45, 42, 0, 37),
    ('ZEUS', 'DANYLO TESLENKO', 'ZEUS', 'UA', 16, 56, 19, 32, 40, 0, 81),
    ('FLAMIE', 'EGOR VASILYEV', 'FLAMIE', 'RU', 71, 43, 33, 62, 41, 16, 32),
    ('S1MPLE', 'OLEKSANDR KOSTYLIEV', 'S1MPLE', 'UA', 99, 16, 51, 73, 89, 92, 45),
    ('ELECTRONIC', 'DENIS SHARIPOV', 'ELECTRONIC', 'RU', 91, 50, 41, 55, 61, 0, 57),
    ('NITR0', 'NICK CANNELLA', 'NITR0', 'US', 50, 57, 35, 55, 53, 69, 80),
    ('NAF', 'KEITH MARKOVIC', 'NAF', 'CA', 84, 40, 58, 46, 64, 11, 82),
    ('ELIGE', 'JONATHAN JABLONOWSKI', 'ELIGE', 'US', 85, 63, 51, 68, 30, 0, 54),
    ('STEWIE2K', 'JAKE YIP', 'STEWIE2K', 'US', 68, 56, 14, 80, 39, 14, 78),
    ('TWISTZZ', 'RUSSEL VAN DULKEN', 'TWISTZZ', 'CA', 79, 61, 70, 34, 58, 6, 56),
    ('FALLEN', 'GABRIEL TOLEDO', 'FALLEN', 'BR', 53, 25, 26, 38, 51, 93, 70),
    ('TARIK', 'TARIK CELIK', 'TARIK', 'US', 75, 53, 42, 70, 55, 9, 53),
    ('FER', 'FERNANDO ALVARENGA', 'FER', 'BR', 79, 46, 13, 85, 29, 1, 46),
    ('COLDZERA', 'MARCELO DAVID', 'COLDZERA', 'BR', 87, 17, 53, 30, 69, 24, 52),
    ('TACO', 'EPITACIO DE MELO', 'TACO', 'BR', 24, 33, 12, 58, 53, 6, 48),
    ('OSKAR', 'TOMÁŠ ŠŤASTNÝ', 'OSKAR', 'CZ', 79, 14, 20, 65, 60, 94, 53),
    ('CHRISJ', 'CHRIS DE JONG', 'CHRISJ', 'NL', 49, 55, 15, 61, 33, 63, 49),
    ('SUNNY', 'MIIKKA KEMPPI', 'SUNNY', 'FI', 83, 40, 26, 73, 35, 0, 60),
    ('STYKO', 'MARTIN STYK', 'STYKO', 'SK', 23, 47, 42, 20, 59, 1, 70),
    ('ROPZ', 'ROBIN KOOL', 'ROPZ', 'EE', 65, 11, 36, 45, 55, 1, 28),
    ('OLOFMEISTER', 'OLOF KAJBJER', 'OLOFMEISTER', 'SE', 57, 28, 28, 40, 53, 10, 44),
    ('GUARDIAN', 'LADISLAV KOVÁCS', 'GUARDIAN', 'SK', 65, 20, 29, 60, 67, 95, 49),
    ('NIKO', 'NIKOLA KOVAČ', 'NIKO', 'BA', 94, 23, 46, 54, 62, 14, 61),
    ('RAIN', 'HÅVARD NYGAARD', 'RAIN', 'NO', 70, 70, 28, 73, 34, 0, 32),
    ('KARRIGAN', 'FINN ANDERSEN', 'KARRIGAN', 'DK', 23, 39, 18, 30, 43, 2, 77),
    ('F0REST', 'PATRIK LINDBERG', 'F0REST', 'SE', 68, 28, 50, 51, 51, 11, 39),
    ('GET_RIGHT', 'CHRISTOPHER ALESUND', 'GET-RIGHT', 'SE', 42, 25, 13, 42, 49, 0, 67),
    ('DENNIS', 'DENNIS EDMAN', 'DENNIS', 'SE', 65, 30, 34, 52, 42, 12, 56),
    ('LEKR0', 'JONAS OLOFSSON', 'LEKR0', 'SE', 59, 37, 28, 50, 60, 10, 44),
    ('REZ', 'FREDRIK STERNER', 'REZ', 'SE', 66, 45, 21, 62, 49, 7, 57),
    ('XIZT', 'RICHARD LANDSTRÖM', 'XIZT', 'SE', 21, 43, 44, 23, 48, 0, 69),
    ('JW', 'JESPER WECKSELL', 'JW', 'SE', 68, 22, 10, 75, 42, 58, 38),
    ('TWIST', 'SIMON ELIASSON', 'TWIST', 'SE', 72, 37, 36, 50, 61, 88, 68),
    ('KRIMZ', 'FREDDY JOHANSSON', 'KRIMZ', 'SE', 84, 12, 50, 46, 55, 3, 51),
    ('BROLLAN', 'LUDVIG BROLIN', 'BROLLAN', 'SE', 76, 60, 38, 70, 59, 0, 35),
    ('CADIAN', 'CASPER MØLLER', 'CADIAN', 'DK', 59, 34, 24, 55, 62, 93, 69),
    ('AIZY', 'PHILIP AISTRUP', 'AIZY', 'DK', 53, 39, 35, 36, 75, 4, 64),
    ('KJAERBYE', 'MARKUS KJÆRBYE', 'KJAERBYE', 'DK', 78, 48, 50, 67, 39, 0, 61),
    ('GADE', 'NICKLAS GADE', 'GADE', 'DK', 40, 58, 42, 52, 55, 0, 32),
    ('VALDE', 'VALDEMAR BJØRN VANGSÅ', 'VALDE', 'DK', 85, 44, 55, 26, 59, 0, 75),
    ('GOB B', 'FATIH DAYIK', 'GOB-B', 'DE', 23, 49, 34, 40, 44, 4, 94),
    ('TABSEN', 'JOHANNES WODARZ', 'TABSEN', 'DE', 95, 50, 23, 80, 32, 59, 88),
    ('TIZIAN', 'TIZIAN FELDBUSCH', 'TIZIAN', 'DE', 39, 35, 23, 32, 59, 0, 71),
    ('XANTARES', 'ISMAILCAN DÖRTKARDEŞ', 'XANTARES', 'TR', 99, 59, 38, 91, 25, 1, 52),
    ('SMOOYA', 'OWEN BUTTERFIELD', 'SMOOYA', 'GB', 88, 16, 34, 82, 66, 93, 45),
    ('JKS', 'JUSTIN SAVAGE', 'JKS', 'AU', 74, 24, 51, 21, 82, 9, 75),
    ('AZR', 'AARON WARD', 'AZR', 'AU', 50, 64, 59, 42, 33, 0, 65),
    ('JKAEM', 'JOAKIM MYRBOSTAD', 'JKAEM', 'NO', 77, 80, 58, 72, 53, 0, 32),
    ('GRATISFACTION', 'SEAN KAIWAI', 'GRATISFACTION', 'NZ', 78, 27, 37, 54, 70, 94, 65),
    ('LIAZZ', 'JAY TREGILLGAS', 'LIAZZ', 'AU', 87, 40, 55, 42, 58, 0, 69),
    ('FLUSHA', 'ROBIN RÖNNQUIST', 'FLUSHA', 'SE', 64, 21, 15, 49, 62, 6, 85),
    ('KIOSHIMA', 'FABIEN FIEY', 'KIOSHIMA', 'FR', 59, 19, 38, 36, 68, 7, 59),
    ('RUSH', 'WILLIAM WIERZBA', 'RUSH', 'US', 52, 71, 37, 61, 53, 0, 26),
    ('AUTIMATIC', 'TIMOTHY TA', 'AUTIMATIC', 'US', 84, 24, 47, 48, 57, 36, 49),
    ('ZELLSIS', 'JORDAN MONTEMURRO', 'ZELLSIS', 'US', 80, 50, 40, 46, 55, 4, 65),
    ('ANGE1', 'KYRYLO KARASIOW', 'ANGE1', 'UA', 53, 70, 6, 79, 23, 1, 74),
    ('HOBBIT', 'ABAY KHASSENOV', 'HOBBIT', 'KZ', 67, 28, 36, 41, 56, 7, 50),
    ('WOXIC', 'ÖZGÜR EKER', 'WOXIC', 'TR', 95, 19, 51, 64, 80, 94, 42),
    ('DEADFOX', 'BENCE BÖRÖCZ', 'DEADFOX', 'HU', 17, 60, 46, 35, 47, 7, 63),
    ('ISSAA', 'ISSA MURAD', 'ISSAA', 'JO', 79, 45, 65, 49, 45, 0, 32),
    ('JACKZ', 'AUDRIC JUG', 'JACKZ', 'FR', 86, 40, 40, 55, 65, 2, 40),
    ('SHOX', 'RICHARD PAPILLON', 'SHOX', 'FR', 72, 17, 19, 59, 68, 9, 59),
    ('KENNYS', 'KENNY SCHRUB', 'KENNYS', 'FR', 75, 28, 57, 45, 66, 93, 55),
    ('BODYY', 'ALEXANDRE PIANARO', 'BODYY', 'FR', 29, 58, 28, 50, 39, 0, 45),
    ('LUCKY', 'LUCAS CHASTANG', 'LUCKY', 'FR', 85, 31, 40, 52, 61, 34, 61),
    ('SNAPPI', 'MARCO PFEIFFER', 'SNAPPI', 'DK', 48, 35, 27, 46, 42, 15, 55),
    ('CAJUNB', 'RENÉ BORG', 'CAJUNB', 'DK', 69, 36, 37, 29, 54, 10, 32),
    ('JUGI', 'JAKOB HANSEN', 'JUGI', 'DK', 57, 17, 40, 44, 59, 92, 31),
    ('K0NFIG', 'KRISTIAN WIENECKE', 'K0NFIG', 'DK', 87, 46, 27, 87, 19, 6, 32),
    ('REFREZH', 'ISMAIL ALI', 'REFREZH', 'DK', 71, 30, 44, 40, 77, 6, 36),
    ('FITCH', 'BEKTIYAR BAHYTOV', 'FITCH', 'KZ', 58, 51, 15, 79, 25, 1, 64),
    ('BUSTER', 'TIMUR TULEPOV', 'BUSTER', 'KZ', 70, 26, 16, 56, 66, 18, 15),
    ('KRIZZEN', 'AIDYN TURLYBEKOV', 'KRIZZEN', 'KZ', 53, 60, 32, 48, 34, 0, 40),
    ('QIKERT', 'ALEKSEI GOLUBEV', 'QIKERT', 'KZ', 86, 47, 46, 68, 44, 1, 60),
    ('JAME', 'DZHAMI ALI', 'JAME', 'KZ', 65, 20, 22, 63, 77, 95, 47),
    ('TONYBLACK', 'ANTON KOLESNIKOV', 'TONYBLACK', 'RU', 34, 23, 16, 29, 76, 4, 55),
    ('CHOPPER', 'LEONID VISHNYAKOV', 'CHOPPER', 'RU', 54, 48, 21, 65, 63, 0, 56),
    ('JR', 'DMYTRO CHERVAK', 'JR', 'RU', 62, 6, 19, 49, 85, 93, 66),
    ('HUTJI', 'PAVEL LASHKOV', 'HUTJI', 'RU', 42, 29, 42, 55, 34, 1, 40),
    ('CRUSH', 'IGOR SHEVCHENKO', 'CRUSH', 'RU', 46, 43, 30, 45, 41, 5, 82),
    ('SUMMER', 'YULUN CAI', 'SUMMER', 'CN', 71, 41, 23, 49, 59, 47, 73),
    ('BNTET', 'HANSEL FERDINAND', 'BNTET', 'ID', 81, 42, 81, 31, 83, 1, 82),
    ('ATTACKER', 'YUANZHANG SHENG', 'ATTACKER', 'CN', 91, 32, 59, 50, 58, 2, 16),
    ('SOMEBODY', 'HAOWEN XU', 'SOMEBODY', 'CN', 79, 70, 34, 72, 45, 8, 49),
    ('XCCURATE', 'KEVIN SUSANTO', 'XCCURATE', 'ID', 62, 49, 56, 39, 81, 93, 53),
    ('N0THING', 'JORDAN GILBERT', 'N0THING', 'US', 44, 42, 38, 56, 20, 3, 77),
    ('SHAHZAM', 'SHAHZEB KHAN', 'SHAHZAM', 'US', 68, 23, 47, 54, 62, 94, 52),
    ('DEPHH', 'RORY JACKSON', 'DEPHH', 'GB', 72, 69, 27, 72, 37, 24, 73),
    ('STANISLAW', 'PETER JARGUZ', 'STANISLAW', 'CA', 48, 56, 23, 44, 49, 3, 82),
    ('RICKEH', 'RICARDO MULHOLLAND', 'RICKEH', 'AU', 67, 41, 22, 68, 62, 60, 67),
    ('HIKO', 'SPENCER MARTIN', 'HIKO', 'US', 36, 44, 67, 27, 73, 0, 68),
    ('TENZKI', 'JESPER PLOUGMANN', 'TENZKI', 'DK', 59, 50, 40, 48, 53, 0, 56),
    ('MSL', 'MATHIAS LAURIDSEN', 'MSL', 'DK', 39, 80, 24, 69, 30, 19, 68),
    ('SICK', 'HUNTER MIMS', 'SICK', 'US', 73, 47, 67, 55, 58, 9, 34),
    ('VICE', 'DANIEL KIM', 'VICE', 'US', 62, 84, 67, 43, 42, 0, 50),
    ('DOSIA', 'MIHAIL STOLYAROV', 'DOSIA', 'RU', 36, 26, 19, 28, 59, 1, 76),
    ('MOU', 'RUSTEM TELEPOV', 'MOU', 'KZ', 72, 19, 46, 54, 58, 94, 52),
    ('BONDIK', 'VLADYSLAV NECHYPORCHUK', 'BONDIK', 'UA', 40, 57, 61, 24, 73, 0, 54),
    ('MIR', 'NIKOLAY BITYUKOV', 'MIR', 'RU', 49, 36, 57, 34, 54, 1, 42),
    ('AX1LE', 'SERGEY RYKHTOROV', 'AX1LE', 'RU', 83, 14, 61, 42, 64, 20, 54),
    ('RELTUC', 'STEPHEN CUTLER', 'RELTUC', 'US', 58, 20, 65, 15, 68, 1, 53),
    ('JDM64', 'JOSH MARZANO', 'JDM64', 'US', 54, 39, 24, 57, 38, 95, 37),
    ('NIFTY', 'NOAH FRANCIS', 'NIFTY', 'US', 41, 41, 27, 52, 48, 91, 67),
    ('DRONE', 'TAYLOR JOHNSON', 'DRONE', 'US', 52, 74, 39, 79, 44, 0, 28),
    ('SEMPHIS', 'KORY FRIESEN', 'SEMPHIS', 'CA', 31, 45, 31, 25, 26, 29, 48),
    ('DAVCOST', 'VADIM VASILYEV', 'DAVCOST', 'RU', 55, 23, 33, 37, 62, 94, 49),
    ('DIMAONESHOT', 'DMITRIY BANDURKA', 'DIMAONESHOT', 'RU', 61, 88, 27, 83, 37, 0, 50),
    ('S0TF1K', 'DMITRY FOROSTYANKO', 'S0TF1K', 'RU', 38, 68, 31, 37, 44, 6, 83),
    ('COLDYY1', 'PAVLO VEKLENKO', 'COLDYY1', 'UA', 79, 34, 67, 37, 59, 5, 52),
    ('SDY', 'VIKTOR ORUDZHEV', 'SDY', 'UA', 77, 53, 66, 50, 72, 2, 40),
    ('MAJ3R', 'ENGIN KÜPELI', 'MAJ3R', 'TR', 39, 18, 18, 53, 52, 20, 81),
    ('YAM', 'YAMAN ERGENEKON', 'YAM', 'AU', 83, 40, 29, 72, 61, 91, 57),
    ('CALYX', 'BUĞRA ARKIN', 'CALYX', 'TR', 72, 43, 48, 40, 70, 8, 48),
    ('PAZ', 'AHMET KARAHOCA', 'PAZ', 'TR', 62, 60, 48, 45, 44, 13, 37),
    ('NGIN', 'ENGIN KOR', 'NGIN', 'TR', 9, 42, 38, 19, 53, 2, 62),
    ('WORLDEDIT', 'GEORGI YASKIN', 'WORLDEDIT', 'RU', 75, 18, 35, 39, 53, 91, 49),
    ('WAYLANDER', 'JAN RAHKONEN', 'WAYLANDER', 'FI', 56, 12, 9, 64, 44, 3, 40),
    ('KVIK', 'AURIMAS KVAKŠYS', 'KVIK', 'LT', 63, 49, 50, 49, 34, 6, 37),
    ('BOOMBL4', 'KIRILL MIKHAILOV', 'BOOMBL4', 'RU', 84, 36, 32, 62, 52, 2, 55),
    ('N0RB3R7', 'DAVID DANIELYAN', 'N0RB3R7', 'RU', 91, 37, 14, 84, 54, 17, 16),
    ('SNAX', 'JANUSZ POGORZELSKI', 'SNAX', 'PL', 57, 15, 22, 45, 49, 21, 62),
    ('BYALI', 'PAWEŁ BIELIŃSKI', 'BYALI', 'PL', 60, 27, 40, 40, 46, 0, 42),
    ('MICHU', 'MICHAŁ MÜLLER', 'MICHU', 'PL', 74, 31, 37, 67, 34, 2, 47),
    ('SNATCHIE', 'MICHAŁ RUDZKI', 'SNATCHIE', 'PL', 67, 30, 31, 63, 59, 93, 16),
    ('TOAO', 'MATEUSZ ZAWISTOWSKI', 'TOAO', 'PL', 34, 34, 33, 49, 62, 10, 69)
)
INSERT INTO players (
  nickname, display_name, slug, country_id, career_status, overall,
  firepower, entrying, trading, opening, clutching, sniping, utility
)
SELECT
  player_data.nickname, player_data.display_name, player_data.slug,
  countries.id, 'active',
  round((
    player_data.firepower + player_data.entrying + player_data.trading +
    player_data.opening + player_data.clutching + player_data.sniping +
    player_data.utility
  )::numeric / 7)::smallint,
  player_data.firepower, player_data.entrying, player_data.trading,
  player_data.opening, player_data.clutching, player_data.sniping,
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

DELETE FROM player_team_years WHERE year = 2018;

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('ASTRALIS', 'XYP9X'),
    ('ASTRALIS', 'DUPREEH'),
    ('ASTRALIS', 'GLA1VE'),
    ('ASTRALIS', 'DEVICE'),
    ('ASTRALIS', 'MAGISK'),
    ('NATUS-VINCERE', 'EDWARD'),
    ('NATUS-VINCERE', 'ZEUS'),
    ('NATUS-VINCERE', 'FLAMIE'),
    ('NATUS-VINCERE', 'S1MPLE'),
    ('NATUS-VINCERE', 'ELECTRONIC'),
    ('TEAM-LIQUID', 'NITR0'),
    ('TEAM-LIQUID', 'NAF'),
    ('TEAM-LIQUID', 'ELIGE'),
    ('TEAM-LIQUID', 'STEWIE2K'),
    ('TEAM-LIQUID', 'TWISTZZ'),
    ('MIBR', 'FALLEN'),
    ('MIBR', 'TARIK'),
    ('MIBR', 'FER'),
    ('MIBR', 'COLDZERA'),
    ('MIBR', 'TACO'),
    ('MOUZ', 'OSKAR'),
    ('MOUZ', 'CHRISJ'),
    ('MOUZ', 'SUNNY'),
    ('MOUZ', 'STYKO'),
    ('MOUZ', 'ROPZ'),
    ('FAZE-CLAN', 'OLOFMEISTER'),
    ('FAZE-CLAN', 'GUARDIAN'),
    ('FAZE-CLAN', 'NIKO'),
    ('FAZE-CLAN', 'RAIN'),
    ('FAZE-CLAN', 'KARRIGAN'),
    ('NINJAS-IN-PYJAMAS', 'F0REST'),
    ('NINJAS-IN-PYJAMAS', 'GET-RIGHT'),
    ('NINJAS-IN-PYJAMAS', 'DENNIS'),
    ('NINJAS-IN-PYJAMAS', 'LEKR0'),
    ('NINJAS-IN-PYJAMAS', 'REZ'),
    ('FNATIC', 'XIZT'),
    ('FNATIC', 'JW'),
    ('FNATIC', 'TWIST'),
    ('FNATIC', 'KRIMZ'),
    ('FNATIC', 'BROLLAN'),
    ('NORTH', 'CADIAN'),
    ('NORTH', 'AIZY'),
    ('NORTH', 'KJAERBYE'),
    ('NORTH', 'GADE'),
    ('NORTH', 'VALDE'),
    ('BIG', 'GOB-B'),
    ('BIG', 'TABSEN'),
    ('BIG', 'TIZIAN'),
    ('BIG', 'XANTARES'),
    ('BIG', 'SMOOYA'),
    ('RENEGADES', 'JKS'),
    ('RENEGADES', 'AZR'),
    ('RENEGADES', 'JKAEM'),
    ('RENEGADES', 'GRATISFACTION'),
    ('RENEGADES', 'LIAZZ'),
    ('CLOUD9', 'FLUSHA'),
    ('CLOUD9', 'KIOSHIMA'),
    ('CLOUD9', 'RUSH'),
    ('CLOUD9', 'AUTIMATIC'),
    ('CLOUD9', 'ZELLSIS'),
    ('HELLRAISERS', 'ANGE1'),
    ('HELLRAISERS', 'HOBBIT'),
    ('HELLRAISERS', 'WOXIC'),
    ('HELLRAISERS', 'DEADFOX'),
    ('HELLRAISERS', 'ISSAA'),
    ('G2-ESPORTS', 'JACKZ'),
    ('G2-ESPORTS', 'SHOX'),
    ('G2-ESPORTS', 'KENNYS'),
    ('G2-ESPORTS', 'BODYY'),
    ('G2-ESPORTS', 'LUCKY'),
    ('OPTIC-GAMING', 'SNAPPI'),
    ('OPTIC-GAMING', 'CAJUNB'),
    ('OPTIC-GAMING', 'JUGI'),
    ('OPTIC-GAMING', 'K0NFIG'),
    ('OPTIC-GAMING', 'REFREZH'),
    ('AVANGAR', 'FITCH'),
    ('AVANGAR', 'BUSTER'),
    ('AVANGAR', 'KRIZZEN'),
    ('AVANGAR', 'QIKERT'),
    ('AVANGAR', 'JAME'),
    ('VEGA-SQUADRON', 'TONYBLACK'),
    ('VEGA-SQUADRON', 'CHOPPER'),
    ('VEGA-SQUADRON', 'JR'),
    ('VEGA-SQUADRON', 'HUTJI'),
    ('VEGA-SQUADRON', 'CRUSH'),
    ('TYLOO', 'SUMMER'),
    ('TYLOO', 'BNTET'),
    ('TYLOO', 'ATTACKER'),
    ('TYLOO', 'SOMEBODY'),
    ('TYLOO', 'XCCURATE'),
    ('COMPLEXITY-GAMING', 'N0THING'),
    ('COMPLEXITY-GAMING', 'SHAHZAM'),
    ('COMPLEXITY-GAMING', 'DEPHH'),
    ('COMPLEXITY-GAMING', 'STANISLAW'),
    ('COMPLEXITY-GAMING', 'RICKEH'),
    ('ROGUE', 'HIKO'),
    ('ROGUE', 'TENZKI'),
    ('ROGUE', 'MSL'),
    ('ROGUE', 'SICK'),
    ('ROGUE', 'VICE'),
    ('GAMBIT', 'DOSIA'),
    ('GAMBIT', 'MOU'),
    ('GAMBIT', 'BONDIK'),
    ('GAMBIT', 'MIR'),
    ('GAMBIT', 'AX1LE'),
    ('TEAM-ENVYUS', 'RELTUC'),
    ('TEAM-ENVYUS', 'JDM64'),
    ('TEAM-ENVYUS', 'NIFTY'),
    ('TEAM-ENVYUS', 'DRONE'),
    ('TEAM-ENVYUS', 'SEMPHIS'),
    ('TEAM-SPIRIT', 'DAVCOST'),
    ('TEAM-SPIRIT', 'DIMAONESHOT'),
    ('TEAM-SPIRIT', 'S0TF1K'),
    ('TEAM-SPIRIT', 'COLDYY1'),
    ('TEAM-SPIRIT', 'SDY'),
    ('SPACE-SOLDIERS', 'MAJ3R'),
    ('SPACE-SOLDIERS', 'YAM'),
    ('SPACE-SOLDIERS', 'CALYX'),
    ('SPACE-SOLDIERS', 'PAZ'),
    ('SPACE-SOLDIERS', 'NGIN'),
    ('WINSTRIKE-TEAM', 'WORLDEDIT'),
    ('WINSTRIKE-TEAM', 'WAYLANDER'),
    ('WINSTRIKE-TEAM', 'KVIK'),
    ('WINSTRIKE-TEAM', 'BOOMBL4'),
    ('WINSTRIKE-TEAM', 'N0RB3R7'),
    ('VIRTUS-PRO', 'SNAX'),
    ('VIRTUS-PRO', 'BYALI'),
    ('VIRTUS-PRO', 'MICHU'),
    ('VIRTUS-PRO', 'SNATCHIE'),
    ('VIRTUS-PRO', 'TOAO')
)
INSERT INTO player_team_years (player_id, team_id, year)
SELECT players.id, teams.id, 2018
FROM lineup_data
JOIN players ON players.slug = lineup_data.player_slug
JOIN teams ON teams.slug = lineup_data.team_slug;

DO $$
DECLARE
  invalid_team_count integer;
  duplicate_player_count integer;
  link_count integer;
BEGIN
  SELECT count(*) INTO invalid_team_count
  FROM (
    SELECT teams.id
    FROM teams
    LEFT JOIN player_team_years
      ON player_team_years.team_id = teams.id
      AND player_team_years.year = 2018
    WHERE teams.slug IN ('ASTRALIS', 'NATUS-VINCERE', 'TEAM-LIQUID', 'MIBR', 'MOUZ', 'FAZE-CLAN', 'NINJAS-IN-PYJAMAS', 'FNATIC', 'NORTH', 'BIG', 'RENEGADES', 'CLOUD9', 'HELLRAISERS', 'G2-ESPORTS', 'OPTIC-GAMING', 'AVANGAR', 'VEGA-SQUADRON', 'TYLOO', 'COMPLEXITY-GAMING', 'ROGUE', 'GAMBIT', 'TEAM-ENVYUS', 'TEAM-SPIRIT', 'SPACE-SOLDIERS', 'WINSTRIKE-TEAM', 'VIRTUS-PRO')
    GROUP BY teams.id
    HAVING count(player_team_years.id) <> 5
  ) invalid_teams;

  SELECT count(*) INTO duplicate_player_count
  FROM (
    SELECT player_id FROM player_team_years
    WHERE year = 2018 GROUP BY player_id HAVING count(*) > 1
  ) duplicate_players;

  SELECT count(*) INTO link_count FROM player_team_years WHERE year = 2018;

  IF invalid_team_count > 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2018 sem exatamente cinco jogadores', invalid_team_count;
  END IF;
  IF duplicate_player_count > 0 THEN
    RAISE EXCEPTION 'Existem % jogadores vinculados a mais de um time em 2018', duplicate_player_count;
  END IF;
  IF link_count <> 130 THEN
    RAISE EXCEPTION 'Quantidade inesperada de vinculos em 2018: %', link_count;
  END IF;
END
$$;

