import type { EntitySchema } from 'typeorm';
import {
  CoachTeamMembershipEntity,
  CoachVersionEntity,
  CountryEntity,
  DataProviderEntity,
  HintTypeEntity,
  LineupEntity,
  LineupMemberEntity,
  MapEntity,
  PerformanceMetricDefinitionEntity,
  PlayerAliasEntity,
  PlayerExternalReferenceEntity,
  PlayerPerformanceMetricValueEntity,
  PlayerPerformancePeriodEntity,
  PlayerSourceAttributeScoreEntity,
  PlayerTeamMembershipEntity,
  PlayerVersionEntity,
  PlayerVersionGameRatingEntity,
  PlayerVersionMapRatingEntity,
  PlayerVersionRoleEntity,
  RegionEntity,
  RoleEntity,
  SeasonEntity,
  SeasonMapPoolEntity,
  TeamEntity,
  TournamentEditionEntity,
  TournamentEntryEntity,
  TournamentEntity,
  TournamentRosterMemberEntity,
} from '../database/entities';

export interface ResourceDefinition {
  entity: EntitySchema;
  label: string;
  description: string;
  searchFields: string[];
}

export const RESOURCE_REGISTRY: Record<string, ResourceDefinition> = {
  regions: { entity: RegionEntity, label: 'Regiões', description: 'Regiões competitivas.', searchFields: ['code', 'name'] },
  countries: { entity: CountryEntity, label: 'Países', description: 'Países e vínculo regional.', searchFields: ['code', 'name'] },
  seasons: { entity: SeasonEntity, label: 'Temporadas', description: 'Períodos competitivos e versão do jogo.', searchFields: ['code', 'name'] },
  teams: { entity: TeamEntity, label: 'Times', description: 'Organizações competitivas, sem imagens nesta fase.', searchFields: ['name', 'shortName', 'slug'] },
  roles: { entity: RoleEntity, label: 'Funções', description: 'Funções competitivas atribuíveis aos jogadores.', searchFields: ['code', 'name', 'category'] },
  maps: { entity: MapEntity, label: 'Mapas', description: 'Catálogo histórico de mapas.', searchFields: ['code', 'name'] },
  'season-map-pool': { entity: SeasonMapPoolEntity, label: 'Map pool', description: 'Mapas disponíveis em cada temporada.', searchFields: [] },
  'player-aliases': { entity: PlayerAliasEntity, label: 'Aliases', description: 'Nomes aceitos para busca e adivinhação.', searchFields: ['alias', 'normalizedAlias'] },
  'player-memberships': { entity: PlayerTeamMembershipEntity, label: 'Passagens de jogadores', description: 'Períodos de vínculo entre jogador e time.', searchFields: ['rosterStatus'] },
  'coach-memberships': { entity: CoachTeamMembershipEntity, label: 'Passagens de coaches', description: 'Períodos de vínculo entre coach e time.', searchFields: ['roleLabel'] },
  'player-versions': { entity: PlayerVersionEntity, label: 'Versões de jogadores', description: 'Jogador contextualizado por time e temporada.', searchFields: ['versionLabel', 'dataQuality'] },
  'coach-versions': { entity: CoachVersionEntity, label: 'Versões de coaches', description: 'Coach contextualizado por time e temporada.', searchFields: [] },
  'player-version-roles': { entity: PlayerVersionRoleEntity, label: 'Funções por versão', description: 'Proficiência de cada versão nas funções.', searchFields: [] },
  'player-version-ratings': { entity: PlayerVersionGameRatingEntity, label: 'Ratings internos', description: 'Atributos utilizados pelo motor do jogo.', searchFields: ['ratingModelVersion', 'calculationMethod'] },
  'player-map-ratings': { entity: PlayerVersionMapRatingEntity, label: 'Ratings por mapa', description: 'Desempenho e experiência da versão por mapa.', searchFields: ['sourceType'] },
  lineups: { entity: LineupEntity, label: 'Lineups', description: 'Elencos históricos de uma organização.', searchFields: ['name'] },
  'lineup-members': { entity: LineupMemberEntity, label: 'Membros de lineup', description: 'Jogadores e status em uma lineup.', searchFields: ['rosterStatus'] },
  tournaments: { entity: TournamentEntity, label: 'Campeonatos', description: 'Séries ou identidades de campeonatos.', searchFields: ['name', 'organizer', 'tournamentType'] },
  'tournament-editions': { entity: TournamentEditionEntity, label: 'Edições', description: 'Edições concretas de campeonatos.', searchFields: ['name', 'tier', 'gameVersion'] },
  'tournament-entries': { entity: TournamentEntryEntity, label: 'Participações', description: 'Participação e colocação dos times.', searchFields: ['stageReached'] },
  'tournament-rosters': { entity: TournamentRosterMemberEntity, label: 'Rosters inscritos', description: 'Jogadores registrados em cada participação.', searchFields: ['registrationStatus'] },
  providers: { entity: DataProviderEntity, label: 'Fontes', description: 'Provedores, permissões e observações de uso.', searchFields: ['code', 'name', 'usageStatus'] },
  'external-player-references': { entity: PlayerExternalReferenceEntity, label: 'Referências externas', description: 'IDs do jogador em fontes externas.', searchFields: ['externalPlayerId'] },
  'performance-periods': { entity: PlayerPerformancePeriodEntity, label: 'Períodos estatísticos', description: 'Snapshots anuais, por passagem ou janela móvel.', searchFields: ['periodType', 'ratingSystem', 'dataQuality'] },
  'source-attribute-scores': { entity: PlayerSourceAttributeScoreEntity, label: 'Atributos observados', description: 'Rating, Firepower, Entrying, Trading e demais métricas.', searchFields: ['metricSetVersion'] },
  'metric-definitions': { entity: PerformanceMetricDefinitionEntity, label: 'Métricas extensíveis', description: 'Catálogo de métricas adicionais por provedor.', searchFields: ['code', 'displayName', 'metricFamily', 'unit'] },
  'performance-metric-values': { entity: PlayerPerformanceMetricValueEntity, label: 'Valores de métricas', description: 'Valores adicionais vinculados ao período estatístico.', searchFields: ['textValue', 'rawDisplayValue'] },
  'hint-types': { entity: HintTypeEntity, label: 'Tipos de dica', description: 'Dicas, custos e ordem do minigame.', searchFields: ['code', 'name', 'resolverKey'] },
};
