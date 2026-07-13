import { CORE_ENTITIES } from './core.entities';
import { COMPETITION_ENTITIES } from './competition.entities';
import { STATISTICS_ENTITIES } from './statistics.entities';

export * from './core.entities';
export * from './competition.entities';
export * from './statistics.entities';

export const ALL_ENTITIES = [
  ...CORE_ENTITIES,
  ...COMPETITION_ENTITIES,
  ...STATISTICS_ENTITIES,
];
