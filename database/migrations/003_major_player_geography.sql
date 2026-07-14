-- Regiões e países representados por jogadores em Majors de Counter-Strike
-- desde o ELEAGUE Major Atlanta 2017 até o IEM Cologne Major 2026.
-- Referência do recorte: https://liquipedia.net/counterstrike/Majors/Player_Database
--
-- Os códigos de país seguem ISO 3166-1 alpha-2. Kosovo é a exceção: XK é
-- usado como código operacional porque o país ainda não possui código oficial.

INSERT INTO regions (code, name)
VALUES
  ('AFRICA', 'África'),
  ('ASIA', 'Ásia'),
  ('CIS', 'CIS'),
  ('EUROPE', 'Europa'),
  ('MIDDLE_EAST', 'Oriente Médio'),
  ('NORTH_AMERICA', 'América do Norte'),
  ('OCEANIA', 'Oceania'),
  ('SOUTH_AMERICA', 'América do Sul')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name;

WITH country_data (code, name, region_code) AS (
  VALUES
    ('AR', 'Argentina', 'SOUTH_AMERICA'),
    ('AU', 'Austrália', 'OCEANIA'),
    ('AZ', 'Azerbaijão', 'CIS'),
    ('BA', 'Bósnia e Herzegovina', 'EUROPE'),
    ('BE', 'Bélgica', 'EUROPE'),
    ('BG', 'Bulgária', 'EUROPE'),
    ('BR', 'Brasil', 'SOUTH_AMERICA'),
    ('BY', 'Belarus', 'CIS'),
    ('CA', 'Canadá', 'NORTH_AMERICA'),
    ('CH', 'Suíça', 'EUROPE'),
    ('CL', 'Chile', 'SOUTH_AMERICA'),
    ('CN', 'China', 'ASIA'),
    ('CZ', 'Tchéquia', 'EUROPE'),
    ('DE', 'Alemanha', 'EUROPE'),
    ('DK', 'Dinamarca', 'EUROPE'),
    ('EE', 'Estônia', 'EUROPE'),
    ('ES', 'Espanha', 'EUROPE'),
    ('FI', 'Finlândia', 'EUROPE'),
    ('FR', 'França', 'EUROPE'),
    ('GB', 'Reino Unido', 'EUROPE'),
    ('GT', 'Guatemala', 'NORTH_AMERICA'),
    ('HK', 'Hong Kong', 'ASIA'),
    ('HU', 'Hungria', 'EUROPE'),
    ('ID', 'Indonésia', 'ASIA'),
    ('IL', 'Israel', 'MIDDLE_EAST'),
    ('JO', 'Jordânia', 'MIDDLE_EAST'),
    ('KZ', 'Cazaquistão', 'CIS'),
    ('LT', 'Lituânia', 'EUROPE'),
    ('LV', 'Letônia', 'EUROPE'),
    ('ME', 'Montenegro', 'EUROPE'),
    ('MK', 'Macedônia do Norte', 'EUROPE'),
    ('MN', 'Mongólia', 'ASIA'),
    ('MY', 'Malásia', 'ASIA'),
    ('NL', 'Países Baixos', 'EUROPE'),
    ('NO', 'Noruega', 'EUROPE'),
    ('NZ', 'Nova Zelândia', 'OCEANIA'),
    ('PL', 'Polônia', 'EUROPE'),
    ('PT', 'Portugal', 'EUROPE'),
    ('RO', 'Romênia', 'EUROPE'),
    ('RS', 'Sérvia', 'EUROPE'),
    ('RU', 'Rússia', 'CIS'),
    ('SE', 'Suécia', 'EUROPE'),
    ('SK', 'Eslováquia', 'EUROPE'),
    ('TR', 'Turquia', 'EUROPE'),
    ('TW', 'Taiwan', 'ASIA'),
    ('UA', 'Ucrânia', 'CIS'),
    ('US', 'Estados Unidos', 'NORTH_AMERICA'),
    ('UY', 'Uruguai', 'SOUTH_AMERICA'),
    ('UZ', 'Uzbequistão', 'CIS'),
    ('XK', 'Kosovo', 'EUROPE'),
    ('ZA', 'África do Sul', 'AFRICA')
)
INSERT INTO countries (code, name, region_id)
SELECT country_data.code, country_data.name, regions.id
FROM country_data
JOIN regions ON regions.code = country_data.region_code
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    region_id = EXCLUDED.region_id;
