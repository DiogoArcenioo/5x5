-- Lineups oficiais das 24 equipes do BLAST.tv Paris Major 2023.
-- Fontes:
-- https://www.hltv.org/news/36185/visualized-every-team-at-the-paris-major
-- https://www.hltv.org/news/36194/blast-paris-major-teams-schedule-talent-prizes
--
-- Apenas jogadores ainda ausentes sao criados. Os demais preservam o cadastro
-- existente e recebem somente o vinculo/temporada de 2023 abaixo.

WITH player_data (nickname, display_name, slug, country_code, career_status) AS (
  VALUES
    ('THOMAS', 'THOMAS UTTING', 'THOMAS', 'GB', 'active'),
    ('CYPHER', 'CAI WATSON', 'CYPHER', 'GB', 'active'),
    ('VOLT', 'SEBASTIAN MALOS', 'VOLT', 'RO', 'active'),
    ('RALLEN', 'KAROL RODOWICZ', 'RALLEN', 'PL', 'active'),
    ('CRUC1AL', 'JOEY STEUSEL', 'CRUC1AL', 'NL', 'active'),
    ('MYNIO', 'WIKTOR KRUK', 'MYNIO', 'PL', 'active'),
    ('KEI', 'KAMIL PIETKUN', 'KEI', 'PL', 'active'),
    ('KYLAR', 'KAMIL WALUKIEWICZ', 'KYLAR', 'PL', 'active'),
    ('GOOFY', 'KRZYSZTOF GORSKI', 'GOOFY', 'PL', 'active'),
    ('HEADTR1CK', 'DANIIL VALITOV', 'HEADTR1CK', 'UA', 'active'),
    ('R3SALT', 'EVGENY FROLOV', 'R3SALT', 'RU', 'active'),
    ('SKULLZ', 'FELIPE MEDEIROS', 'SKULLZ', 'BR', 'active'),
    ('KAUEZ', 'KAUE KASCHUK', 'KAUEZ', 'BR', 'active'),
    ('WORO2K', 'VOLODYMYR VELETNIUK', 'WORO2K', 'UA', 'active'),
    ('DEMQQ', 'SERGIY DEMCHENKO', 'DEMQQ', 'UA', 'active'),
    ('BOROS', 'MOHAMMAD MALHAS', 'BOROS', 'JO', 'active'),
    ('KRASNAL', 'SZYMON MROZEK', 'KRASNAL', 'PL', 'active'),
    ('NAWWK', 'TIM JONASSON', 'NAWWK', 'SE', 'active'),
    ('JL', 'JUSTINAS LEKAVICIUS', 'JL', 'LT', 'active'),
    ('KYXSAN', 'DAMJAN STOILKOVSKI', 'KYXSAN', 'MK', 'active'),
    ('NERTZ', 'GUY ILUZ', 'NERTZ', 'IL', 'active'),
    ('HASTEKA', 'CHINGUUN BAYARMAA', 'HASTEKA', 'MN', 'active'),
    ('BART4K', 'BAATARKHUU BATBOLD', 'BART4K', 'MN', 'active'),
    ('WOOD7', 'ADRIANO CERATO', 'WOOD7', 'BR', 'active'),
    ('VSM', 'VINICIUS MOREIRA', 'VSM', 'BR', 'active'),
    ('HISTORY', 'ALLAN LAWRENZ', 'HISTORY', 'BR', 'active')
)
INSERT INTO players (nickname, display_name, slug, country_id, career_status)
SELECT player_data.nickname, upper(player_data.display_name), player_data.slug,
       countries.id, player_data.career_status
FROM player_data
JOIN countries ON countries.code = player_data.country_code
ON CONFLICT (slug) DO NOTHING;

DELETE FROM player_team_years WHERE year = 2023;

WITH lineup_data (team_slug, player_slug) AS (
  VALUES
    ('HEROIC','CADIAN'), ('HEROIC','STAVN'), ('HEROIC','TESES'), ('HEROIC','SJUUSH'), ('HEROIC','JABBI'),
    ('NATUS-VINCERE','S1MPLE'), ('NATUS-VINCERE','ELECTRONIC'), ('NATUS-VINCERE','PERFECTO'), ('NATUS-VINCERE','B1T'), ('NATUS-VINCERE','NPL'),
    ('FNATIC','KRIMZ'), ('FNATIC','FASHR'), ('FNATIC','NICOODOZ'), ('FNATIC','ROEJ'), ('FNATIC','MEZII'),
    ('INTO-THE-BREACH','THOMAS'), ('INTO-THE-BREACH','CYPHER'), ('INTO-THE-BREACH','VOLT'), ('INTO-THE-BREACH','RALLEN'), ('INTO-THE-BREACH','CRUC1AL'),
    ('TEAM-VITALITY','APEX'), ('TEAM-VITALITY','ZYWOO'), ('TEAM-VITALITY','DUPREEH'), ('TEAM-VITALITY','MAGISK'), ('TEAM-VITALITY','SPINX'),
    ('FURIA-ESPORTS','ART'), ('FURIA-ESPORTS','KSCERATO'), ('FURIA-ESPORTS','YUURIH'), ('FURIA-ESPORTS','SAFFEE'), ('FURIA-ESPORTS','DROP'),
    ('9INE','MYNIO'), ('9INE','KEI'), ('9INE','KYLAR'), ('9INE','GOOFY'), ('9INE','HADES'),
    ('BAD-NEWS-EAGLES','RIGON'), ('BAD-NEWS-EAGLES','SENER1'), ('BAD-NEWS-EAGLES','JUANFLATROO'), ('BAD-NEWS-EAGLES','SINNOPSYY'), ('BAD-NEWS-EAGLES','GXX'),
    ('G2-ESPORTS','NIKO'), ('G2-ESPORTS','HUNTER'), ('G2-ESPORTS','JKS'), ('G2-ESPORTS','HOOXI'), ('G2-ESPORTS','M0NESY'),
    ('OG','NEXA'), ('OG','NEOFRAG'), ('OG','FLAMEZ'), ('OG','DEGSTER'), ('OG','F1KU'),
    ('NINJAS-IN-PYJAMAS','REZ'), ('NINJAS-IN-PYJAMAS','K0NFIG'), ('NINJAS-IN-PYJAMAS','ALEKSIB'), ('NINJAS-IN-PYJAMAS','BROLLAN'), ('NINJAS-IN-PYJAMAS','HEADTR1CK'),
    ('FORZE','KRAD'), ('FORZE','JERRY'), ('FORZE','ZORTE'), ('FORZE','SHALFEY'), ('FORZE','R3SALT'),
    ('PAIN-GAMING','BIGUZERA'), ('PAIN-GAMING','HARDZAO'), ('PAIN-GAMING','SKULLZ'), ('PAIN-GAMING','ZEVY'), ('PAIN-GAMING','KAUEZ'),
    ('MONTE','WORO2K'), ('MONTE','SDY'), ('MONTE','DEMQQ'), ('MONTE','BOROS'), ('MONTE','KRASNAL'),
    ('GAMERLEGION','ACOR'), ('GAMERLEGION','IM'), ('GAMERLEGION','SIUHY'), ('GAMERLEGION','KEOZ'), ('GAMERLEGION','ISAK'),
    ('APEKS','NAWWK'), ('APEKS','JKAEM'), ('APEKS','STYKO'), ('APEKS','JL'), ('APEKS','KYXSAN'),
    ('FAZE-CLAN','KARRIGAN'), ('FAZE-CLAN','RAIN'), ('FAZE-CLAN','TWISTZZ'), ('FAZE-CLAN','ROPZ'), ('FAZE-CLAN','BROKY'),
    ('TEAM-LIQUID','NITR0'), ('TEAM-LIQUID','NAF'), ('TEAM-LIQUID','ELIGE'), ('TEAM-LIQUID','OSEE'), ('TEAM-LIQUID','YEKINDAR'),
    ('ENCE','SNAPPI'), ('ENCE','DYCHA'), ('ENCE','MADEN'), ('ENCE','SUNPAYUS'), ('ENCE','NERTZ'),
    ('MOUZ','DEXTER'), ('MOUZ','FROZEN'), ('MOUZ','TORZSI'), ('MOUZ','XERTION'), ('MOUZ','JDC'),
    ('COMPLEXITY-GAMING','JT'), ('COMPLEXITY-GAMING','FLOPPY'), ('COMPLEXITY-GAMING','HALLZERK'), ('COMPLEXITY-GAMING','GRIM'), ('COMPLEXITY-GAMING','FANG'),
    ('THE-MONGOLZ','BLITZ'), ('THE-MONGOLZ','TECHNO'), ('THE-MONGOLZ','HASTEKA'), ('THE-MONGOLZ','BART4K'), ('THE-MONGOLZ','ANNIHILATION'),
    ('GRAYHOUND-GAMING','INS'), ('GRAYHOUND-GAMING','SICO'), ('GRAYHOUND-GAMING','ALISTAIR'), ('GRAYHOUND-GAMING','LIAZZ'), ('GRAYHOUND-GAMING','VEXITE'),
    ('FLUXO','FELPS'), ('FLUXO','WOOD7'), ('FLUXO','VSM'), ('FLUXO','LUCAOZY'), ('FLUXO','HISTORY')
)
INSERT INTO player_team_years (
  player_id, team_id, year, overall,
  firepower, entrying, trading, opening, clutching, sniping, utility
)
SELECT players.id, teams.id, 2023, 50, 50, 50, 50, 50, 50, 50, 50
FROM lineup_data
JOIN players ON players.slug = lineup_data.player_slug
JOIN teams ON teams.slug = lineup_data.team_slug;

DO $$
DECLARE link_count integer; team_count integer; invalid_team_count integer; duplicate_player_count integer;
BEGIN
  SELECT count(*), count(DISTINCT team_id) INTO link_count, team_count
  FROM player_team_years WHERE year = 2023;
  SELECT count(*) INTO invalid_team_count FROM (
    SELECT team_id FROM player_team_years WHERE year = 2023
    GROUP BY team_id HAVING count(*) <> 5
  ) invalid_teams;
  SELECT count(*) INTO duplicate_player_count FROM (
    SELECT player_id FROM player_team_years WHERE year = 2023
    GROUP BY player_id HAVING count(*) <> 1
  ) duplicate_players;
  IF link_count <> 120 OR team_count <> 24 THEN
    RAISE EXCEPTION 'Carga 2023 incompleta: % vinculos em % equipes', link_count, team_count;
  END IF;
  IF invalid_team_count <> 0 THEN
    RAISE EXCEPTION 'Existem % equipes de 2023 sem exatamente cinco jogadores', invalid_team_count;
  END IF;
  IF duplicate_player_count <> 0 THEN
    RAISE EXCEPTION 'Existem % jogadores duplicados em 2023', duplicate_player_count;
  END IF;
END
$$;
