require('ts-node/register');
const test = require('node:test');
const assert = require('node:assert/strict');
const { CasualCleanupService } = require('../src/casual/casual-cleanup.service');
const {
  attachSimulationContext,
  campaignDiagnosticContext,
  createDiagnosticCode,
  simulationContextOf,
} = require('../src/shared/simulation-diagnostics');

test('limpeza diária remove campanhas normais expiradas com uma operação idempotente', async () => {
  const queries = [];
  const dataSource = {
    query: async sql => {
      queries.push(sql);
      return [{ id: 'expired-a' }, { id: 'expired-b' }];
    },
  };
  const service = new CasualCleanupService(dataSource);
  assert.equal(await service.cleanupExpired(), 2);
  assert.equal(queries.length, 1);
  assert.match(queries[0], /DELETE FROM casual_runs WHERE expires_at < now\(\) RETURNING id/);
});

test('diagnóstico associa campanha, etapa e rodada e gera código curto pesquisável', () => {
  const campaign = { stage: 'swiss', swissRound: 3 };
  const error = new Error('falha simulada');
  attachSimulationContext(error, campaignDiagnosticContext(42, 'advance', campaign));
  assert.deepEqual(simulationContextOf(error), {
    campaignId: 42,
    action: 'advance',
    stage: 'swiss',
    round: 3,
  });
  assert.match(createDiagnosticCode(), /^[A-F0-9]{8}$/);
});
