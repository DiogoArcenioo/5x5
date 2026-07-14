-- Corrige as fotografias anuais de 2020 com os atributos HLTV.
-- Fonte: https://www.hltv.org/stats/players/<id>/<slug>?startDate=AAAA-01-01&endDate=AAAA-12-31
-- Lado usado: Both Sides (primeiro valor de cada atributo).
-- Gerado automaticamente por database/sync-hltv-annual-stats.js.

WITH hltv_stats (
  player_slug, year, hltv_player_id,
  firepower, entrying, trading, opening, clutching, sniping, utility
) AS (
  VALUES
    ('AMANEK', 2020, 9616, 30, 49, 39, 25, 63, 10, 82),
    ('APEX', 2020, 7322, 45, 45, 27, 52, 40, 2, 81),
    ('ART', 2020, 12521, 61, 68, 4, 85, 17, 47, 62),
    ('BOOMBL4', 2020, 11840, 32, 69, 12, 65, 38, 0, 78),
    ('BORUP', 2020, 9896, 27, 83, 28, 37, 46, 0, 73),
    ('BROKY', 2020, 18053, 50, 42, 49, 37, 77, 91, 61),
    ('BROLLAN', 2020, 13666, 83, 25, 22, 75, 46, 0, 63),
    ('CADIAN', 2020, 7964, 52, 26, 27, 73, 61, 93, 89),
    ('COLDZERA', 2020, 9216, 51, 28, 52, 29, 65, 5, 47),
    ('DEVICE', 2020, 7592, 88, 10, 18, 88, 59, 92, 59),
    ('DUPREEH', 2020, 7398, 66, 38, 27, 58, 45, 6, 51),
    ('ELECTRONIC', 2020, 8918, 80, 20, 31, 76, 44, 0, 74),
    ('ELIGE', 2020, 8738, 90, 37, 61, 85, 44, 0, 63),
    ('FLAMIE', 2020, 7594, 27, 29, 27, 22, 50, 8, 62),
    ('FLUSHA', 2020, 3055, 50, 26, 16, 34, 69, 9, 90),
    ('GLA1VE', 2020, 7412, 34, 63, 16, 57, 44, 1, 96),
    ('GOLDEN', 2020, 11110, 22, 53, 24, 45, 40, 1, 83),
    ('GRIM', 2020, 13578, 95, 82, 67, 60, 43, 0, 54),
    ('HEN1', 2020, 8565, 63, 17, 37, 37, 81, 89, 73),
    ('HUNTER', 2020, 3972, 84, 46, 47, 68, 56, 0, 71),
    ('JW', 2020, 3849, 56, 8, 10, 78, 46, 86, 53),
    ('K1TO', 2020, 12781, 38, 51, 13, 52, 43, 10, 66),
    ('KENNYS', 2020, 7167, 54, 27, 35, 69, 40, 93, 67),
    ('KJAERBYE', 2020, 8394, 42, 21, 11, 40, 45, 0, 53),
    ('KRIMZ', 2020, 7528, 69, 26, 60, 24, 65, 1, 81),
    ('KSCERATO', 2020, 15631, 69, 21, 45, 27, 67, 5, 84),
    ('MAGISK', 2020, 9032, 65, 42, 38, 55, 39, 3, 76),
    ('MISUTAAA', 2020, 14176, 25, 90, 64, 39, 31, 0, 29),
    ('NAF', 2020, 8520, 70, 31, 66, 38, 83, 33, 87),
    ('NEXA', 2020, 9618, 59, 57, 55, 23, 70, 0, 76),
    ('NIKO', 2020, 3741, 92, 19, 37, 90, 47, 14, 86),
    ('NIKO-DK', 2020, 10264, 70, 35, 61, 49, 51, 3, 71),
    ('OLOFMEISTER', 2020, 885, 9, 45, 22, 19, 42, 7, 58),
    ('PERFECTO', 2020, 16947, 20, 52, 31, 17, 51, 0, 68),
    ('RAIN', 2020, 8183, 50, 79, 22, 73, 29, 0, 57),
    ('RPK', 2020, 7169, 44, 71, 71, 21, 47, 0, 32),
    ('S1MPLE', 2020, 7998, 97, 11, 47, 80, 79, 93, 61),
    ('SHOX', 2020, 1225, 53, 21, 31, 46, 82, 16, 65),
    ('STAVN', 2020, 10994, 80, 49, 39, 60, 40, 17, 70),
    ('STEWIE2K', 2020, 8797, 36, 78, 15, 77, 38, 26, 80),
    ('SYRSON', 2020, 7266, 71, 7, 19, 91, 68, 97, 54),
    ('TABSEN', 2020, 5794, 76, 31, 31, 54, 45, 2, 95),
    ('TESES', 2020, 12018, 82, 66, 52, 64, 45, 0, 58),
    ('TIZIAN', 2020, 5796, 29, 28, 13, 26, 62, 0, 81),
    ('TWISTZZ', 2020, 10394, 51, 59, 65, 25, 69, 0, 53),
    ('VINI', 2020, 12822, 42, 57, 23, 28, 40, 0, 55),
    ('XANTARES', 2020, 7938, 82, 33, 42, 40, 64, 0, 63),
    ('XYP9X', 2020, 4954, 43, 25, 35, 26, 71, 1, 93),
    ('YUURIH', 2020, 12553, 84, 32, 57, 38, 60, 1, 71),
    ('ZYWOO', 2020, 11893, 96, 62, 51, 88, 77, 90, 71)
), updated AS (
  UPDATE player_team_years pty
  SET firepower = h.firepower,
      entrying = h.entrying,
      trading = h.trading,
      opening = h.opening,
      clutching = h.clutching,
      sniping = h.sniping,
      utility = h.utility
  FROM players p
  JOIN hltv_stats h ON h.player_slug = p.slug
  WHERE pty.player_id = p.id AND pty.year = h.year
  RETURNING pty.id
)
SELECT count(*) AS updated_rows FROM updated;

DO $$
DECLARE invalid_count integer;
BEGIN
  SELECT count(*) INTO invalid_count
  FROM player_team_years
  WHERE year IN (2020)
    AND overall <> round((firepower + entrying + trading + opening + clutching + sniping + utility) / 7.0)::smallint;
  IF invalid_count <> 0 THEN
    RAISE EXCEPTION 'Existem % overalls anuais inconsistentes', invalid_count;
  END IF;
END
$$;
