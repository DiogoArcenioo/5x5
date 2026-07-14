-- Times participantes do ELEAGUE Major Atlanta 2017 e do PGL Major Kraków 2017.
-- Participantes conferidos em:
-- https://www.hltv.org/events/2471/eleague-major-2017
-- https://www.hltv.org/events/2720/pgl-major-krakow-2017

WITH team_data (name, short_name, slug, country_code) AS (
  VALUES
    ('ASTRALIS', 'AST', 'ASTRALIS', 'DK'),
    ('VIRTUS.PRO', 'VP', 'VIRTUS-PRO', 'PL'),
    ('SK GAMING', 'SK', 'SK-GAMING', 'BR'),
    ('FNATIC', 'FNC', 'FNATIC', 'SE'),
    ('NATUS VINCERE', 'NAVI', 'NATUS-VINCERE', 'UA'),
    ('GAMBIT', 'GMB', 'GAMBIT', 'KZ'),
    ('FAZE CLAN', 'FAZE', 'FAZE-CLAN', 'US'),
    ('NORTH', 'NORTH', 'NORTH', 'DK'),
    ('TEAM LIQUID', 'TL', 'TEAM-LIQUID', 'US'),
    ('GODSENT', 'GODSENT', 'GODSENT', 'SE'),
    ('TEAM ENVYUS', 'ENVY', 'TEAM-ENVYUS', 'FR'),
    ('MOUZ', 'MOUZ', 'MOUZ', 'DE'),
    ('G2 ESPORTS', 'G2', 'G2-ESPORTS', 'FR'),
    ('OPTIC GAMING', 'OPTIC', 'OPTIC-GAMING', 'US'),
    ('HELLRAISERS', 'HR', 'HELLRAISERS', 'UA'),
    ('FLIPSID3 TACTICS', 'F3', 'FLIPSID3-TACTICS', 'UA'),
    ('IMMORTALS', 'IMT', 'IMMORTALS', 'BR'),
    ('BIG', 'BIG', 'BIG', 'DE'),
    ('CLOUD9', 'C9', 'CLOUD9', 'US'),
    ('PENTA SPORTS', 'PENTA', 'PENTA-SPORTS', 'DE'),
    ('VEGA SQUADRON', 'VEGA', 'VEGA-SQUADRON', 'RU')
)
INSERT INTO teams (name, short_name, slug, country_id)
SELECT team_data.name, team_data.short_name, team_data.slug, countries.id
FROM team_data
JOIN countries ON countries.code = team_data.country_code
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    country_id = EXCLUDED.country_id,
    updated_at = now();
