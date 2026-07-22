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

function makeResultsFollowStrength(service) {
  service.series = (a, b, _seed, format) => {
    const winner = a.strength >= b.strength ? a : b;
    const loser = winner === a ? b : a;
    return {
      aId: a.id, bId: b.id, teamA: a.name, teamB: b.name,
      winnerId: winner.id, loserId: loser.id, format,
      score: format === 'BO1' ? (winner === a ? '13–0' : '0–13') : (winner === a ? '2–0' : '0–2'),
      chanceA: winner === a ? 1 : 0, effectiveA: a.strength, effectiveB: b.strength,
      isUser: Boolean(a.isUser || b.isUser), pool: '', mapResults: [],
    };
  };
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

test('registra exatamente a fase em que o usuário foi eliminado', async () => {
  for (const expectedStage of ['swiss', 'quarter', 'semi', 'final']) {
    const service = new RankedSimulationService(), manager = new CatalogManager();
    makeResultsFollowStrength(service);
    const campaign = await draftComplete(service, manager);
    await service.finalize(manager, campaign);
    campaign.teams.forEach(team => { team.strength = team.id === 'user' ? 1000 : 0; });

    if (expectedStage === 'swiss') {
      campaign.teams.find(team => team.id === 'user').strength = -1000;
    } else {
      while (campaign.stage === 'swiss') service.advance(campaign);
      const winsBeforeElimination = { quarter: 0, semi: 1, final: 2 }[expectedStage];
      for (let index = 0; index < winsBeforeElimination; index++) service.advance(campaign);
      campaign.teams.find(team => team.id === 'user').strength = -1000;
    }

    while (campaign.stage !== 'completed') service.advance(campaign);
    assert.equal(campaign.outcome.kind, 'eliminated');
    assert.equal(campaign.outcome.eliminationStage, expectedStage);
    if (expectedStage === 'swiss') {
      assert.equal(campaign.outcome.eliminationRound, 3);
      assert.equal(campaign.outcome.eliminationRecord, '0-3');
    }
  }
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

test('mapas usam MR12 e overtime MR3 repetivel sem permitir placar 13 a 12', async () => {
  const service = new RankedSimulationService(), manager = new CatalogManager();
  const campaign = await draftComplete(service, manager);
  await service.finalize(manager, campaign);
  const [teamA, teamB] = campaign.teams;
  let sawOvertime = false, sawRepeatedOvertime = false;

  for (let seed = 1; seed <= 2000; seed++) {
    const result = service.map(teamA, teamB, 'Mirage', service.rng(seed));
    const winnerScore = Math.max(result.aScore, result.bScore);
    const loserScore = Math.min(result.aScore, result.bScore);

    assert.notEqual(result.aScore, result.bScore);
    assert.notDeepEqual([winnerScore, loserScore], [13, 12]);

    if (result.overtimePeriods === 0) {
      assert.equal(winnerScore, 13);
      assert.ok(loserScore <= 11);
      assert.ok(result.rounds.every(round => round.period === 'regulation' && round.overtimePeriod === 0));
      continue;
    }

    sawOvertime = true;
    assert.equal(winnerScore, 13 + result.overtimePeriods * 3);
    assert.ok(winnerScore - loserScore >= 2);
    assert.ok(winnerScore - loserScore <= 4);

    const regulation = result.rounds.filter(round => round.period === 'regulation');
    assert.equal(regulation.length, 24);
    assert.equal(regulation.at(-1).scoreA, 12);
    assert.equal(regulation.at(-1).scoreB, 12);

    for (let period = 1; period <= result.overtimePeriods; period++) {
      const overtime = result.rounds.filter(round => round.overtimePeriod === period);
      assert.ok(overtime.length >= 4 && overtime.length <= 6);
      if (period < result.overtimePeriods) {
        assert.equal(overtime.length, 6);
        assert.equal(overtime.at(-1).scoreA, overtime.at(-1).scoreB);
      }
    }
    if (result.overtimePeriods > 1) sawRepeatedOvertime = true;
  }

  assert.ok(sawOvertime, 'a amostra deve conter ao menos um overtime');
  assert.ok(sawRepeatedOvertime, 'a amostra deve conter ao menos um overtime repetido');
});
