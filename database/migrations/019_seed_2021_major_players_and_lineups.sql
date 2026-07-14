-- Jogadores e lineups do PGL Major Stockholm 2021.
-- Fontes:
-- https://www.hltv.org/news/32617/pgl-major-stockholm-viewers-guide
-- https://www.hltv.org/events/6207/pgl-major-stockholm-2021-challengers-stage
-- Cada uma das 24 equipes recebe exatamente cinco jogadores e cada jogador
-- aparece em apenas um time no ano. Os atributos provisorios desta carga sao
-- substituidos pelos valores anuais Both Sides da HLTV na migration seguinte.

WITH player_data (nickname, display_name, slug, country_code, career_status) AS (
  VALUES
    ('BUBZKJI', 'LUCAS ANDERSEN', 'BUBZKJI', 'DK', 'active'),
    ('B1T', 'VALERIY VAKHOVSKIY', 'B1T', 'UA', 'active'),
    ('INTERZ', 'TIMOFEY YAKUSHIN', 'INTERZ', 'RU', 'active'),
    ('SH1RO', 'DMITRY SOKOLOV', 'SH1RO', 'RU', 'active'),
    ('NAFANY', 'VLADISLAV GORSHKOV', 'NAFANY', 'RU', 'active'),
    ('LNZ', 'LINUS HOLTÄNG', 'LNZ', 'SE', 'active'),
    ('KYOJIN', 'JAYSON NGUYEN VAN', 'KYOJIN', 'FR', 'active'),
    ('DROP', 'ANDRÉ ABREU', 'DROP', 'BR', 'active'),
    ('BREHZE', 'VINCENT CAYONTE', 'BREHZE', 'US', 'active'),
    ('CERQ', 'TSVETELIN DIMITROV', 'CERQ', 'BG', 'active'),
    ('DEGSTER', 'ABDUL GASANOV', 'DEGSTER', 'RU', 'active'),
    ('SANJI', 'SANJAR KULIEV', 'SANJI', 'UZ', 'active'),
    ('YEKINDAR', 'MAREKS GAĻINSKIS', 'YEKINDAR', 'LV', 'active'),
    ('NICKELBACK', 'ALEKSEI TROFIMOV', 'NICKELBACK', 'RU', 'active'),
    ('KRAD', 'VLADISLAV KRAVCHENKO', 'KRAD', 'RU', 'active'),
    ('FORESTER', 'IGOR BEZOTECHESKIY', 'FORESTER', 'RU', 'active'),
    ('SPINX', 'LOTAN GILADI', 'SPINX', 'IL', 'active'),
    ('DYCHA', 'PAWEŁ DYCHA', 'DYCHA', 'PL', 'active'),
    ('HADES', 'OLEK MISKIEWICZ', 'HADES', 'PL', 'active'),
    ('DOTO', 'JOONAS FORSS', 'DOTO', 'FI', 'active'),
    ('ALEX', 'ALEJANDRO MASANET', 'ALEX-ES', 'ES', 'active'),
    ('MOPOZ', 'ALEJANDRO FERNÁNDEZ-QUEJO CANO', 'MOPOZ', 'ES', 'active'),
    ('DEATHZZ', 'RAUL JORDÁN NIETO', 'DEATHZZ', 'ES', 'active'),
    ('SUNPAYUS', 'ALVARO GARCIA', 'SUNPAYUS', 'ES', 'active'),
    ('DAV1G', 'DAVID GRANADO BERMUDO', 'DAV1G', 'ES', 'active'),
    ('SJUUSH', 'RASMUS BECK', 'SJUUSH', 'DK', 'active'),
    ('ACOR', 'FREDERIK GYLDSTRAND', 'ACOR', 'DK', 'active'),
    ('BYMAS', 'AURIMAS PIPIRAS', 'BYMAS', 'LT', 'active'),
    ('HOOXI', 'RASMUS NIELSEN', 'HOOXI', 'DK', 'active'),
    ('NICOODOZ', 'NICO TAMJIDI', 'NICOODOZ', 'DK', 'active'),
    ('ROEJ', 'FREDRIK JØRGENSEN', 'ROEJ', 'DK', 'active'),
    ('JABBI', 'JAKOB NYGAARD', 'JABBI', 'DK', 'active'),
    ('ZYPHON', 'RASMUS NORDFOSS', 'ZYPHON', 'DK', 'active'),
    ('PKL', 'VINICIOS COELHO', 'PKL', 'BR', 'active'),
    ('NEKIZ', 'GABRIEL SCHENATO', 'NEKIZ', 'BR', 'active'),
    ('HARDZAO', 'WESLEY LOPES', 'HARDZAO', 'BR', 'active'),
    ('BIGUZERA', 'RODRIGO BITTENCOURT', 'BIGUZERA', 'BR', 'active'),
    ('SAFFEE', 'RAFAEL COSTA', 'SAFFEE', 'BR', 'active'),
    ('B4RTIN', 'BRUNO CÂMARA', 'B4RTIN', 'BR', 'active'),
    ('DUMAU', 'EDUARDO WOLKMER', 'DUMAU', 'BR', 'active'),
    ('LATTO', 'BRUNO REBELATTO', 'LATTO', 'BR', 'active'),
    ('HATZ', 'JORDAN BAJIC', 'HATZ', 'AU', 'active'),
    ('ALISTAIR', 'ALISTAIR JOHNSTON', 'ALISTAIR', 'AU', 'active'),
    ('JNT', 'JHONATAN SILVA', 'JNT', 'BR', 'active'),
    ('PANCC', 'FELIPE MARTINS', 'PANCC', 'BR', 'active'),
    ('LUCAOZY', 'LUCAS NEVES', 'LUCAOZY', 'BR', 'active'),
    ('REALZ1N', 'MARCOS JÚNIOR', 'REALZ1N', 'BR', 'active'),
    ('ZEVY', 'ROMEU ROCCO', 'ZEVY', 'BR', 'active'),
    ('SLOWLY', 'KELUN SUN', 'SLOWLY', 'CN', 'active'),
    ('DANK1NG', 'ZHENGHAO LV', 'DANK1NG', 'CN', 'active')
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

DELETE FROM player_team_years WHERE year = 2021;

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('ASTRALIS', 'XYP9X'), ('ASTRALIS', 'DUPREEH'),
    ('ASTRALIS', 'MAGISK'), ('ASTRALIS', 'BUBZKJI'), ('ASTRALIS', 'LUCKY'),
    ('NATUS-VINCERE', 'S1MPLE'), ('NATUS-VINCERE', 'ELECTRONIC'),
    ('NATUS-VINCERE', 'BOOMBL4'), ('NATUS-VINCERE', 'PERFECTO'),
    ('NATUS-VINCERE', 'B1T'),
    ('GAMBIT', 'HOBBIT'), ('GAMBIT', 'INTERZ'), ('GAMBIT', 'AX1LE'),
    ('GAMBIT', 'SH1RO'), ('GAMBIT', 'NAFANY'),
    ('NINJAS-IN-PYJAMAS', 'DEVICE'), ('NINJAS-IN-PYJAMAS', 'REZ'),
    ('NINJAS-IN-PYJAMAS', 'HAMPUS'), ('NINJAS-IN-PYJAMAS', 'PLOPSKI'),
    ('NINJAS-IN-PYJAMAS', 'LNZ'),
    ('TEAM-VITALITY', 'ZYWOO'), ('TEAM-VITALITY', 'APEX'),
    ('TEAM-VITALITY', 'SHOX'), ('TEAM-VITALITY', 'MISUTAAA'),
    ('TEAM-VITALITY', 'KYOJIN'),
    ('G2-ESPORTS', 'JACKZ'), ('G2-ESPORTS', 'NIKO'),
    ('G2-ESPORTS', 'HUNTER'), ('G2-ESPORTS', 'AMANEK'),
    ('G2-ESPORTS', 'NEXA'),
    ('FURIA-ESPORTS', 'ART'), ('FURIA-ESPORTS', 'KSCERATO'),
    ('FURIA-ESPORTS', 'YUURIH'), ('FURIA-ESPORTS', 'VINI'),
    ('FURIA-ESPORTS', 'DROP'),
    ('TEAM-LIQUID', 'ELIGE'), ('TEAM-LIQUID', 'NAF'),
    ('TEAM-LIQUID', 'STEWIE2K'), ('TEAM-LIQUID', 'GRIM'),
    ('TEAM-LIQUID', 'FALLEN'),
    ('EVIL-GENIUSES', 'BREHZE'), ('EVIL-GENIUSES', 'CERQ'),
    ('EVIL-GENIUSES', 'STANISLAW'), ('EVIL-GENIUSES', 'MICHU'),
    ('EVIL-GENIUSES', 'OBO'),
    ('TEAM-SPIRIT', 'CHOPPER'), ('TEAM-SPIRIT', 'MIR'),
    ('TEAM-SPIRIT', 'SDY'), ('TEAM-SPIRIT', 'DEGSTER'),
    ('TEAM-SPIRIT', 'MAGIXX'),
    ('VIRTUS-PRO', 'SANJI'), ('VIRTUS-PRO', 'BUSTER'),
    ('VIRTUS-PRO', 'QIKERT'), ('VIRTUS-PRO', 'JAME'),
    ('VIRTUS-PRO', 'YEKINDAR'),
    ('ENTROPIQ', 'NICKELBACK'), ('ENTROPIQ', 'KRAD'),
    ('ENTROPIQ', 'FORESTER'), ('ENTROPIQ', 'EL1AN'),
    ('ENTROPIQ', 'LACK1'),
    ('ENCE', 'SNAPPI'), ('ENCE', 'SPINX'), ('ENCE', 'DYCHA'),
    ('ENCE', 'HADES'), ('ENCE', 'DOTO'),
    ('BIG', 'TABSEN'), ('BIG', 'TIZIAN'), ('BIG', 'SYRSON'),
    ('BIG', 'K1TO'), ('BIG', 'GADE'),
    ('MOVISTAR-RIDERS', 'ALEX-ES'), ('MOVISTAR-RIDERS', 'MOPOZ'),
    ('MOVISTAR-RIDERS', 'DEATHZZ'), ('MOVISTAR-RIDERS', 'SUNPAYUS'),
    ('MOVISTAR-RIDERS', 'DAV1G'),
    ('HEROIC', 'CADIAN'), ('HEROIC', 'REFREZH'),
    ('HEROIC', 'STAVN'), ('HEROIC', 'TESES'), ('HEROIC', 'SJUUSH'),
    ('MOUZ', 'DEXTER'), ('MOUZ', 'FROZEN'), ('MOUZ', 'ACOR'),
    ('MOUZ', 'ROPZ'), ('MOUZ', 'BYMAS'),
    ('FAZE-CLAN', 'KARRIGAN'), ('FAZE-CLAN', 'OLOFMEISTER'),
    ('FAZE-CLAN', 'RAIN'), ('FAZE-CLAN', 'TWISTZZ'),
    ('FAZE-CLAN', 'BROKY'),
    ('COPENHAGEN-FLAMES', 'HOOXI'), ('COPENHAGEN-FLAMES', 'NICOODOZ'),
    ('COPENHAGEN-FLAMES', 'ROEJ'), ('COPENHAGEN-FLAMES', 'JABBI'),
    ('COPENHAGEN-FLAMES', 'ZYPHON'),
    ('PAIN-GAMING', 'PKL'), ('PAIN-GAMING', 'NEKIZ'),
    ('PAIN-GAMING', 'HARDZAO'), ('PAIN-GAMING', 'BIGUZERA'),
    ('PAIN-GAMING', 'SAFFEE'),
    ('GODSENT', 'TACO'), ('GODSENT', 'FELPS'),
    ('GODSENT', 'B4RTIN'), ('GODSENT', 'DUMAU'), ('GODSENT', 'LATTO'),
    ('RENEGADES', 'SICO'), ('RENEGADES', 'MALTA'),
    ('RENEGADES', 'HATZ'), ('RENEGADES', 'INS'),
    ('RENEGADES', 'ALISTAIR'),
    ('SHARKS-ESPORTS', 'JNT'), ('SHARKS-ESPORTS', 'PANCC'),
    ('SHARKS-ESPORTS', 'LUCAOZY'), ('SHARKS-ESPORTS', 'REALZ1N'),
    ('SHARKS-ESPORTS', 'ZEVY'),
    ('TYLOO', 'SUMMER'), ('TYLOO', 'ATTACKER'),
    ('TYLOO', 'SOMEBODY'), ('TYLOO', 'SLOWLY'), ('TYLOO', 'DANK1NG')
)
INSERT INTO player_team_years (
  player_id, team_id, year, overall,
  firepower, entrying, trading, opening, clutching, sniping, utility
)
SELECT players.id, teams.id, 2021, 50, 50, 50, 50, 50, 50, 50, 50
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
  WHERE year = 2021;

  SELECT count(*) INTO invalid_team_count
  FROM (
    SELECT team_id
    FROM player_team_years
    WHERE year = 2021
    GROUP BY team_id
    HAVING count(*) <> 5
  ) invalid_teams;

  SELECT count(*) INTO duplicate_player_count
  FROM (
    SELECT player_id
    FROM player_team_years
    WHERE year = 2021
    GROUP BY player_id
    HAVING count(*) <> 1
  ) duplicate_players;

  IF link_count <> 120 OR team_count <> 24 THEN
    RAISE EXCEPTION 'Carga 2021 incompleta: % vinculos em % equipes', link_count, team_count;
  END IF;
  IF invalid_team_count <> 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2021 sem exatamente cinco jogadores', invalid_team_count;
  END IF;
  IF duplicate_player_count <> 0 THEN
    RAISE EXCEPTION 'Existem % jogadores duplicados em 2021', duplicate_player_count;
  END IF;
END
$$;
