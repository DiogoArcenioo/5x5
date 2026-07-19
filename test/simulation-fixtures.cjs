const makeCatalog = (teamCount = 20) => {
  const rows = [];
  for (let team = 1; team <= teamCount; team++) {
    for (let player = 1; player <= 5; player++) {
      const base = 48 + ((team * 7 + player * 5) % 35);
      rows.push({
        slug: `player-${team}-${player}`, nick: `Player ${team}-${player}`,
        code: team % 3 === 0 ? 'BR' : team % 3 === 1 ? 'DK' : 'FR',
        countryName: team % 3 === 0 ? 'Brasil' : team % 3 === 1 ? 'Dinamarca' : 'França',
        teamSlug: `team-${team}`, teamName: `Team ${team}`, year: 2020 + (team % 6),
        overall: base, firepower: base + 3, entrying: base - 2, trading: base + 1,
        opening: base + 2, clutching: base - 1, sniping: base + (player === 2 ? 12 : -4), utility: base + (player === 3 ? 10 : 0),
      });
    }
  }
  return rows;
};

const makeField = (count = 15) => Array.from({ length: count }, (_, index) => ({
  teamSlug: `team-${index + 1}`, year: 2020 + ((index + 1) % 6),
}));

class CatalogManager {
  constructor(rows = makeCatalog()) { this.rows = rows; }
  async query(sql, params = []) {
    if (sql.includes('array_agg(DISTINCT p.slug')) {
      const used = new Set(params[0] || []);
      const groups = new Map();
      for (const row of this.rows.filter(item => !used.has(item.slug))) {
        const key = `${row.year}:${row.teamSlug}`;
        const group = groups.get(key) || { year: row.year, teamSlug: row.teamSlug, slugs: [] };
        group.slugs.push(row.slug); groups.set(key, group);
      }
      return [...groups.values()];
    }
    if (sql.includes('SELECT p.slug,p.nickname AS nick')) return this.rows.map(row => ({ ...row }));
    throw new Error(`SQL não previsto no catálogo de teste: ${sql.slice(0, 90)}`);
  }
}

const clone = value => JSON.parse(JSON.stringify(value));

module.exports = { makeCatalog, makeField, CatalogManager, clone };
