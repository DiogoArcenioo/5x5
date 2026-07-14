-- Fotografia das lineups que fecharam 2022 entre as organizacoes que
-- participaram dos Majors de Antwerp e Rio.
-- Fontes:
-- https://www.hltv.org/news/33743/pgl-major-antwerp-viewers-guide
-- https://www.hltv.org/news/34919/iem-rio-major-viewers-guide
-- https://www.hltv.org/news/35318/team-ranking-december-2022
-- A Renegades encerrou a operacao no ano e seu nucleo terminou 2022 na
-- Grayhound; por isso nao recebe uma segunda copia da mesma lineup.

WITH player_data (nickname, display_name, slug, country_code, career_status) AS (
  VALUES
    ('NITR0', 'NICK CANNELLA', 'NITR0', 'US', 'active'),
    ('OSEE', 'JOSH OHM', 'OSEE', 'US', 'active'),
    ('ALEKSIB', 'ALEKSI VIROLAINEN', 'ALEKSIB', 'FI', 'active'),
    ('ES3TAG', 'PATRICK HANSEN', 'ES3TAG', 'DK', 'active'),
    ('MADEN', 'PAVLE BOŠKOVIĆ', 'MADEN', 'ME', 'active'),
    ('NPL', 'ANDRII KUKHARSKYI', 'NPL', 'UA', 'active'),
    ('S1REN', 'PAVEL OGLOBLIN', 'S1REN', 'RU', 'active'),
    ('PATSI', 'ROBERT ISYANOV', 'PATSI', 'RU', 'active'),
    ('W0NDERFUL', 'IHOR ZHDANOV', 'W0NDERFUL', 'UA', 'active'),
    ('STAEHR', 'VICTOR STAEHR', 'STAEHR', 'DK', 'active'),
    ('LAUNX', 'LAURENȚIU ȚÂRLEA', 'LAUNX', 'RO', 'active'),
    ('SLAXZ', 'FRITZ DIETRICH', 'SLAXZ', 'DE', 'active'),
    ('JDC', 'JON DE CASTRO', 'JDC', 'DE', 'active'),
    ('TORZSI', 'ÁDÁM TORZSÁS', 'TORZSI', 'HU', 'active'),
    ('XERTION', 'DORIAN BERMAN', 'XERTION', 'IL', 'active'),
    ('NEOFRAG', 'ADAM ZOUHAR', 'NEOFRAG', 'CZ', 'active'),
    ('FLAMEZ', 'SHAHAR SHUSHAN', 'FLAMEZ', 'IL', 'active'),
    ('F1KU', 'MACIEJ MIKLAS', 'F1KU', 'PL', 'active'),
    ('FAVEN', 'JOSEF BAUMANN', 'FAVEN', 'DE', 'active'),
    ('KRIMBO', 'KARIM MOUSSA', 'KRIMBO', 'DE', 'active'),
    ('HEXT', 'JADAN POSTMA', 'HEXT', 'CA', 'active'),
    ('RIGON', 'RIGON GASHI', 'RIGON', 'CH', 'active'),
    ('SENER1', 'SENER MAHMUTI', 'SENER1', 'XK', 'active'),
    ('JUANFLATROO', 'FLATRON HALIMI', 'JUANFLATROO', 'XK', 'active'),
    ('SINNOPSYY', 'DIONIS BUDECI', 'SINNOPSYY', 'XK', 'active'),
    ('GXX', 'GENC KOLGECI', 'GXX', 'XK', 'active'),
    ('MAX', 'MAXIMILIANO GONZALEZ', 'MAX', 'UY', 'active'),
    ('DGT', 'FRANCO GARCIA', 'DGT', 'UY', 'active'),
    ('DAV1DEUS', 'DAVID TAPIA MALDONADO', 'DAV1DEUS', 'CL', 'active'),
    ('NQZ', 'LUCAS SOARES', 'NQZ', 'BR', 'active'),
    ('BUDA', 'NICOLÁS KRAMER', 'BUDA', 'AR', 'active'),
    ('FAME', 'PETR BOLYSHEV', 'FAME', 'RU', 'active'),
    ('FASHR', 'DION DERKSEN', 'FASHR', 'NL', 'active'),
    ('MEZII', 'WILLIAM MERRIMAN', 'MEZII', 'GB', 'active'),
    ('IM', 'MIHAI IVAN', 'IM', 'RO', 'active'),
    ('SIUHY', 'KAMIL SZKARADEK', 'SIUHY', 'PL', 'active'),
    ('ISAK', 'ISAK FAHLÉN', 'ISAK', 'SE', 'active'),
    ('TRY', 'SANTINO RIGAL', 'TRY', 'AR', 'active'),
    ('VEXITE', 'DECLAN PORTELLI', 'VEXITE', 'AU', 'active'),
    ('KABAL', 'BAT-ENKH BATBAYAR', 'KABAL', 'MN', 'active'),
    ('SK0R', 'TENGIS BATJARGAL', 'SK0R', 'MN', 'active'),
    ('ANNIHILATION', 'TUVSHINTUGS NYAMDORJ', 'ANNIHILATION', 'MN', 'active'),
    ('BLITZ', 'GARIDMAGNAI BYAMBASUREN', 'BLITZ', 'MN', 'active'),
    ('TECHNO', 'SODBAYAR MUNKHBOLD', 'TECHNO', 'MN', 'active'),
    ('M0NESY', 'ILYA OSIPOV', 'M0NESY', 'RU', 'active'),
    ('BUZZ', 'CHRISTIAN ANDERSEN', 'BUZZ', 'DK', 'active'),
    ('EXIT', 'RAPHAEL LACERDA', 'EXIT', 'BR', 'active'),
    ('BRNZ4N', 'BRENO POLETTO', 'BRNZ4N', 'BR', 'active'),
    ('JOTA', 'JHONATAN WILLian', 'JOTA', 'BR', 'active'),
    ('TUURTLE', 'MATHEUS ANHAIA', 'TUURTLE', 'BR', 'active'),
    ('KENSI', 'ALEKSANDR GURKIN', 'KENSI', 'RU', 'active'),
    ('NORWI', 'EVGENY ERMOLIN', 'NORWI', 'RU', 'active'),
    ('ZORTE', 'ALEKSANDR ZAGODYRENKO', 'ZORTE', 'RU', 'active'),
    ('SHALFEY', 'ALEKSANDR MARENOV', 'SHALFEY', 'RU', 'active'),
    ('RAALZ', 'RASMUS STEENSBORG', 'RAALZ', 'DK', 'active'),
    ('TMB', 'THOMAS BUNDSBÆK', 'TMB', 'DK', 'active'),
    ('BIRDFROMSKY', 'THOMAS DUE-FREDERIKSEN', 'BIRDFROMSKY', 'DK', 'active'),
    ('REGALI', 'IULIAN HARJĂU', 'REGALI', 'RO', 'active'),
    ('JT', 'JOHNNY THEODOSIOU', 'JT', 'ZA', 'active'),
    ('FLOPPY', 'RICKY KEMERY', 'FLOPPY', 'US', 'active'),
    ('HALLZERK', 'HÅKON FJÆRLI', 'HALLZERK', 'NO', 'active'),
    ('FANG', 'JUSTIN COAKLEY', 'FANG', 'CA', 'active'),
    ('IMORR', 'ÖMER KARATAŞ', 'IMORR', 'TR', 'active'),
    ('XFL0UD', 'YASIN KOÇ', 'XFL0UD', 'TR', 'active')
)
INSERT INTO players (nickname, display_name, slug, country_id, career_status)
SELECT player_data.nickname, upper(player_data.display_name), player_data.slug,
       countries.id, player_data.career_status
FROM player_data
JOIN countries ON countries.code = player_data.country_code
ON CONFLICT (slug) DO UPDATE
SET nickname = EXCLUDED.nickname,
    display_name = EXCLUDED.display_name,
    country_id = EXCLUDED.country_id,
    career_status = EXCLUDED.career_status,
    updated_at = now();

DELETE FROM player_team_years WHERE year = 2022;

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('FAZE-CLAN','KARRIGAN'), ('FAZE-CLAN','RAIN'), ('FAZE-CLAN','TWISTZZ'), ('FAZE-CLAN','ROPZ'), ('FAZE-CLAN','BROKY'),
    ('TEAM-LIQUID','NITR0'), ('TEAM-LIQUID','NAF'), ('TEAM-LIQUID','ELIGE'), ('TEAM-LIQUID','OSEE'), ('TEAM-LIQUID','YEKINDAR'),
    ('NINJAS-IN-PYJAMAS','REZ'), ('NINJAS-IN-PYJAMAS','HAMPUS'), ('NINJAS-IN-PYJAMAS','ALEKSIB'), ('NINJAS-IN-PYJAMAS','BROLLAN'), ('NINJAS-IN-PYJAMAS','ES3TAG'),
    ('ENCE','SNAPPI'), ('ENCE','VALDE'), ('ENCE','MADEN'), ('ENCE','DYCHA'), ('ENCE','SUNPAYUS'),
    ('NATUS-VINCERE','S1MPLE'), ('NATUS-VINCERE','ELECTRONIC'), ('NATUS-VINCERE','PERFECTO'), ('NATUS-VINCERE','B1T'), ('NATUS-VINCERE','NPL'),
    ('HEROIC','CADIAN'), ('HEROIC','STAVN'), ('HEROIC','TESES'), ('HEROIC','SJUUSH'), ('HEROIC','JABBI'),
    ('TEAM-SPIRIT','CHOPPER'), ('TEAM-SPIRIT','MAGIXX'), ('TEAM-SPIRIT','S1REN'), ('TEAM-SPIRIT','PATSI'), ('TEAM-SPIRIT','W0NDERFUL'),
    ('SPROUT','REFREZH'), ('SPROUT','STAEHR'), ('SPROUT','ZYPHON'), ('SPROUT','LAUNX'), ('SPROUT','SLAXZ'),
    ('TEAM-VITALITY','APEX'), ('TEAM-VITALITY','ZYWOO'), ('TEAM-VITALITY','DUPREEH'), ('TEAM-VITALITY','MAGISK'), ('TEAM-VITALITY','SPINX'),
    ('CLOUD9','HOBBIT'), ('CLOUD9','INTERZ'), ('CLOUD9','AX1LE'), ('CLOUD9','SH1RO'), ('CLOUD9','NAFANY'),
    ('MOUZ','DEXTER'), ('MOUZ','FROZEN'), ('MOUZ','JDC'), ('MOUZ','TORZSI'), ('MOUZ','XERTION'),
    ('OG','NEXA'), ('OG','NEOFRAG'), ('OG','FLAMEZ'), ('OG','DEGSTER'), ('OG','F1KU'),
    ('BIG','TABSEN'), ('BIG','SYRSON'), ('BIG','FAVEN'), ('BIG','KRIMBO'), ('BIG','K1TO'),
    ('EVIL-GENIUSES','AUTIMATIC'), ('EVIL-GENIUSES','BREHZE'), ('EVIL-GENIUSES','CERQ'), ('EVIL-GENIUSES','NEALAN'), ('EVIL-GENIUSES','HEXT'),
    ('BAD-NEWS-EAGLES','RIGON'), ('BAD-NEWS-EAGLES','SENER1'), ('BAD-NEWS-EAGLES','JUANFLATROO'), ('BAD-NEWS-EAGLES','SINNOPSYY'), ('BAD-NEWS-EAGLES','GXX'),
    ('9Z','MAX'), ('9Z','DGT'), ('9Z','DAV1DEUS'), ('9Z','NQZ'), ('9Z','BUDA'),
    ('OUTSIDERS','FL1T'), ('OUTSIDERS','QIKERT'), ('OUTSIDERS','JAME'), ('OUTSIDERS','N0RB3R7'), ('OUTSIDERS','FAME'),
    ('FURIA-ESPORTS','ART'), ('FURIA-ESPORTS','YUURIH'), ('FURIA-ESPORTS','KSCERATO'), ('FURIA-ESPORTS','SAFFEE'), ('FURIA-ESPORTS','DROP'),
    ('FNATIC','KRIMZ'), ('FNATIC','FASHR'), ('FNATIC','NICOODOZ'), ('FNATIC','ROEJ'), ('FNATIC','MEZII'),
    ('IMPERIAL','FALLEN'), ('IMPERIAL','FER'), ('IMPERIAL','BOLTZ'), ('IMPERIAL','CHELO'), ('IMPERIAL','VINI'),
    ('GAMERLEGION','ACOR'), ('GAMERLEGION','IM'), ('GAMERLEGION','KEOZ'), ('GAMERLEGION','SIUHY'), ('GAMERLEGION','ISAK'),
    ('00NATION','COLDZERA'), ('00NATION','TACO'), ('00NATION','DUMAU'), ('00NATION','LATTO'), ('00NATION','TRY'),
    ('GRAYHOUND-GAMING','SICO'), ('GRAYHOUND-GAMING','LIAZZ'), ('GRAYHOUND-GAMING','ALISTAIR'), ('GRAYHOUND-GAMING','INS'), ('GRAYHOUND-GAMING','VEXITE'),
    ('IHC','KABAL'), ('IHC','SK0R'), ('IHC','ANNIHILATION'), ('IHC','BLITZ'), ('IHC','TECHNO'),
    ('G2-ESPORTS','NIKO'), ('G2-ESPORTS','HUNTER'), ('G2-ESPORTS','JKS'), ('G2-ESPORTS','HOOXI'), ('G2-ESPORTS','M0NESY'),
    ('ASTRALIS','XYP9X'), ('ASTRALIS','GLA1VE'), ('ASTRALIS','DEVICE'), ('ASTRALIS','BLAMEF'), ('ASTRALIS','BUZZ'),
    ('MIBR','EXIT'), ('MIBR','BRNZ4N'), ('MIBR','HEN1'), ('MIBR','JOTA'), ('MIBR','TUURTLE'),
    ('FORZE','JERRY'), ('FORZE','KENSI'), ('FORZE','NORWI'), ('FORZE','ZORTE'), ('FORZE','SHALFEY'),
    ('COPENHAGEN-FLAMES','RAALZ'), ('COPENHAGEN-FLAMES','BORUP'), ('COPENHAGEN-FLAMES','TMB'), ('COPENHAGEN-FLAMES','BIRDFROMSKY'), ('COPENHAGEN-FLAMES','REGALI'),
    ('COMPLEXITY-GAMING','JT'), ('COMPLEXITY-GAMING','FLOPPY'), ('COMPLEXITY-GAMING','HALLZERK'), ('COMPLEXITY-GAMING','GRIM'), ('COMPLEXITY-GAMING','FANG'),
    ('ETERNAL-FIRE','XANTARES'), ('ETERNAL-FIRE','WOXIC'), ('ETERNAL-FIRE','CALYX'), ('ETERNAL-FIRE','IMORR'), ('ETERNAL-FIRE','XFL0UD')
)
INSERT INTO player_team_years (
  player_id, team_id, year, overall,
  firepower, entrying, trading, opening, clutching, sniping, utility
)
SELECT players.id, teams.id, 2022, 50, 50, 50, 50, 50, 50, 50, 50
FROM lineup_data
JOIN players ON players.slug = lineup_data.player_slug
JOIN teams ON teams.slug = lineup_data.team_slug;

DO $$
DECLARE link_count integer; team_count integer; invalid_team_count integer; duplicate_player_count integer;
BEGIN
  SELECT count(*), count(DISTINCT team_id) INTO link_count, team_count
  FROM player_team_years WHERE year = 2022;
  SELECT count(*) INTO invalid_team_count FROM (
    SELECT team_id FROM player_team_years WHERE year = 2022
    GROUP BY team_id HAVING count(*) <> 5
  ) invalid_teams;
  SELECT count(*) INTO duplicate_player_count FROM (
    SELECT player_id FROM player_team_years WHERE year = 2022
    GROUP BY player_id HAVING count(*) <> 1
  ) duplicate_players;
  IF link_count <> 155 OR team_count <> 31 THEN
    RAISE EXCEPTION 'Carga 2022 incompleta: % vinculos em % equipes', link_count, team_count;
  END IF;
  IF invalid_team_count <> 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2022 sem exatamente cinco jogadores', invalid_team_count;
  END IF;
  IF duplicate_player_count <> 0 THEN
    RAISE EXCEPTION 'Existem % jogadores duplicados em 2022', duplicate_player_count;
  END IF;
END
$$;
