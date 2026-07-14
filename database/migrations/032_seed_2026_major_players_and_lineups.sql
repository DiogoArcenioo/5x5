-- Lineups oficiais das 32 equipes do IEM Cologne Major 2026.
-- Como 2026 ainda esta em andamento, esta carga usa a fotografia do Major
-- concluido, e nao uma hipotetica lineup de encerramento do ano.
--
-- Fontes (uma pagina para cada fase do evento):
-- https://www.hltv.org/stats/players?event=9028
-- https://www.hltv.org/stats/players?event=9029
-- https://www.hltv.org/stats/players?event=8301
--
-- Os perfis individuais https://www.hltv.org/player/<id>/<slug> foram usados
-- para confirmar nickname, nome completo e pais dos novos jogadores.
-- Apenas identidades ausentes sao inseridas; temporadas anteriores nao sao
-- alteradas.

WITH player_data (nickname, display_name, slug, country_code, career_status) AS (
  VALUES
    ('LUCHOV', 'LUCIANO HERRERA', 'LUCHOV', 'AR', 'active'),
    ('HUASOPEEK', 'MATIAS IBAÑEZ HERNANDEZ', 'HUASOPEEK', 'CL', 'active'),
    ('RYU', 'GYTIS GLUŠAUSKAS', 'RYU', 'LT', 'active'),
    ('S1ZZI', 'DANYLO VINNYK', 'S1ZZI', 'UA', 'active'),
    ('GR1KS', 'GLEB GAZIN', 'GR1KS', 'BY', 'active'),
    ('DEM0N', 'DMYTRO MYROSHNYCHENKO', 'DEM0N', 'UA', 'active'),
    ('KRABENI', 'AULON FAZLIJA', 'KRABENI', 'XK', 'active'),
    ('DZIUGSS', 'DŽIUGAS STEPONAVIČIUS', 'DZIUGSS', 'LT', 'active'),
    ('CMTRY', 'NIKITA SAMOLOTOV', 'CMTRY', 'UA', 'active'),
    ('LUKEN', 'LUCA NADOTTI', 'LUKEN', 'AR', 'active'),
    ('HYPEX', 'MILAN POLOWIEC', 'HYPEX', 'PL', 'active'),
    ('PR', 'OLDŘICH NOVÝ', 'PR', 'CZ', 'active'),
    ('VENOMZERA', 'CARLOS EDUARDO', 'VENOMZERA', 'BR', 'active'),
    ('AZUWU', 'OSCAR BELL', 'AZUWU', 'GB', 'active'),
    ('RAINWAKER', 'ALEKS PETROV', 'RAINWAKER', 'BG', 'active'),
    ('GIZMY', 'JACK VON SPRECKELSEN', 'GIZMY', 'GB', 'active'),
    ('XELEX', 'ADRIAN VINCZE', 'XELEX', 'HU', 'active'),
    ('PIRIAJR', 'GUILHERME BARBOSA', 'PIRIAJR', 'BR', 'active'),
    ('XIELO', 'VLADISLAV LYSOV', 'XIELO', 'RU', 'active'),
    ('ZWEIH', 'IVAN GOGIN', 'ZWEIH', 'RU', 'active'),
    ('BELCHONOKK', 'ANDREY YASINSKIY', 'BELCHONOKK', 'RU', 'active'),
    ('KOALA', 'JOÃO PFEFFER', 'KOALA', 'BR', 'active'),
    ('MAXXKOR', 'MÁXIMO CORTINA', 'MAXXKOR', 'AR', 'active'),
    ('DOC', 'DANILO BARROS', 'DOC', 'BR', 'active'),
    ('GAFOLO', 'VICTOR ANDRADE', 'GAFOLO', 'BR', 'active'),
    ('RDNZAO', 'DANIEL MONTEIRO', 'RDNZAO', 'BR', 'active'),
    ('KISSEREK', 'KAMIL BANAK', 'KISSEREK', 'PL', 'active'),
    ('MODO', 'MĂDĂLIN-ANDREI MIREA', 'MODO', 'RO', 'active'),
    ('SHOCK', 'MAX KVAPIL', 'SHOCK', 'CZ', 'active'),
    ('BEASTIK', 'SEBASTIAN DAŇO', 'BEASTIK', 'CZ', 'active'),
    ('STRESSARN', 'JORDAN MANEVSKI', 'STRESSARN', 'MK', 'active'),
    ('COBRAZERA', 'ANARBILEG UUGANBAYAR', 'COBRAZERA', 'MN', 'active'),
    ('ASAP', 'TYSON PATERSON', 'ASAP', 'AU', 'active'),
    ('TJP', 'TYNAN PURTELL', 'TJP', 'AU', 'active')
)
INSERT INTO players (nickname, display_name, slug, country_id, career_status)
SELECT player_data.nickname, player_data.display_name, player_data.slug,
       countries.id, player_data.career_status
FROM player_data
JOIN countries ON countries.code = player_data.country_code
ON CONFLICT (slug) DO NOTHING;

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('9Z', 'DGT'), ('9Z', 'LUCHOV'), ('9Z', 'HUASOPEEK'), ('9Z', 'MEYERN'), ('9Z', 'MAX'),
    ('ASTRALIS', 'STAEHR'), ('ASTRALIS', 'RYU'), ('ASTRALIS', 'HOOXI'), ('ASTRALIS', 'JABBI'), ('ASTRALIS', 'PHZY'),
    ('AURORA-GAMING', 'WICADIA'), ('AURORA-GAMING', 'XANTARES'), ('AURORA-GAMING', 'WOXIC'), ('AURORA-GAMING', 'SOULFLY'), ('AURORA-GAMING', 'MAJ3R'),
    ('B8-ESPORTS', 'ALEX666'), ('B8-ESPORTS', 'NPL'), ('B8-ESPORTS', 'KENSIZOR'), ('B8-ESPORTS', 'S1ZZI'), ('B8-ESPORTS', 'ESENTHIAL'),
    ('BETBOOM-TEAM', 'BOOMBL4'), ('BETBOOM-TEAM', 'FL4MUS'), ('BETBOOM-TEAM', 'D1LEDEZ'), ('BETBOOM-TEAM', 'MAGNOJEZ'), ('BETBOOM-TEAM', 'ZORTE'),
    ('BIG', 'GR1KS'), ('BIG', 'BLAMEF'), ('BIG', 'JDC'), ('BIG', 'FAVEN'), ('BIG', 'TABSEN'),
    ('FLYQUEST', 'VEXITE'), ('FLYQUEST', 'NETTIK'), ('FLYQUEST', 'JKS'), ('FLYQUEST', 'INS'), ('FLYQUEST', 'STORY'),
    ('FURIA-ESPORTS', 'MOLODOY'), ('FURIA-ESPORTS', 'YEKINDAR'), ('FURIA-ESPORTS', 'YUURIH'), ('FURIA-ESPORTS', 'KSCERATO'), ('FURIA-ESPORTS', 'FALLEN'),
    ('FUT-ESPORTS', 'DEM0N'), ('FUT-ESPORTS', 'KRABENI'), ('FUT-ESPORTS', 'LAUNX'), ('FUT-ESPORTS', 'DZIUGSS'), ('FUT-ESPORTS', 'CMTRY'),
    ('G2-ESPORTS', 'NERTZ'), ('G2-ESPORTS', 'HUNTER'), ('G2-ESPORTS', 'MATYS'), ('G2-ESPORTS', 'HEAVYGOD'), ('G2-ESPORTS', 'SUNPAYUS'),
    ('GAIMIN-GLADIATORS', 'HEN1'), ('GAIMIN-GLADIATORS', 'LUKEN'), ('GAIMIN-GLADIATORS', 'FER'), ('GAIMIN-GLADIATORS', 'NEKIZ'), ('GAIMIN-GLADIATORS', 'JOTA'),
    ('GAMERLEGION', 'REZ'), ('GAMERLEGION', 'HYPEX'), ('GAMERLEGION', 'SNAX'), ('GAMERLEGION', 'TAUSON'), ('GAMERLEGION', 'PR'),
    ('HEROIC', 'NILO'), ('HEROIC', 'YXNGSTXR'), ('HEROIC', 'SUSP'), ('HEROIC', 'CHR1ZN'), ('HEROIC', 'XFL0UD'),
    ('LEGACY', 'LATTO'), ('LEGACY', 'ART'), ('LEGACY', 'DUMAU'), ('LEGACY', 'SAADZIN'), ('LEGACY', 'N1SSIM'),
    ('LYNN-VISION', 'STARRY'), ('LYNN-VISION', 'EMILIAQAQ'), ('LYNN-VISION', 'C4LLM3SU3'), ('LYNN-VISION', 'WESTMELON'), ('LYNN-VISION', 'Z4KR'),
    ('M80', 'SWISHER'), ('M80', 'JBA'), ('M80', 'LAKE'), ('M80', 'SLAXZ'), ('M80', 'S1N'),
    ('MIBR', 'KL1M'), ('MIBR', 'INSANI'), ('MIBR', 'VENOMZERA'), ('MIBR', 'LNZ'), ('MIBR', 'BRNZ4N'),
    ('MONTE', 'AZUWU'), ('MONTE', 'RAINWAKER'), ('MONTE', 'AFRO'), ('MONTE', 'GIZMY'), ('MONTE', 'BYMAS'),
    ('MOUZ', 'TORZSI'), ('MOUZ', 'XERTION'), ('MOUZ', 'SPINX'), ('MOUZ', 'BROLLAN'), ('MOUZ', 'XELEX'),
    ('NATUS-VINCERE', 'B1T'), ('NATUS-VINCERE', 'W0NDERFUL'), ('NATUS-VINCERE', 'IM'), ('NATUS-VINCERE', 'MAKAZZE'), ('NATUS-VINCERE', 'ALEKSIB'),
    ('NRG-ESPORTS', 'GRIM'), ('NRG-ESPORTS', 'SONIC'), ('NRG-ESPORTS', 'BR0'), ('NRG-ESPORTS', 'NITR0'), ('NRG-ESPORTS', 'OSEE'),
    ('PAIN-GAMING', 'SAFFEE'), ('PAIN-GAMING', 'SNOW'), ('PAIN-GAMING', 'PIRIAJR'), ('PAIN-GAMING', 'BIGUZERA'), ('PAIN-GAMING', 'VSM'),
    ('PARIVISION', 'NOTA'), ('PARIVISION', 'XIELO'), ('PARIVISION', 'JAME'), ('PARIVISION', 'ZWEIH'), ('PARIVISION', 'BELCHONOKK'),
    ('SHARKS-ESPORTS', 'KOALA'), ('SHARKS-ESPORTS', 'MAXXKOR'), ('SHARKS-ESPORTS', 'DOC'), ('SHARKS-ESPORTS', 'GAFOLO'), ('SHARKS-ESPORTS', 'RDNZAO'),
    ('SINNERS', 'KISSEREK'), ('SINNERS', 'MODO'), ('SINNERS', 'SHOCK'), ('SINNERS', 'BEASTIK'), ('SINNERS', 'STRESSARN'),
    ('TEAM-FALCONS', 'M0NESY'), ('TEAM-FALCONS', 'NIKO'), ('TEAM-FALCONS', 'KYOUSUKE'), ('TEAM-FALCONS', 'TESES'), ('TEAM-FALCONS', 'KARRIGAN'),
    ('TEAM-LIQUID', 'NAF'), ('TEAM-LIQUID', 'ELIGE'), ('TEAM-LIQUID', 'MALBSMD'), ('TEAM-LIQUID', 'ULTIMATE'), ('TEAM-LIQUID', 'SIUHY'),
    ('TEAM-SPIRIT', 'DONK'), ('TEAM-SPIRIT', 'TN1R'), ('TEAM-SPIRIT', 'SH1RO'), ('TEAM-SPIRIT', 'ZONT1X'), ('TEAM-SPIRIT', 'MAGIXX'),
    ('TEAM-VITALITY', 'ZYWOO'), ('TEAM-VITALITY', 'ROPZ'), ('TEAM-VITALITY', 'FLAMEZ'), ('TEAM-VITALITY', 'APEX'), ('TEAM-VITALITY', 'MEZII'),
    ('THE-MONGOLZ', 'BLITZ'), ('THE-MONGOLZ', '910'), ('THE-MONGOLZ', 'COBRAZERA'), ('THE-MONGOLZ', 'MZINHO'), ('THE-MONGOLZ', 'TECHNO'),
    ('THUNDER-DOWNUNDER', 'ASAP'), ('THUNDER-DOWNUNDER', 'ALISTAIR'), ('THUNDER-DOWNUNDER', 'DEXTER'), ('THUNDER-DOWNUNDER', 'TJP'), ('THUNDER-DOWNUNDER', 'LIAZZ'),
    ('TYLOO', 'JAMYOUNG'), ('TYLOO', 'ZERO'), ('TYLOO', 'JEE'), ('TYLOO', 'MOSEYUH'), ('TYLOO', 'MERCURY')
)
INSERT INTO player_team_years (
  player_id, team_id, year, overall,
  firepower, entrying, trading, opening, clutching, sniping, utility
)
SELECT players.id, teams.id, 2026, 50, 50, 50, 50, 50, 50, 50, 50
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
  WHERE year = 2026;

  SELECT count(*) INTO invalid_team_count
  FROM (
    SELECT team_id
    FROM player_team_years
    WHERE year = 2026
    GROUP BY team_id
    HAVING count(*) <> 5
  ) invalid_teams;

  SELECT count(*) INTO duplicate_player_count
  FROM (
    SELECT player_id
    FROM player_team_years
    WHERE year = 2026
    GROUP BY player_id
    HAVING count(*) <> 1
  ) duplicate_players;

  IF link_count <> 160 OR team_count <> 32 THEN
    RAISE EXCEPTION 'Carga 2026 incompleta: % vinculos em % equipes', link_count, team_count;
  END IF;
  IF invalid_team_count <> 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2026 sem exatamente cinco jogadores', invalid_team_count;
  END IF;
  IF duplicate_player_count <> 0 THEN
    RAISE EXCEPTION 'Existem % jogadores duplicados em 2026', duplicate_player_count;
  END IF;
END
$$;
