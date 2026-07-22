import { randomInt } from 'node:crypto';

export const OPPONENT_FIELD_SIZE = 15;
export const STRONG_OPPONENT_SLOTS = 8;

export type EligibleTeamLineup = {
  teamSlug: string;
  year: number;
  strength: number;
};

export type OpponentFieldEntry = {
  teamSlug: string;
  year: number;
};

type TeamCandidate = {
  teamSlug: string;
  years: number[];
  strength: number;
};

export function drawOpponentField(
  rows: EligibleTeamLineup[],
  randomIndex: (length: number) => number = (length) => randomInt(length),
): OpponentFieldEntry[] {
  const grouped = new Map<string, { years: number[]; strengths: number[] }>();
  for (const row of rows) {
    const candidate = grouped.get(row.teamSlug) ?? { years: [], strengths: [] };
    candidate.years.push(Number(row.year));
    const strength = Number(row.strength);
    candidate.strengths.push(Number.isFinite(strength) ? strength : 0);
    grouped.set(row.teamSlug, candidate);
  }

  const candidates: TeamCandidate[] = [...grouped.entries()].map(([teamSlug, candidate]) => ({
    teamSlug,
    years: candidate.years,
    strength: candidate.strengths.reduce((total, value) => total + value, 0) / candidate.strengths.length,
  }));
  if (candidates.length < OPPONENT_FIELD_SIZE) return [];

  const ranked = [...candidates].sort((first, second) =>
    second.strength - first.strength || first.teamSlug.localeCompare(second.teamSlug),
  );
  const strongPoolSize = Math.max(STRONG_OPPONENT_SLOTS, Math.ceil(ranked.length / 2));
  const strongSelections = shuffle(ranked.slice(0, strongPoolSize), randomIndex)
    .slice(0, STRONG_OPPONENT_SLOTS);
  const selectedSlugs = new Set(strongSelections.map((team) => team.teamSlug));
  const openSelections = shuffle(
    candidates.filter((team) => !selectedSlugs.has(team.teamSlug)),
    randomIndex,
  ).slice(0, OPPONENT_FIELD_SIZE - STRONG_OPPONENT_SLOTS);

  return shuffle([...strongSelections, ...openSelections], randomIndex).map((team) => ({
    teamSlug: team.teamSlug,
    year: team.years[randomIndex(team.years.length)],
  }));
}

function shuffle<T>(items: T[], randomIndex: (length: number) => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const selected = randomIndex(index + 1);
    [result[index], result[selected]] = [result[selected], result[index]];
  }
  return result;
}
