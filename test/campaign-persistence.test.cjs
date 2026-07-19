require('ts-node/register');
const test = require('node:test');
const assert = require('node:assert/strict');
const { ConflictException } = require('@nestjs/common');
const { CasualService } = require('../src/casual/casual.service');
const { RankedService } = require('../src/ranked/ranked.service');
const { RankedSimulationService } = require('../src/ranked/ranked-simulation.service');
const { CatalogManager, makeCatalog, makeField, clone } = require('./simulation-fixtures.cjs');

class MemoryCampaignDataSource extends CatalogManager {
  constructor() { super(makeCatalog()); this.runs = new Map(); this.manager = this; }
  transaction(work) { return work(this); }
  async query(sql, params = []) {
    if (sql.includes('DELETE FROM casual_runs')) return [];
    if (sql.includes('FROM teams t JOIN player_team_years')) {
      return this.rows.map(row => ({ teamSlug: row.teamSlug, year: row.year }));
    }
    if (sql.includes('INSERT INTO casual_runs')) {
      const run = { id: params[0], status: 'in_progress', campaign: JSON.parse(params[1]), campaignRevision: 0, expiresAt: new Date(Date.now() + 172800000), createdAt: new Date(), completedAt: null };
      this.runs.set(run.id, run); return [clone(run)];
    }
    if (sql.includes('UPDATE casual_runs SET campaign=$2::jsonb')) {
      const run = this.runs.get(params[0]); run.campaign = JSON.parse(params[1]); run.campaignRevision = params[2];
      if (params.length > 3 && params[3]) { run.status = 'completed'; run.completedAt ||= new Date(); }
      return [];
    }
    if (sql.includes('FROM casual_runs')) {
      const run = this.runs.get(params[0]); return run ? [clone(run)] : [];
    }
    return super.query(sql, params);
  }
}

class MemoryRankedDataSource extends CatalogManager {
  constructor(campaign) {
    super(makeCatalog()); this.manager = this;
    this.run = { id: 41, userId: 7, cycleId: 1, playedOn: '2026-07-19', status: 'in_progress', score: 0, swissWins: 0, quarterfinalWon: false, semifinalWon: false, finalWon: false, campaign, campaignRevision: 0, createdAt: new Date(), completedAt: null };
  }
  transaction(work) { return work(this); }
  async query(sql, params = []) {
    if (sql.includes("SELECT $1::date = ((now() AT TIME ZONE")) return [{ today: true }];
    if (sql.includes('UPDATE ranked_runs SET campaign = $2::jsonb')) {
      this.run.campaign = JSON.parse(params[1]); this.run.campaignRevision = params[2]; return [];
    }
    if (sql.includes('FROM ranked_runs r')) return params[0] === this.run.id ? [clone(this.run)] : [];
    return super.query(sql, params);
  }
}

test('campanha normal persiste cada mutação, retoma do banco e bloqueia revisão antiga', async () => {
  const dataSource = new MemoryCampaignDataSource();
  const service = new CasualService(dataSource, new RankedSimulationService());
  const started = await service.start();
  assert.equal(started.campaignRevision, 0);
  assert.equal(started.campaign.stage, 'strategy');

  const strategy = await service.strategy(started.id, 0, ['entry', 'awper', 'support', 'rifler', 'lurker']);
  assert.equal(strategy.run.campaignRevision, 1);
  assert.equal(strategy.campaign.stage, 'draft');
  assert.ok(strategy.campaign.draft.currentPool);

  const resumed = await service.get(started.id);
  assert.equal(resumed.campaignRevision, 1);
  assert.deepEqual(resumed.campaign, strategy.campaign);
  await assert.rejects(
    () => service.reroll(started.id, 0),
    error => error instanceof ConflictException && error.getResponse().code === 'CAMPAIGN_REVISION_CONFLICT' && error.getResponse().run.campaignRevision === 1,
  );

  const slug = resumed.campaign.draft.currentPool.slugs[0];
  const picked = await service.pick(started.id, 1, slug, 0);
  assert.equal(picked.run.campaignRevision, 2);
  const resumedAgain = await service.get(started.id);
  assert.equal(resumedAgain.campaign.draft.roster[0].slug, slug);
  assert.equal(resumedAgain.campaignRevision, 2);
});

test('campanha ranked é retomada por outra instância sem perder draft ou revisão', async () => {
  const simulation = new RankedSimulationService();
  const dataSource = new MemoryRankedDataSource(simulation.create(makeField()));
  const cycles = { current: async () => ({ id: 1, field: makeField() }) };
  const firstInstance = new RankedService(dataSource, cycles, simulation);
  const strategy = await firstInstance.strategy(7, 41, 0, ['entry', 'awper', 'support', 'rifler', 'lurker']);
  assert.equal(strategy.run.campaignRevision, 1);
  assert.equal(dataSource.run.campaign.stage, 'draft');

  const secondInstance = new RankedService(dataSource, cycles, new RankedSimulationService());
  const slug = dataSource.run.campaign.draft.currentPool.slugs[0];
  const picked = await secondInstance.pick(7, 41, 1, slug, 0);
  assert.equal(picked.run.campaignRevision, 2);
  assert.equal(dataSource.run.campaign.draft.roster[0].slug, slug);
  assert.equal(dataSource.run.campaign.stage, 'draft');
  await assert.rejects(
    () => secondInstance.reroll(7, 41, 1),
    error => error instanceof ConflictException && error.getResponse().code === 'CAMPAIGN_REVISION_CONFLICT' && error.getResponse().run.campaignRevision === 2,
  );
});
