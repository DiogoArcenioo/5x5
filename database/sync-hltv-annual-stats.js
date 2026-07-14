const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { Client } = require('pg');
require('dotenv').config();

const YEARS = String(process.env.HLTV_YEARS || '2017,2018,2019')
  .split(',')
  .map((year) => Number(year.trim()))
  .filter(Number.isInteger);
const SKILLS = ['firepower', 'entrying', 'trading', 'opening', 'clutching', 'sniping', 'utility'];
const OUTPUT = path.join(
  __dirname,
  'migrations',
  process.env.HLTV_OUTPUT || '015_correct_2017_2019_hltv_stats.sql',
);
const PORT = Number(process.env.HLTV_CDP_PORT || 9224);
const PROFILE = process.env.HLTV_CHROME_PROFILE || path.join(os.tmpdir(), 'codex-hltv-ui-profile2');
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// Nicknames repetidos na HLTV, resolvidos pelo nome real e pais do cadastro.
const PLAYER_ID_OVERRIDES = {
  ADREN: 334,
  ALEX: 8184,
  'ALEX-ES': 8371,
  APEX: 7322,
  ATTACKER: 8552,
  BOLTZ: 8568,
  BUSTER: 11942,
  DEXTER: 9115,
  DROP: 19750,
  FAME: 20101,
  FROZEN: 9960,
  HADES: 16848,
  HUNTER: 3972,
  JACKZ: 284,
  JR: 8786,
  KRIMZ: 7528,
  LUCKY: 13843,
  MAX: 12092,
  NEX: 7256,
  NIFTY: 9069,
  NIKO: 3741,
  'NIKO-DK': 10264,
  RAIN: 8183,
  SICK: 9258,
  STEEL: 7382,
  SUNNY: 5479,
  TAZ: 161,
  TWIST: 7443,
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const normalizeNickname = (value) => String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');

class CdpPage {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl;
    this.sequence = 0;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.webSocketUrl);
    await new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    };
    await this.call('Page.enable');
  }

  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, awaitPromise = false) {
    const result = await this.call('Runtime.evaluate', {
      expression,
      awaitPromise,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Erro no navegador.');
    return result.result.value;
  }

  async navigate(url, readyExpression, timeoutMs = 60000) {
    await this.call('Page.navigate', { url });
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await sleep(300);
      if (await this.evaluate(readyExpression)) return;
    }
    throw new Error(`Timeout carregando ${url}`);
  }

  close() {
    this.socket?.close();
  }
}

async function waitForCdp() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) return;
    } catch (_) {
      // O Chrome ainda esta iniciando.
    }
    await sleep(250);
  }
  throw new Error('Chrome/CDP nao iniciou.');
}

async function openCdpPage() {
  const response = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Nao foi possivel abrir uma aba CDP: HTTP ${response.status}`);
  const target = await response.json();
  const page = new CdpPage(target.webSocketDebuggerUrl);
  await page.connect();
  return page;
}

async function loadTargets(database) {
  const result = await database.query(`
    SELECT pty.year, p.slug, p.nickname, p.display_name, c.code AS country_code
    FROM player_team_years pty
    JOIN players p ON p.id = pty.player_id
    LEFT JOIN countries c ON c.id = p.country_id
    WHERE pty.year IN (${YEARS.join(', ')})
    ORDER BY pty.year, p.slug
  `);
  return result.rows;
}

async function mapHltvPlayers(page, targets) {
  const mapped = [];
  for (const year of YEARS) {
    const annualTargets = targets.filter((target) => target.year === year);
    const keys = [...new Set(annualTargets.map((target) => normalizeNickname(target.nickname)))];
    const url = `https://www.hltv.org/stats/players?startDate=${year}-01-01&endDate=${year}-12-31&minMapCount=1`;
    await page.navigate(
      url,
      `location.search.includes('startDate=${year}-01-01') && document.querySelectorAll('.playerCol a').length > 100`,
    );
    await sleep(800);
    const links = await page.evaluate(`(() => {
      const keys = new Set(${JSON.stringify(keys)});
      const normalize = value => String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
      return [...document.querySelectorAll('.playerCol a')]
        .map(anchor => ({ text: anchor.textContent.trim(), href: anchor.getAttribute('href') }))
        .filter(link => keys.has(normalize(link.text)));
    })()`);

    for (const target of annualTargets) {
      const key = normalizeNickname(target.nickname);
      const candidates = new Map();
      for (const link of links.filter((candidate) => normalizeNickname(candidate.text) === key)) {
        const match = link.href.match(/\/stats\/players\/(\d+)\/([^?]+)/);
        if (match) candidates.set(Number(match[1]), { id: Number(match[1]), hltvSlug: match[2] });
      }
      const options = [...candidates.values()];
      const override = PLAYER_ID_OVERRIDES[target.slug];
      const selected = override ? options.find((option) => option.id === override) : options[0];
      if (!selected || (!override && options.length !== 1)) {
        throw new Error(
          `Mapeamento ambiguo/ausente: ${year} ${target.slug} (${target.display_name}, ${target.country_code}) ` +
          `candidatos=${JSON.stringify(options)}`,
        );
      }
      mapped.push({ ...target, ...selected });
    }
    console.log(`${year}: ${annualTargets.length} jogadores mapeados na HLTV.`);
  }
  return mapped;
}

async function fetchAnnualStats(page, players) {
  const collected = [];
  // A HLTV aplica rate limit agressivo em rajadas. Uma pagina por vez mantem
  // a coleta estavel e o retry cobre renovacoes ocasionais do challenge.
  const batchSize = 1;
  for (let offset = 0; offset < players.length; offset += batchSize) {
    const batch = players.slice(offset, offset + batchSize).map((player) => ({
      ...player,
      url: `/stats/players/${player.id}/${player.hltvSlug}?startDate=${player.year}-01-01&endDate=${player.year}-12-31`,
    }));
    let results;
    for (let attempt = 1; attempt <= 8; attempt += 1) {
      results = await page.evaluate(`(async () => {
        const batch = ${JSON.stringify(batch.map(({ slug, year, url }) => ({ slug, year, url })))};
        return Promise.all(batch.map(async item => {
          const response = await fetch(item.url);
          const html = await response.text();
          const documentCopy = new DOMParser().parseFromString(html, 'text/html');
          const scores = [...documentCopy.querySelectorAll('.row-stats-section-score')]
            .map(element => parseInt(element.childNodes[0]?.textContent, 10))
            .filter(Number.isFinite);
          return {
            ...item,
            status: response.status,
            title: documentCopy.title,
            scores: scores.filter((_, index) => index % 3 === 0),
            rawScoreCount: scores.length,
          };
        }));
      })()`, true);
      if (results.every((result) => result.status === 200 && result.rawScoreCount === 21)) break;
      if (attempt === 8) break;
      const waitMs = Math.min(15000 * attempt, 60000);
      console.log(`Rate limit/challenge em ${batch[0].year} ${batch[0].slug}; retry ${attempt}/8 em ${waitMs / 1000}s.`);
      await sleep(waitMs);
    }

    for (let index = 0; index < results.length; index += 1) {
      const result = results[index];
      if (result.status !== 200 || result.rawScoreCount !== 21 || result.scores.length !== 7) {
        throw new Error(`Stats invalidos para ${result.year} ${result.slug}: ${JSON.stringify(result)}`);
      }
      if (result.scores.some((score) => !Number.isInteger(score) || score < 0 || score > 100)) {
        throw new Error(`Valor fora do intervalo para ${result.year} ${result.slug}.`);
      }
      collected.push({ ...batch[index], scores: result.scores });
    }
    if ((offset + 1) % 10 === 0 || offset + 1 === players.length) {
      console.log(`HLTV: ${offset + 1}/${players.length} paginas coletadas.`);
    }
    await sleep(1300);
  }
  return collected;
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildMigration(rows) {
  const values = rows.map((row) => {
    const fields = [sqlString(row.slug), row.year, row.id, ...row.scores];
    return `    (${fields.join(', ')})`;
  }).join(',\n');

  const yearLabel = YEARS.join(', ');
  return `-- Corrige as fotografias anuais de ${yearLabel} com os atributos HLTV.\n` +
`-- Fonte: https://www.hltv.org/stats/players/<id>/<slug>?startDate=AAAA-01-01&endDate=AAAA-12-31\n` +
`-- Lado usado: Both Sides (primeiro valor de cada atributo).\n` +
`-- Gerado automaticamente por database/sync-hltv-annual-stats.js.\n\n` +
`WITH hltv_stats (\n` +
`  player_slug, year, hltv_player_id,\n` +
`  firepower, entrying, trading, opening, clutching, sniping, utility\n` +
`) AS (\n  VALUES\n${values}\n), updated AS (\n` +
`  UPDATE player_team_years pty\n` +
`  SET firepower = h.firepower,\n` +
`      entrying = h.entrying,\n` +
`      trading = h.trading,\n` +
`      opening = h.opening,\n` +
`      clutching = h.clutching,\n` +
`      sniping = h.sniping,\n` +
`      utility = h.utility\n` +
`  FROM players p\n` +
`  JOIN hltv_stats h ON h.player_slug = p.slug\n` +
`  WHERE pty.player_id = p.id AND pty.year = h.year\n` +
`  RETURNING pty.id\n` +
`)\n` +
`SELECT count(*) AS updated_rows FROM updated;\n\n` +
`DO $$\n` +
`DECLARE invalid_count integer;\n` +
`BEGIN\n` +
`  SELECT count(*) INTO invalid_count\n` +
`  FROM player_team_years\n` +
`  WHERE year IN (${YEARS.join(', ')})\n` +
`    AND overall <> round((firepower + entrying + trading + opening + clutching + sniping + utility) / 7.0)::smallint;\n` +
`  IF invalid_count <> 0 THEN\n` +
`    RAISE EXCEPTION 'Existem % overalls anuais inconsistentes', invalid_count;\n` +
`  END IF;\n` +
`END\n` +
`$$;\n`;
}

async function main() {
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome nao encontrado em ${CHROME}`);
  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--new-window',
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true });

  const database = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  let page;
  try {
    await waitForCdp();
    page = await openCdpPage();
    await database.connect();
    const targets = await loadTargets(database);
    if (!targets.length) throw new Error(`Nenhum vinculo encontrado para os anos ${YEARS.join(', ')}.`);
    const players = await mapHltvPlayers(page, targets);
    const stats = await fetchAnnualStats(page, players);
    if (stats.length !== targets.length) throw new Error(`Esperadas ${targets.length} fotografias; coletadas ${stats.length}.`);
    fs.writeFileSync(OUTPUT, buildMigration(stats), 'utf8');
    console.log(`Migracao gerada: ${OUTPUT}`);
  } finally {
    page?.close();
    await database.end().catch(() => undefined);
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
