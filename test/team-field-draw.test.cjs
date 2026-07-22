require('ts-node/register');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  drawOpponentField,
  OPPONENT_FIELD_SIZE,
  STRONG_OPPONENT_SLOTS,
} = require('../src/shared/team-field-draw');

const deterministicIndex = (length) => Math.max(0, length - 1);

test('reserva oito vagas para a metade superior e não repete times', () => {
  const rows = Array.from({ length: 30 }, (_, index) => ({
    teamSlug: `team-${String(index + 1).padStart(2, '0')}`,
    year: 2026,
    strength: index + 1,
  }));
  const field = drawOpponentField(rows, deterministicIndex);
  const strongTeams = new Set(rows.slice(15).map((row) => row.teamSlug));

  assert.equal(field.length, OPPONENT_FIELD_SIZE);
  assert.equal(new Set(field.map((team) => team.teamSlug)).size, OPPONENT_FIELD_SIZE);
  assert.ok(
    field.filter((team) => strongTeams.has(team.teamSlug)).length >= STRONG_OPPONENT_SLOTS,
  );
});

test('continua sorteando uma temporada válida do time escolhido', () => {
  const rows = Array.from({ length: 15 }, (_, index) => [2024, 2025, 2026].map((year) => ({
    teamSlug: `team-${index + 1}`,
    year,
    strength: 50 + index,
  }))).flat();
  const field = drawOpponentField(rows, deterministicIndex);

  assert.equal(field.length, 15);
  assert.ok(field.every((team) => team.year === 2026));
});
