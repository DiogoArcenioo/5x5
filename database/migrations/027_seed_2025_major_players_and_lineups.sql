-- Lineups que encerraram 2025 nas 32 organizacoes participantes do
-- BLAST.tv Austin Major 2025.
--
-- Fontes principais:
-- https://www.hltv.org/news/41799/blast-austin-major-teams-format-schedule-prizes-talent-fantasy
-- https://www.hltv.org/ranking/teams/2025/december/29
--
-- Excecoes de fim de temporada e organizacoes em transicao:
-- https://www.hltv.org/news/43413/official-pain-remove-dgt-and-dav1deus
-- https://www.hltv.org/news/42484/official-passion-ua-announce-new-roster-featuring-complexity-quartet
-- https://www.hltv.org/news/43243/wildcard-bench-roster
-- https://www.hltv.org/news/43539/wildcard-unveil-new-roster
-- https://www.hltv.org/team/11641/metizport
-- https://www.hltv.org/player/20903/senzu
--
-- Apenas identidades ausentes sao inseridas. Cadastros existentes e todas as
-- temporadas anteriores permanecem inalterados.

WITH player_data (nickname, display_name, slug, country_code, career_status) AS (
  VALUES
    ('JIMPPHAT', 'JIMI SALO', 'JIMPPHAT', 'FI', 'active'),
    ('TN1R', 'ANDREY TATARINOVICH', 'TN1R', 'BY', 'active'),
    ('ZONT1X', 'MYROSLAV PLAKHOTIA', 'ZONT1X', 'UA', 'active'),
    ('DONK', 'DANIL KRYSHKOVETS', 'DONK', 'RU', 'active'),
    ('MALBSMD', 'MARIO SAMAYOA', 'MALBSMD', 'GT', 'active'),
    ('HEAVYGOD', 'NIKITA MARTYNENKO', 'HEAVYGOD', 'IL', 'active'),
    ('MATYS', 'MATÚŠ ŠIMKO', 'MATYS', 'SK', 'active'),
    ('SOULFLY', 'CANER KESICI', 'SOULFLY', 'TR', 'active'),
    ('WICADIA', 'ALI HAYDAR YALÇIN', 'WICADIA', 'TR', 'active'),
    ('MZINHO', 'AYUSH BATBOLD', 'MZINHO', 'MN', 'active'),
    ('910', 'USUKHBAYAR BANZRAGCH', '910', 'MN', 'active'),
    ('SENZU', 'AZBAYAR MUNKHBOLD', 'SENZU', 'MN', 'active'),
    ('MAKAZZE', 'DRIN SHAQIRI', 'MAKAZZE', 'XK', 'active'),
    ('ULTIMATE', 'ROLAND TOMKOWIAK', 'ULTIMATE', 'PL', 'active'),
    ('KYOUSUKE', 'MAKSIM LUKIN', 'KYOUSUKE', 'RU', 'active'),
    ('JCOBBB', 'JAKUB PIETRUSZEWSKI', 'JCOBBB', 'PL', 'active'),
    ('MAKA', 'BRYAN CANDA', 'MAKA', 'FR', 'active'),
    ('EX3RCICE', 'PIERRE BULINGE', 'EX3RCICE', 'FR', 'active'),
    ('GRAVITI', 'FILIP BRANKOVIC', 'GRAVITI', 'FR', 'active'),
    ('B1ST', 'VLADIMIR KRASIKOV', 'B1ST', 'RU', 'active'),
    ('TO0RO', 'VADIM ARKOV', 'TO0RO', 'RU', 'active'),
    ('SNOW', 'JOÃO VINICIUS', 'SNOW', 'BR', 'active'),
    ('MOLODOY', 'DANIL GOLUBENKO', 'MOLODOY', 'KZ', 'active'),
    ('INSANI', 'FELIPE YUJI', 'INSANI', 'BR', 'active'),
    ('KL1M', 'KLIMENTII KRIVOSHEEV', 'KL1M', 'RU', 'active'),
    ('SWISHER', 'MICHAEL SCHMID', 'SWISHER', 'US', 'active'),
    ('S1N', 'ELIAS STEIN', 'S1N', 'DE', 'active'),
    ('JBA', 'JOSH BARUTT', 'JBA', 'US', 'active'),
    ('LAKE', 'MASON SANDERSON', 'LAKE', 'US', 'active'),
    ('NICX', 'NICK LEE', 'NICX', 'US', 'active'),
    ('CXZI', 'DANNY STRZELCZYK', 'CXZI', 'US', 'active'),
    ('SPOOKE', 'OLLE GRUNDSTRÖM', 'SPOOKE', 'SE', 'active'),
    ('ARROZDOCE', 'RAFAEL WING', 'ARROZDOCE', 'PT', 'active'),
    ('ADAMB', 'ADAM ÅNGSTRÖM', 'ADAMB', 'SE', 'active'),
    ('FL4MUS', 'TIMUR MAREV', 'FL4MUS', 'RU', 'active'),
    ('ALEX666', 'ALEXEY YARMOSHCHUK', 'ALEX666', 'UA', 'active'),
    ('KENSIZOR', 'ARTEM KAPRAN', 'KENSIZOR', 'UA', 'active'),
    ('ESENTHIAL', 'DMYTRO TSVIR', 'ESENTHIAL', 'UA', 'active'),
    ('NILO', 'LINUS BERGMAN', 'NILO', 'SE', 'active'),
    ('CHR1ZN', 'CHRISTOFFER STORGAARD', 'CHR1ZN', 'DK', 'active'),
    ('YXNGSTXR', 'SIMON BOIJE', 'YXNGSTXR', 'SE', 'active'),
    ('ALKAREN', 'ALIMZHAN BITIMBAY', 'ALKAREN', 'KZ', 'active'),
    ('XANT3R', 'KIRILL KONONOV', 'XANT3R', 'RU', 'active'),
    ('1EER', 'ALIAKSANDR NAHORNY', '1EER', 'BY', 'active'),
    ('SOWALIO', 'MAKSIM BEKETOV', 'SOWALIO', 'RU', 'active'),
    ('RISKYB0B', 'MAKSIM CHURIKOV', 'RISKYB0B', 'RU', 'active'),
    ('KHAN', 'BEKSULTAN OSPAN', 'KHAN', 'KZ', 'active'),
    ('PHZY', 'LOVE SMIDEBRANT', 'PHZY', 'SE', 'active'),
    ('PEEPING', 'JAXON CORNWELL', 'PEEPING', 'US', 'active'),
    ('RECK', 'ETHAN SERRANO', 'RECK', 'US', 'active'),
    ('D1LEDEZ', 'DANIIL KUSTOV', 'D1LEDEZ', 'RU', 'active'),
    ('ARTFR0ST', 'ARTEM KHARITONOV', 'ARTFR0ST', 'RU', 'active'),
    ('MAGNOJEZ', 'KIRILL RODNOV', 'MAGNOJEZ', 'RU', 'active'),
    ('JACKINHO', 'JACK STRÖM MATTSSON', 'JACKINHO', 'SE', 'active'),
    ('DRAGON', 'NIKOLA BOSKOVIC', 'DRAGON', 'RS', 'active'),
    ('MAIL09', 'LIAM TÜGEL', 'MAIL09', 'SE', 'active'),
    ('NOWAY', 'KAIKY SANTOS', 'NOWAY', 'BR', 'active'),
    ('NETTIK', 'COREY BROWNE', 'NETTIK', 'NZ', 'active'),
    ('ROUX', 'UNDRAKHBAYAR ZOLBAYAR', 'ROUX', 'MN', 'active'),
    ('YAMI', 'YALALT OYUNBILEG', 'YAMI', 'MN', 'active'),
    ('COOL4ST', 'SODBILEG BATBAATAR', 'COOL4ST', 'MN', 'active'),
    ('EFIRE', 'TUGSERDENE ERDENEBOLD', 'EFIRE', 'MN', 'active'),
    ('TIKUAK', 'ZOLBAYAR CHIMEDTSEREN', 'TIKUAK', 'MN', 'active'),
    ('DECENTY', 'LUCAS BACELAR', 'DECENTY', 'BR', 'active'),
    ('KYE', 'KAYKE BERTOLUCCI', 'KYE', 'BR', 'active'),
    ('JEE', 'DONGKAI JI', 'JEE', 'CN', 'active'),
    ('MERCURY', 'JINGXIANG WANG', 'MERCURY', 'CN', 'active'),
    ('MOSEYUH', 'QIANHAO CHEN', 'MOSEYUH', 'CN', 'active'),
    ('WESTMELON', 'ZHE NIU', 'WESTMELON', 'CN', 'active'),
    ('Z4KR', 'SIKE ZHANG', 'Z4KR', 'CN', 'active'),
    ('STARRY', 'LIZHI YE', 'STARRY', 'CN', 'active'),
    ('EMILIAQAQ', 'JUNJIE TANG', 'EMILIAQAQ', 'CN', 'active'),
    ('C4LLM3SU3', 'QIHAO SU', 'C4LLM3SU3', 'CN', 'active'),
    ('SONIC', 'ARAN GROESBEEK', 'SONIC', 'ZA', 'active'),
    ('BR0', 'ALEXANDER BRO', 'BR0', 'DK', 'active'),
    ('JEORGE', 'JEORGE ENDICOTT', 'JEORGE', 'US', 'active'),
    ('N1SSIM', 'VINICIUS PEREIRA', 'N1SSIM', 'BR', 'active'),
    ('LUX', 'LUCAS MENEGHINI', 'LUX', 'BR', 'active'),
    ('SAADZIN', 'GUILHERME PACHECO', 'SAADZIN', 'BR', 'active')
)
INSERT INTO players (nickname, display_name, slug, country_id, career_status)
SELECT player_data.nickname, player_data.display_name, player_data.slug,
       countries.id, player_data.career_status
FROM player_data
JOIN countries ON countries.code = player_data.country_code
ON CONFLICT (slug) DO NOTHING;

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('TEAM-VITALITY', 'APEX'), ('TEAM-VITALITY', 'ROPZ'), ('TEAM-VITALITY', 'ZYWOO'), ('TEAM-VITALITY', 'FLAMEZ'), ('TEAM-VITALITY', 'MEZII'),
    ('MOUZ', 'BROLLAN'), ('MOUZ', 'TORZSI'), ('MOUZ', 'SPINX'), ('MOUZ', 'JIMPPHAT'), ('MOUZ', 'XERTION'),
    ('TEAM-SPIRIT', 'SH1RO'), ('TEAM-SPIRIT', 'MAGIXX'), ('TEAM-SPIRIT', 'TN1R'), ('TEAM-SPIRIT', 'ZONT1X'), ('TEAM-SPIRIT', 'DONK'),
    ('G2-ESPORTS', 'HUNTER'), ('G2-ESPORTS', 'MALBSMD'), ('G2-ESPORTS', 'SUNPAYUS'), ('G2-ESPORTS', 'HEAVYGOD'), ('G2-ESPORTS', 'MATYS'),
    ('AURORA-GAMING', 'MAJ3R'), ('AURORA-GAMING', 'XANTARES'), ('AURORA-GAMING', 'WOXIC'), ('AURORA-GAMING', 'SOULFLY'), ('AURORA-GAMING', 'WICADIA'),
    ('THE-MONGOLZ', 'BLITZ'), ('THE-MONGOLZ', 'TECHNO'), ('THE-MONGOLZ', 'MZINHO'), ('THE-MONGOLZ', '910'), ('THE-MONGOLZ', 'SENZU'),
    ('NATUS-VINCERE', 'ALEKSIB'), ('NATUS-VINCERE', 'IM'), ('NATUS-VINCERE', 'B1T'), ('NATUS-VINCERE', 'W0NDERFUL'), ('NATUS-VINCERE', 'MAKAZZE'),
    ('TEAM-LIQUID', 'NAF'), ('TEAM-LIQUID', 'ELIGE'), ('TEAM-LIQUID', 'NERTZ'), ('TEAM-LIQUID', 'SIUHY'), ('TEAM-LIQUID', 'ULTIMATE'),
    ('TEAM-FALCONS', 'NIKO'), ('TEAM-FALCONS', 'TESES'), ('TEAM-FALCONS', 'M0NESY'), ('TEAM-FALCONS', 'KYXSAN'), ('TEAM-FALCONS', 'KYOUSUKE'),
    ('FAZE-CLAN', 'KARRIGAN'), ('FAZE-CLAN', 'FROZEN'), ('FAZE-CLAN', 'TWISTZZ'), ('FAZE-CLAN', 'BROKY'), ('FAZE-CLAN', 'JCOBBB'),
    ('3DMAX', 'BODYY'), ('3DMAX', 'MAKA'), ('3DMAX', 'LUCKY'), ('3DMAX', 'EX3RCICE'), ('3DMAX', 'GRAVITI'),
    ('VIRTUS-PRO', 'FL1T'), ('VIRTUS-PRO', 'PERFECTO'), ('VIRTUS-PRO', 'FAME'), ('VIRTUS-PRO', 'B1ST'), ('VIRTUS-PRO', 'TO0RO'),
    ('PAIN-GAMING', 'BIGUZERA'), ('PAIN-GAMING', 'NQZ'), ('PAIN-GAMING', 'SNOW'), ('PAIN-GAMING', 'DAV1DEUS'), ('PAIN-GAMING', 'DGT'),
    ('FURIA-ESPORTS', 'FALLEN'), ('FURIA-ESPORTS', 'YUURIH'), ('FURIA-ESPORTS', 'YEKINDAR'), ('FURIA-ESPORTS', 'KSCERATO'), ('FURIA-ESPORTS', 'MOLODOY'),
    ('MIBR', 'EXIT'), ('MIBR', 'QIKERT'), ('MIBR', 'BRNZ4N'), ('MIBR', 'INSANI'), ('MIBR', 'KL1M'),
    ('M80', 'SLAXZ'), ('M80', 'SWISHER'), ('M80', 'S1N'), ('M80', 'JBA'), ('M80', 'LAKE'),
    ('COMPLEXITY-GAMING', 'JT'), ('COMPLEXITY-GAMING', 'HALLZERK'), ('COMPLEXITY-GAMING', 'GRIM'), ('COMPLEXITY-GAMING', 'NICX'), ('COMPLEXITY-GAMING', 'CXZI'),
    ('OG', 'CADIAN'), ('OG', 'SPOOKE'), ('OG', 'ARROZDOCE'), ('OG', 'ADAMB'), ('OG', 'FL4MUS'),
    ('B8-ESPORTS', 'HEADTR1CK'), ('B8-ESPORTS', 'ALEX666'), ('B8-ESPORTS', 'NPL'), ('B8-ESPORTS', 'KENSIZOR'), ('B8-ESPORTS', 'ESENTHIAL'),
    ('HEROIC', 'XFL0UD'), ('HEROIC', 'NILO'), ('HEROIC', 'CHR1ZN'), ('HEROIC', 'YXNGSTXR'), ('HEROIC', 'ALKAREN'),
    ('NEMIGA-GAMING', 'XANT3R'), ('NEMIGA-GAMING', '1EER'), ('NEMIGA-GAMING', 'SOWALIO'), ('NEMIGA-GAMING', 'RISKYB0B'), ('NEMIGA-GAMING', 'KHAN'),
    ('WILDCARD', 'PHZY'), ('WILDCARD', 'PEEPING'), ('WILDCARD', 'F1KU'), ('WILDCARD', 'STANISLAW'), ('WILDCARD', 'RECK'),
    ('BETBOOM-TEAM', 'BOOMBL4'), ('BETBOOM-TEAM', 'S1REN'), ('BETBOOM-TEAM', 'D1LEDEZ'), ('BETBOOM-TEAM', 'ARTFR0ST'), ('BETBOOM-TEAM', 'MAGNOJEZ'),
    ('METIZPORT', 'JACKINHO'), ('METIZPORT', 'ISAK'), ('METIZPORT', 'DRAGON'), ('METIZPORT', 'MAIL09'), ('METIZPORT', 'NAWWK'),
    ('IMPERIAL', 'CHELO'), ('IMPERIAL', 'VINI'), ('IMPERIAL', 'SKULLZ'), ('IMPERIAL', 'TRY'), ('IMPERIAL', 'NOWAY'),
    ('FLYQUEST', 'JKS'), ('FLYQUEST', 'INS'), ('FLYQUEST', 'VEXITE'), ('FLYQUEST', 'NETTIK'), ('FLYQUEST', 'REGALI'),
    ('CHINGGIS-WARRIORS', 'ROUX'), ('CHINGGIS-WARRIORS', 'YAMI'), ('CHINGGIS-WARRIORS', 'COOL4ST'), ('CHINGGIS-WARRIORS', 'EFIRE'), ('CHINGGIS-WARRIORS', 'TIKUAK'),
    ('FLUXO', 'ART'), ('FLUXO', 'LUCAOZY'), ('FLUXO', 'ZEVY'), ('FLUXO', 'DECENTY'), ('FLUXO', 'KYE'),
    ('TYLOO', 'ATTACKER'), ('TYLOO', 'JAMYOUNG'), ('TYLOO', 'JEE'), ('TYLOO', 'MERCURY'), ('TYLOO', 'MOSEYUH'),
    ('LYNN-VISION', 'WESTMELON'), ('LYNN-VISION', 'Z4KR'), ('LYNN-VISION', 'STARRY'), ('LYNN-VISION', 'EMILIAQAQ'), ('LYNN-VISION', 'C4LLM3SU3'),
    ('NRG-ESPORTS', 'NITR0'), ('NRG-ESPORTS', 'SONIC'), ('NRG-ESPORTS', 'OSEE'), ('NRG-ESPORTS', 'BR0'), ('NRG-ESPORTS', 'JEORGE'),
    ('LEGACY', 'DUMAU'), ('LEGACY', 'LATTO'), ('LEGACY', 'N1SSIM'), ('LEGACY', 'LUX'), ('LEGACY', 'SAADZIN')
)
INSERT INTO player_team_years (
  player_id, team_id, year, overall,
  firepower, entrying, trading, opening, clutching, sniping, utility
)
SELECT players.id, teams.id, 2025, 50, 50, 50, 50, 50, 50, 50, 50
FROM lineup_data
JOIN players ON players.slug = lineup_data.player_slug
JOIN teams ON teams.slug = lineup_data.team_slug;

DO $$
DECLARE
  link_count integer;
  team_count integer;
  invalid_team_count integer;
  duplicate_player_count integer;
BEGIN
  SELECT count(*), count(DISTINCT team_id)
  INTO link_count, team_count
  FROM player_team_years
  WHERE year = 2025;

  SELECT count(*) INTO invalid_team_count
  FROM (
    SELECT team_id
    FROM player_team_years
    WHERE year = 2025
    GROUP BY team_id
    HAVING count(*) <> 5
  ) invalid_teams;

  SELECT count(*) INTO duplicate_player_count
  FROM (
    SELECT player_id
    FROM player_team_years
    WHERE year = 2025
    GROUP BY player_id
    HAVING count(*) <> 1
  ) duplicate_players;

  IF link_count <> 160 OR team_count <> 32 THEN
    RAISE EXCEPTION 'Carga 2025 incompleta: % vinculos em % equipes', link_count, team_count;
  END IF;
  IF invalid_team_count <> 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2025 sem exatamente cinco jogadores', invalid_team_count;
  END IF;
  IF duplicate_player_count <> 0 THEN
    RAISE EXCEPTION 'Existem % jogadores duplicados em 2025', duplicate_player_count;
  END IF;
END
$$;
