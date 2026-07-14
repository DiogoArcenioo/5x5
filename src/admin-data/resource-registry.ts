import type { EntitySchema } from 'typeorm';
import {
  CountryEntity,
  PlayerTeamYearEntity,
  RegionEntity,
  TeamEntity,
} from '../database/entities';

export interface ResourceDefinition {
  entity: EntitySchema;
  label: string;
  description: string;
  searchFields: string[];
}

export const RESOURCE_REGISTRY: Record<string, ResourceDefinition> = {
  regions: {
    entity: RegionEntity,
    label: 'Regiões',
    description: 'Regiões dos países.',
    searchFields: ['code', 'name'],
  },
  countries: {
    entity: CountryEntity,
    label: 'Países',
    description: 'Países vinculados a uma região.',
    searchFields: ['code', 'name'],
  },
  teams: {
    entity: TeamEntity,
    label: 'Times',
    description: 'Times disponíveis no jogo.',
    searchFields: ['name', 'shortName', 'slug'],
  },
  'player-team-years': {
    entity: PlayerTeamYearEntity,
    label: 'Vínculos anuais',
    description: 'Jogador vinculado a um time entre 2017 e 2026.',
    searchFields: ['year'],
  },
};
