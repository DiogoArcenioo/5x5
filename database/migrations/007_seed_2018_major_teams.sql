WITH team_data (name, short_name, slug, country_code) AS (
  VALUES
    ('QUANTUM BELLATOR FIRE', 'QBF', 'QUANTUM-BELLATOR-FIRE', 'RU'),
    ('SPACE SOLDIERS', 'SS', 'SPACE-SOLDIERS', 'TR'),
    ('SPROUT', 'SPR', 'SPROUT', 'DE'),
    ('MISFITS GAMING', 'MSF', 'MISFITS-GAMING', 'US'),
    ('AVANGAR', 'AVG', 'AVANGAR', 'KZ'),
    ('RENEGADES', 'RNG', 'RENEGADES', 'AU'),
    ('FLASH GAMING', 'FLASH', 'FLASH-GAMING', 'CN'),
    ('100 THIEVES', '100T', '100-THIEVES', 'BR'),
    ('MIBR', 'MIBR', 'MIBR', 'BR'),
    ('COMPLEXITY GAMING', 'COL', 'COMPLEXITY-GAMING', 'US'),
    ('WINSTRIKE TEAM', 'WIN', 'WINSTRIKE-TEAM', 'RU'),
    ('NINJAS IN PYJAMAS', 'NIP', 'NINJAS-IN-PYJAMAS', 'SE'),
    ('ROGUE', 'ROGUE', 'ROGUE', 'US'),
    ('TYLOO', 'TYLOO', 'TYLOO', 'CN'),
    ('TEAM SPIRIT', 'SPIRIT', 'TEAM-SPIRIT', 'RU')
)
INSERT INTO teams (name, short_name, slug, country_id)
SELECT
  team_data.name,
  team_data.short_name,
  team_data.slug,
  countries.id
FROM team_data
JOIN countries ON countries.code = team_data.country_code
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  country_id = EXCLUDED.country_id,
  updated_at = now();
