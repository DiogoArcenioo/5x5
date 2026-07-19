require('ts-node/register');
const test = require('node:test');
const assert = require('node:assert/strict');
const { ConflictException } = require('@nestjs/common');
const { RankedSimulationService } = require('../src/ranked/ranked-simulation.service');
const { CatalogManager, makeField, clone } = require('./simulation-fixtures.cjs');

const balanced = ['entry', 'awper', 'support', 'rifler', 'lurker'];

async function draftComplete(service, manager) {
  const campaign = service.create(makeField());
  await service.strategy(manager, campaign, balanced);
  for (let slot = 0; slot < 5; slot++) {
    const slug = campaign.draft.currentPool.slugs[0];
    await service.pick(manager, campaign, slug, slot);
  }
  return campaign;
}

test('draft oficial sorteia, impede escolha duplicada e gera análise no quinto jogador', async () => {
  const service = new RankedSimulationService(), manager = new CatalogManager();
  const campaign = service.create(makeField());
  await service.strategy(manager, campaign, balanced);
  assert.equal(campaign.stage, 'draft');
  assert.equal(campaign.draft.currentPool.slugs.length, 5);
  const first = campaign.draft.currentPool.slugs[0];
  await service.pick(manager, campaign, first, 0);
  await assert.rejects(() => service.pick(manager, campaign, first, 1), ConflictException);
  for (let slot = 1; slot < 5; slot++) await service.pick(manager, campaign, campaign.draft.currentPool.slugs[0], slot);
  assert.equal(campaign.draft.roster.filter(Boolean).length, 5);
  assert.equal(campaign.draft.currentPool, null);
  assert.equal(campaign.analysis.evaluation.players.length, 5);
  assert.ok(campaign.analysis.strength > 0);
  assert.ok(campaign.analysis.strengths.length > 0);
});

test('troca de layout recalcula a análise e persiste a ordem oficial', async () => {
  const service = new RankedSimulationService(), manager = new CatalogManager();
  const campaign = await draftComplete(service, manager);
  const slugs = campaign.draft.roster.map(item => item.slug).reverse();
  await service.layout(manager, campaign, slugs, balanced);
  assert.deepEqual(campaign.draft.roster.map(item => item.slug), slugs);
  assert.deepEqual(campaign.analysis.evaluation.players.map(item => item.player.slug), slugs);
});

test('fase suíça termina com três vitórias ou três derrotas e concede 10 pontos por vitória', async () => {
  const service = new RankedSimulationService(), manager = new CatalogManager();
  const campaign = await draftComplete(service, manager); campaign.seed = 918273;
  await service.finalize(manager, campaign);
  let score = 0, swissWins = 0, safety = 0;
  while (campaign.stage === 'swiss' && safety++ < 6) {
    const result = service.advance(campaign); score += result.awarded;
    if (result.eventType === 'swiss_win') swissWins++;
    assert.equal(result.awarded, result.eventType === 'swiss_win' ? 10 : 0);
  }
  const user = campaign.teams.find(team => team.id === 'user');
  assert.ok(user.wins === 3 || user.losses === 3);
  assert.equal(score, swissWins * 10);
  assert.ok(campaign.swissRound >= 3 && campaign.swissRound <= 5);
});

test('playoffs respeitam quartas/semi +30 e final +50 até concluir a campanha', async () => {
  const service = new RankedSimulationService(), manager = new CatalogManager();
  const campaign = await draftComplete(service, manager); await service.finalize(manager, campaign);
  campaign.seed = 1;
  campaign.teams.forEach(team => { team.strength = team.id === 'user' ? 1000 : 0; });
  const events = [];
  while (campaign.stage !== 'completed') {
    const result = service.advance(campaign); if (result.eventType) events.push([result.eventType, result.awarded]);
  }
  assert.equal(campaign.outcome.kind, 'champion');
  const playoffEvents = events.filter(([event]) => event !== 'swiss_win');
  assert.deepEqual(playoffEvents, [['quarterfinal_win', 30], ['semifinal_win', 30], ['final_win', 50]]);
  assert.equal(campaign.playoffBracket[2].matches[0].result.winnerId, 'user');
});

test('campanha serializada retoma de forma determinística no mesmo ponto', async () => {
  const service = new RankedSimulationService(), manager = new CatalogManager();
  const campaign = await draftComplete(service, manager); campaign.seed = 7357; await service.finalize(manager, campaign);
  service.advance(campaign);
  const restored = JSON.parse(JSON.stringify(campaign));
  const expected = service.advance(campaign), resumed = service.advance(restored);
  assert.deepEqual(resumed, expected);
  assert.deepEqual(restored, campaign);
});
